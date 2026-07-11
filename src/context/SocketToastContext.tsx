'use client'

import { useEffect } from 'react'

import { showMessageDeleteToast } from '@/Components/Toast/SocketToastContent'
import {
	TOAST_SOURCE_TYPE,
	type ToastModel,
} from '@/interface/Toast/Toast.interface'
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

		const onToast = (data: ToastModel) => {
			const myId = getUserInfo()?.id
			const { user_id, source_type = TOAST_SOURCE_TYPE.MESSAGE_DELETE_REASON } =
				data || {}

			if (!myId || user_id !== myId) return
			if (source_type !== TOAST_SOURCE_TYPE.MESSAGE_DELETE_REASON) return

			showMessageDeleteToast(data)
		}

		socket.on('toast', onToast)
		return () => {
			socket.off('toast', onToast)
		}
	}, [socket])

	return <>{children}</>
}
