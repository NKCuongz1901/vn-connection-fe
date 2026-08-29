'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const WHEP_RETRY_DELAY_MS = 2000

const WHEP_HEADERS = {
	'Content-Type': 'application/sdp',
	Accept: 'application/sdp',
}

type UseTalkRoomWhepProps = {
	streamWssUrl?: string | null
	enabled?: boolean
}

const normalizeWhepUrl = (url: string) => {
	const parsed = new URL(url)
	if (!parsed.pathname.endsWith('/')) {
		parsed.pathname = `${parsed.pathname}/`
	}

	return parsed.toString()
}

/** Resolves relative redirect Location headers against the WHEP base URL. */
const resolveRedirectUrl = (location: string, baseUrl: string) => {
	if (location.startsWith('http://') || location.startsWith('https://')) {
		return normalizeWhepUrl(location)
	}

	return normalizeWhepUrl(new URL(location, baseUrl).toString())
}

/** Posts WHEP offer SDP and handles SRS 301/302 redirects without losing POST body. */
const postWhepOffer = async (whepUrl: string, offerSdp: string) => {
	const normalizedUrl = normalizeWhepUrl(whepUrl)

	let response = await fetch(normalizedUrl, {
		method: 'POST',
		redirect: 'manual',
		headers: WHEP_HEADERS,
		body: offerSdp,
	})

	if (response.status === 301 || response.status === 302) {
		const location = response.headers.get('Location')
		if (!location) {
			throw new Error('WHEP redirect missing Location header')
		}

		const redirectUrl = resolveRedirectUrl(location, normalizedUrl)
		response = await fetch(redirectUrl, {
			method: 'POST',
			redirect: 'manual',
			headers: WHEP_HEADERS,
			body: offerSdp,
		})
	}

	if (response.status !== 200 && response.status !== 201) {
		throw new Error(`WHEP connect failed: ${response.status}`)
	}

	const answerSdp = await response.text()
	if (!answerSdp) {
		throw new Error('WHEP answer SDP is empty')
	}

	return answerSdp
}

const waitForIceGathering = (pc: RTCPeerConnection, timeoutMs = 3000) => {
	if (pc.iceGatheringState === 'complete') return Promise.resolve()

	return new Promise<void>((resolve) => {
		const handleStateChange = () => {
			if (pc.iceGatheringState !== 'complete') return

			pc.removeEventListener('icegatheringstatechange', handleStateChange)
			clearTimeout(timeoutId)
			resolve()
		}

		const timeoutId = setTimeout(() => {
			pc.removeEventListener('icegatheringstatechange', handleStateChange)
			resolve()
		}, timeoutMs)

		pc.addEventListener('icegatheringstatechange', handleStateChange)
	})
}

export default function useTalkRoomWhep({
	streamWssUrl,
	enabled = false,
}: UseTalkRoomWhepProps) {
	const audioRef = useRef<HTMLAudioElement | null>(null)
	const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
	const connectRequestRef = useRef(0)
	const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const shouldRetryRef = useRef(false)
	const connectRef = useRef<() => Promise<boolean>>(async () => false)

	const [isConnected, setIsConnected] = useState(false)
	const [isConnecting, setIsConnecting] = useState(false)
	const [error, setError] = useState<Error | null>(null)

	const canUseWhep = enabled && !!streamWssUrl

	const clearRetryTimer = useCallback(() => {
		if (!retryTimerRef.current) return

		clearTimeout(retryTimerRef.current)
		retryTimerRef.current = null
	}, [])

	const cleanupPeerConnection = useCallback(() => {
		const pc = peerConnectionRef.current
		peerConnectionRef.current = null

		pc?.getReceivers().forEach((receiver) => {
			receiver.track?.stop()
		})
		pc?.close()

		if (audioRef.current) {
			audioRef.current.srcObject = null
		}
	}, [])

	const scheduleRetry = useCallback(() => {
		if (!shouldRetryRef.current || !streamWssUrl) return

		clearRetryTimer()
		retryTimerRef.current = setTimeout(() => {
			retryTimerRef.current = null
			if (!shouldRetryRef.current) return

			connectRef.current()
		}, WHEP_RETRY_DELAY_MS)
	}, [clearRetryTimer, streamWssUrl])

	const disconnect = useCallback(async () => {
		shouldRetryRef.current = false
		connectRequestRef.current += 1
		clearRetryTimer()
		cleanupPeerConnection()
		setIsConnected(false)
		setIsConnecting(false)
	}, [clearRetryTimer, cleanupPeerConnection])

	const connect = useCallback(async () => {
		if (!canUseWhep || !streamWssUrl) return false

		const requestId = connectRequestRef.current + 1
		connectRequestRef.current = requestId
		setIsConnecting(true)
		setError(null)

		cleanupPeerConnection()
		if (connectRequestRef.current !== requestId) return false

		try {
			const pc = new RTCPeerConnection({
				iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
			})
			peerConnectionRef.current = pc

			pc.addTransceiver('audio', { direction: 'recvonly' })

			pc.ontrack = (event) => {
				const audio = audioRef.current
				if (!audio) return

				const stream = event.streams[0] ?? new MediaStream([event.track])
				audio.srcObject = stream
				audio.play().catch(() => undefined)
				setIsConnected(true)
				clearRetryTimer()
			}

			const offer = await pc.createOffer()
			await pc.setLocalDescription(offer)
			await waitForIceGathering(pc)

			const localSdp = pc.localDescription?.sdp
			if (!localSdp) {
				throw new Error('WHEP offer SDP is empty')
			}

			if (connectRequestRef.current !== requestId) return false

			const answerSdp = await postWhepOffer(streamWssUrl, localSdp)

			if (connectRequestRef.current !== requestId) return false

			await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp })

			setIsConnected(true)
			clearRetryTimer()
			return true
		} catch (connectError) {
			if (connectRequestRef.current !== requestId) return false

			const nextError =
				connectError instanceof Error
					? connectError
					: new Error(String(connectError))

			setError(nextError)
			console.error('[WHEP] connect failed', nextError)

			cleanupPeerConnection()
			setIsConnected(false)
			scheduleRetry()
			return false
		} finally {
			if (connectRequestRef.current === requestId) {
				setIsConnecting(false)
			}
		}
	}, [
		canUseWhep,
		streamWssUrl,
		cleanupPeerConnection,
		clearRetryTimer,
		scheduleRetry,
	])

	useEffect(() => {
		connectRef.current = connect
	}, [connect])

	useEffect(() => {
		shouldRetryRef.current = canUseWhep

		if (!canUseWhep) {
			disconnect()
		}

		return () => {
			shouldRetryRef.current = false
			clearRetryTimer()
		}
	}, [canUseWhep, disconnect, clearRetryTimer])

	return {
		audioRef,
		connect,
		disconnect,
		isConnected,
		isConnecting,
		error,
		canUseWhep,
	}
}
