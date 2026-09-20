import { Centrifuge, Subscription } from 'centrifuge'
import { useCallback, useEffect, useRef, useState } from 'react'

import { getTokenSocket } from '@/apis/talkRoomApis'

type TalkroomSocketType = {
	roomId: string
	enabled?: boolean
	onRoomEvent?: (event: string, data: any) => void
	/** Called when the room channel subscribes again after a drop, so state can be refetched. */
	onResubscribed?: () => void
}

/**
 * Centrifugo only accepts a websocket at /connection/websocket, but the
 * deployed environment variable has been set to the bare host more than once,
 * and a bare host answers the upgrade with an HTML page instead, so the room
 * channel never subscribes and no event ever arrives (UD-367). Append the path
 * when it is missing rather than depending on whoever edits the variable next.
 */
export const centrifugoEndpoint = (url?: string) => {
	if (!url) return url
	const trimmed = url.replace(/[/]+$/, '')
	if (trimmed.endsWith('/connection/websocket')) return trimmed
	return `${trimmed}/connection/websocket`
}

/** Normalizes server events and client emit payloads from Centrifugo. */
export const normalizeTalkRoomSocketPublication = (message?: {
	data?: Record<string, unknown>
	event?: string
	user_id?: string
	payload?: Record<string, unknown>
}) => {
	if (!message) return { event: undefined, payload: undefined }

	const event =
		(message.data?.event_type as string | undefined) ?? message.event

	const payload =
		message.data ??
		({
			user_id: message.user_id,
			...(message.payload ?? {}),
		} as Record<string, unknown>)

	return { event, payload }
}

export default function useTalkRoomSocket(props: TalkroomSocketType) {
	const { roomId, onRoomEvent, onResubscribed, enabled = false } = props
	const centrifugeRef = useRef<Centrifuge | null>(null)
	const subscriptionRef = useRef<Subscription | null>(null)
	const onRoomEventRef = useRef(onRoomEvent)
	const onResubscribedRef = useRef(onResubscribed)
	const [isConnected, setIsConnected] = useState<boolean>(false)

	onRoomEventRef.current = onRoomEvent
	onResubscribedRef.current = onResubscribed

	const emitRoomEvent = useCallback(
		(
			userId: string,
			event: string,
			payload: Record<string, unknown>,
		) => {
			if (!userId || !subscriptionRef.current) return

			subscriptionRef.current
				.publish({
					user_id: userId,
					event,
					payload,
				})
				.catch(() => undefined)
		},
		[],
	)

	useEffect(() => {
		if (!enabled || !roomId) return

		let cancelled = false

		const connect = async () => {
			if (centrifugeRef.current) return

			const res: any = await getTokenSocket()
			const token = res?.results?.object?.socket_token
			if (!token || cancelled) return

			const centrifuge = new Centrifuge(
				centrifugoEndpoint(
					process.env.NEXT_PUBLIC_CENTRIFUGAL_SOCKET_URL,
				) as string,
				{
					token: token,
				},
			)

			centrifuge.on('connected', () => {
				setIsConnected(true)
			})
			centrifuge.on('disconnected', () => {
				setIsConnected(false)
			})

			const subcribe = centrifuge.newSubscription(`public:${roomId}`)

			subcribe.on('publication', (ctx) => {
				const message = ctx.data
				const { event, payload } = normalizeTalkRoomSocketPublication(message)

				if (!event) return
				onRoomEventRef.current?.(event, payload)
			})

			// Events published while the channel was down are lost, so every
			// subscribe after the first one asks the caller to refetch room state.
			let subscribedOnce = false
			subcribe.on('subscribed', () => {
				if (subscribedOnce) onResubscribedRef.current?.()
				subscribedOnce = true
			})
			subcribe.on('error', (ctx) => {
				console.warn('[TalkRoomSocket] subscription error', ctx?.error)
			})
			centrifuge.on('error', (ctx) => {
				console.warn('[TalkRoomSocket] connection error', ctx?.error)
			})

			subcribe.subscribe()
			centrifuge.connect()

			centrifugeRef.current = centrifuge
			subscriptionRef.current = subcribe
		}

		connect()

		return () => {
			cancelled = true
			subscriptionRef.current?.unsubscribe()
			subscriptionRef.current?.removeAllListeners()
			subscriptionRef.current = null
			centrifugeRef.current?.disconnect()
			centrifugeRef.current = null
			setIsConnected(false)
		}
	}, [roomId, enabled])

	return { isConnected, emitRoomEvent }
}
