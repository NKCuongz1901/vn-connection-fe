import { getStorageCookie, getUserInfo } from '@/ultis/storage'
import { generateCustomUuid } from '@/ultis/string'
import { useCallback, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

export default function useSocket() {
	const socketRef = useRef<Socket | null>(null)
	const _socketRef = useRef(null) as any
	const [message, setMessage] = useState<
		{ key: string; type: string; message: string }[]
	>([])
	const [data, setData] = useState({ token: '', uid: '' })
	const handleSocket = useCallback(() => {
		const token = getStorageCookie('token')
		const uid = getUserInfo()?.id

		// 🛑 Nếu đã có socket cũ thì disconnect
		if (socketRef.current) {
			socketRef.current.disconnect()
			console.log('🛑 Đã disconnect socket cũ')
			setMessage((prev) => [
				...prev,
				{
					key: generateCustomUuid(),
					type: 'disconnect',
					message: '🛑 Đã disconnect socket cũ',
				},
			])
		}

		// ✅ Tạo socket mới
		const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
            transports: ['websocket'],
            auth: {
                Authorization: 'Bearer ' + (data.token || token),
            },
            query: {
                token: data.token || token,
                uid: data.uid || uid
            },
            autoConnect: false,
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 5000,
        })

		socket.connect()
		socketRef.current = socket // 🔁 lưu socket mới

		// 🎧 Gắn event
		socket.on('connect', () => {
			console.log('🔌 Socket.io connected')
			setMessage((prev) => [
				...prev,
				{
					key: generateCustomUuid(),
					type: 'connect',
					message: '🔌 Socket.io connected',
				},
			])
		})
		socket.on('disconnect', (reason) => {
			console.log('❌ Socket.io disconnected:', reason)
			setMessage((prev) => [
				...prev,
				{
					key: generateCustomUuid(),
					type: 'disconnect',
					message: '❌ Socket.io disconnected:' + JSON.stringify(reason),
				},
			])
		})
		socket.on('message', (attempt) => {
			console.log(`🔁 message (lần ${attempt})...`)
			setMessage((prev) => [
				...prev,
				{
					key: generateCustomUuid(),
					type: 'message',
					message: `🔁 message (lần ${JSON.stringify(attempt)})...`,
				},
			])
		})
		socket.on('reconnect', (attempt) => {
			console.log(`✅ Reconnected sau ${attempt} lần`)
			setMessage((prev) => [
				...prev,
				{
					key: generateCustomUuid(),
					type: 'reconnect',
					message: `✅ Reconnected sau ${JSON.stringify(attempt)} lần`,
				},
			])
		})
		socket.on('connect_error', (err) => {
			console.log('❌ Reconnect lỗi:', err.message)
			setMessage((prev) => [
				...prev,
				{
					key: generateCustomUuid(),
					type: 'reconnect_error',
					message: `❌ Reconnect lỗi: ${JSON.stringify(err)}`,
				},
			])
		})
		socket.on('failed', () => {
			console.log('💀 Reconnect thất bại hoàn toàn')
			setMessage((prev) => [
				...prev,
				{
					key: generateCustomUuid(),
					type: 'reconnect_failed',
					message: `💀 Reconnect thất bại hoàn toàn`,
				},
			])
		})
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [JSON.stringify(data)])
	const handleSocket1 = useCallback(() => {
		const token = getStorageCookie('token')
		const uid = getUserInfo()?.id

		// 🛑 Nếu đã có socket cũ thì đóng kết nối
		if (_socketRef.current) {
			_socketRef.current.close()
			console.log('🛑 Đã đóng WebSocket cũ')
			setMessage((prev) => [
				...prev,
				{
					key: generateCustomUuid(),
					type: 'disconnect',
					message: '🛑 Đã đóng WebSocket cũ',
				},
			])
		}

		// ✅ Tạo WebSocket mới
		const wsUrl = `${process.env.NEXT_PUBLIC_SOCKET_URL.replace(
			/^http/,
			'ws',
		)}?token=${data.token || token}&uid=${data.uid || uid}`
		const socket = new WebSocket(wsUrl)

		_socketRef.current = socket

		// 🎧 Gắn event
		socket.onopen = () => {
			console.log('🔌 WebSocket connected')
			setMessage((prev) => [
				...prev,
				{
					key: generateCustomUuid(),
					type: 'connect',
					message: '🔌 WebSocket connected',
				},
			])
		}

		socket.onclose = (event) => {
			console.log('❌ WebSocket disconnected', event)
			setMessage((prev) => [
				...prev,
				{
					key: generateCustomUuid(),
					type: 'disconnect',
					message: `❌ WebSocket disconnected: ${JSON.stringify(event)}`,
				},
			])
		}

		socket.onmessage = (event) => {
			console.log('🔁 message:', event.data)
			setMessage((prev) => [
				...prev,
				{
					key: generateCustomUuid(),
					type: 'message',
					message: `🔁 message: ${event.data}`,
				},
			])
		}

		socket.onerror = (err) => {
			console.log('💥 WebSocket error:', err)
			setMessage((prev) => [
				...prev,
				{
					key: generateCustomUuid(),
					type: 'error',
					message: `💥 WebSocket error: ${JSON.stringify(err)}`,
				},
			])
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [JSON.stringify(data)])

	return {
		socket: socketRef, // 🔄 có thể expose nếu cần sử dụng ngoài
		_socket: _socketRef, // 🔄 có thể expose nếu cần sử dụng ngoài

		message,
		data,
		setData,
		onSocket: handleSocket,
		onSocket1: handleSocket1,
	}
}
