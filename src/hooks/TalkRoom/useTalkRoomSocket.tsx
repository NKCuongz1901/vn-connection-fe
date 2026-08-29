import { Centrifuge, Subscription } from 'centrifuge'
import { useCallback, useEffect, useRef, useState } from 'react'

import { getTokenSocket } from '@/apis/talkRoomApis'

type TalkroomSocketType = {
	roomId: string
	enabled?: boolean
	onRoomEvent?: (event: string, data: any) => void
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
	const { roomId, onRoomEvent, enabled = false } = props
	const centrifugeRef = useRef<Centrifuge | null>(null)
	const subscriptionRef = useRef<Subscription | null>(null)
	const onRoomEventRef = useRef(onRoomEvent)
	const [isConnected, setIsConnected] = useState<boolean>(false)

	onRoomEventRef.current = onRoomEvent

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
				process.env.NEXT_PUBLIC_CENTRIFUGAL_SOCKET_URL,
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
