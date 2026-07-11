'use client'

import { useEffect } from 'react'

import { showMessageDeleteToast } from '@/Components/Toast/SocketToastContent'
import { parseToastSocketPayload } from '@/interface/Toast/Toast.interface'
import { getUserInfo } from '@/ultis/storage'

import { useSocket } from './SocketContext'

export const SocketToastProvider = ({
	children,
}: {
	children: React.ReactNode
}) => {
	const { socket } = useSocket() ?? { socket: null }

	useEffect(() => {
		if (!socket) return

		const onToast = (payload: unknown) => {
			const myId = getUserInfo()?.id
			const toastData = parseToastSocketPayload(payload, myId)
			if (!toastData) return

			showMessageDeleteToast(toastData)
		}

		socket.on('toast', onToast)
		return () => {
			socket.off('toast', onToast)
		}
	}, [socket])

	return <>{children}</>
}
