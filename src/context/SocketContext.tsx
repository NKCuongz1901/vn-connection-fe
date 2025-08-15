'use client'

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react'
import { io, Socket } from 'socket.io-client'

import { getStorageCookie, getUserInfo } from '@/ultis/storage.ults'
import { useQuery } from '@/ultis/route.ults'

const SocketContext = createContext<{
	socket: Socket | null
} | null>(null)

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
	const { onGetQuerry } = useQuery()
	const { cookie_id } = onGetQuerry()

	const socketRef = useRef<Socket | null>(null)
	const [_, setSocket] = useState<Socket | null>(null)

	const handleSocket = useCallback(() => {
		const token = getStorageCookie('token')
		const uid = getUserInfo()?.id

		// 🛑 Nếu đã có socket cũ thì disconnect
		if (socketRef.current) {
			socketRef.current.disconnect()
			console.log('🛑 Đã disconnect socket cũ')
		}

		// ✅ Tạo socket mới
		const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
			transports: ['websocket'],
			auth: {
				Authorization: 'Bearer ' + token,
			},
			query: {
				token: token,
				uid: uid,
			},
			autoConnect: false,
			reconnection: true,
			reconnectionAttempts: 10,
			reconnectionDelay: 5000,
		})

		socket.connect()
		socketRef.current = socket // 🔁 lưu socket mới
		setSocket(socket)

		// 🎧 Gắn event
		// socket.on('connect', () => {
		// 	console.log('🔌 Socket.io connected')
		// })
		// socket.on('disconnect', (reason) => {
		// 	console.log('❌ Socket.io disconnected:', reason)
		// })
		// socket.on('message', (attempt) => {
		// 	console.log(`🔁 message (lần )...`, attempt)
		// })
		// socket.on('reconnect', (attempt) => {
		// 	console.log(`✅ Reconnected sau ${attempt} lần`)
		// })
		// socket.on('connect_error', (err) => {
		// 	console.log('❌ Reconnect lỗi:', err.message)
		// })
		// socket.on('failed', () => {
		// 	console.log('💀 Reconnect thất bại hoàn toàn')
		// })
	}, [])
	useEffect(() => {
		const token = getStorageCookie('token')
		const uid = getUserInfo()?.id
		console.log('object')
		if (token && uid) {
			handleSocket()
		}
		return () => {
			socketRef.current?.removeAllListeners()
			socketRef.current?.disconnect()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [cookie_id])
	return (
		<SocketContext.Provider value={{ socket: socketRef.current }}>
			{children}
		</SocketContext.Provider>
	)
}

export const useSocket = () => useContext(SocketContext)
