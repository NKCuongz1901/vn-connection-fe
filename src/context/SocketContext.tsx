'use client'

import { appLayoutAuth } from '@/app/variable/layoutData'
import { getStorageCookie } from '@/ultis/storage.ults'
import { usePathname } from 'next/navigation'
import { createContext, useContext, useRef, useEffect } from 'react'
import { io, Socket } from 'socket.io-client'

type Callback = (data: any) => void
type ListenerMap = {
	[type: string]: {
		[id: string]: Callback
	}
}

const SocketContext = createContext<{
	connectSocket: (params: {
		id: string
		type?: string
		callback?: Callback
	}) => void
	disconnectSocket: (id: string, type: string) => void
} | null>(null)
const token = getStorageCookie('token')
const uid = 'cba1f4b0-7117-11ef-816e-ad227b31cf2c'
const socket = io('http://dev-api.univini.com:9001', {
	transports: ['websocket'],
	query: {
		token:
			'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJwYXlsb2FkIjp7InVzZXJfaWQiOiJlMTEwNDM2MC0wNzIxLTExZjAtYjM4NC0zZDI5ZmM4OWUyMTUiLCJyb2xlIjoiVVNFUiIsInR5cGUiOiJBQ0NFU1NfVE9LRU4iLCJuYW1lIjoiMTEyMyJ9LCJyb2xlIjoiVVNFUiIsImV4cCI6IjIwMjUtMDctMjVUMDA6NTU6NTEuNjQ3WiJ9.AewMq8uNCStuU-ckZSYCxvofYfCivwTEv3wVG9rZlfY',
		uid: 'e1104360-0721-11f0-b384-3d29fc89e215',
	},
})
export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
	// const socketRef = useRef<Socket | null>(null)
	// const listenersRef = useRef<ListenerMap>({})
	// const pathname = usePathname()

	// // const connectWebSocket = () => {
	// // 	console.log('gọi socket nè')
	// // 	socket.connect()
	// // 	socket.on('connect', () => {
	// // 		console.log('🔌 Socket.io connected')
	// // 	})

	// // 	socket.on('connect_error', (err) => {
	// // 		console.error('❌ Socket connect error:', err.message)
	// // 	})

	// // 	socket.on('disconnect', (reason) => {
	// // 		console.log('❌ Socket.io disconnected:', reason)
	// // 	})
	// // 	socket.on('reconnect_attempt', (attempt) => {
	// // 		console.log(`🔁 Đang reconnect (lần ${attempt})...`)
	// // 	})

	// // 	socket.on('reconnect', (attempt) => {
	// // 		console.log(`✅ Reconnected sau ${attempt} lần`)
	// // 	})

	// // 	socket.on('reconnect_error', (err) => {
	// // 		console.error('❌ Reconnect lỗi:', err.message)
	// // 	})

	// // 	socket.on('reconnect_failed', () => {
	// // 		console.log('💀 Reconnect thất bại hoàn toàn')
	// // 	})

	// // 	socket.onAny((event, data) => {
	// // 		const map = listenersRef.current[event]
	// // 		if (map) {
	// // 			Object.values(map).forEach((cb) => cb(data))
	// // 		}
	// // 	})

	// // 	console.log('🎯 Socket initialized:', socket)
	// // }

	// useEffect(() => {
	// 	console.log('gọi socket nè')
	// 	socket.connect()
	// 	return () => {
	// 		console.log('socket close')
	// 		socket.disconnect()
	// 	}
	// }, [])

	// const connectSocket = ({
	// 	id,
	// 	type,
	// 	callback,
	// }: {
	// 	id: string
	// 	type?: string
	// 	callback?: Callback
	// }) => {
	// 	if (!id) return
	// 	console.log('object connect ở đây nè')

	// 	if (!type || !callback) {
	// 		for (const t of Object.keys(listenersRef.current)) {
	// 			delete listenersRef.current[t][id]
	// 			if (Object.keys(listenersRef.current[t]).length === 0) {
	// 				delete listenersRef.current[t]
	// 			}
	// 		}
	// 		return
	// 	}

	// 	if (!listenersRef.current[type]) {
	// 		listenersRef.current[type] = {}
	// 	}

	// 	listenersRef.current[type][id] = callback
	// }

	// const disconnectSocket = (id: string, type: string) => {
	// 	if (listenersRef.current[type]?.[id]) {
	// 		delete listenersRef.current[type][id]
	// 		if (Object.keys(listenersRef.current[type]).length === 0) {
	// 			delete listenersRef.current[type]
	// 		}
	// 	}
	// }

	return <SocketContext.Provider>{children}</SocketContext.Provider>
}

export const useSocket = () => {
	const ctx = useContext(SocketContext)
	if (!ctx) throw new Error('useSocket must be used inside <SocketProvider>')
	return ctx
}
