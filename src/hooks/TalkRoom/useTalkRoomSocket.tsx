import { Centrifuge, Subscription } from 'centrifuge'
import { useEffect, useRef, useState } from 'react'

import { getTokenSocket } from '@/apis/talkRoomApis'

type TalkroomSocketType = {
	roomId: string
	enabled?: boolean
	onRoomEvent?: (event: string, data: any) => void
}

export default function useTalkRoomSocket(props: TalkroomSocketType) {
	const { roomId, onRoomEvent, enabled = false } = props
	const centrifugeRef = useRef<Centrifuge | null>(null)
	const subscriptionRef = useRef<Subscription | null>(null)
	const onRoomEventRef = useRef(onRoomEvent)
	const [isConnected, setIsConnected] = useState<boolean>(false)

	onRoomEventRef.current = onRoomEvent

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
				console.log('connected to centrifugal')
				setIsConnected(true)
			})
			centrifuge.on('disconnected', () => {
				console.log('disconnected from centrifugal')
				setIsConnected(false)
			})

			const subcribe = centrifuge.newSubscription(`public:${roomId}`)

			subcribe.on('publication', (ctx) => {
				console.log('publication', ctx)
				const message = ctx.data
				const event = message?.event
				const payload = message?.payload

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

	return { isConnected }
}
