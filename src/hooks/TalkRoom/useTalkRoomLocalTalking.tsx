'use client'

import { useEffect, useRef, useState } from 'react'
import { useRTCClient } from 'agora-rtc-react'

const TALKING_VOLUME_THRESHOLD = 40

type VolumeIndicatorVolume = {
	uid: number
	level: number
}

type VolumeIndicatorClient = {
	enableAudioVolumeIndicator: () => void
	on: (
		event: 'volume-indicator',
		handler: (volumes: VolumeIndicatorVolume[]) => void,
	) => void
	off: (
		event: 'volume-indicator',
		handler: (volumes: VolumeIndicatorVolume[]) => void,
	) => void
}

type UseTalkRoomLocalTalkingProps = {
	enabled?: boolean
	micEnabled?: boolean
	agoraUid?: number
}

/** Detects local voice activity via Agora volume indicator for speaker stage UI. */
export default function useTalkRoomLocalTalking({
	enabled = false,
	micEnabled = false,
	agoraUid,
}: UseTalkRoomLocalTalkingProps) {
	const client = useRTCClient() as VolumeIndicatorClient | null
	const [isTalking, setIsTalking] = useState(false)
	const isTalkingRef = useRef(false)

	useEffect(() => {
		if (!enabled || !micEnabled || !client) {
			if (isTalkingRef.current) {
				isTalkingRef.current = false
				setIsTalking(false)
			}
			return
		}

		const handleVolumeIndicator = (
			volumes: { uid: number; level: number }[],
		) => {
			const localVolume =
				volumes.find(
					(volume) =>
						volume.uid === 0 ||
						(agoraUid !== undefined && volume.uid === agoraUid),
				)?.level ?? 0
			const nextTalking = localVolume > TALKING_VOLUME_THRESHOLD

			if (nextTalking === isTalkingRef.current) return

			isTalkingRef.current = nextTalking
			setIsTalking(nextTalking)
		}

		client.enableAudioVolumeIndicator()
		client.on('volume-indicator', handleVolumeIndicator)

		return () => {
			client.off('volume-indicator', handleVolumeIndicator)
			if (isTalkingRef.current) {
				isTalkingRef.current = false
				setIsTalking(false)
			}
		}
	}, [enabled, micEnabled, client, agoraUid])

	return isTalking
}
