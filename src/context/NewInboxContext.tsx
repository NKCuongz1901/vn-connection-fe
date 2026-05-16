'use client'

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react'
import { useSocket } from './SocketContext'
import { useLocalePath } from '@/ultis/route'
import { mainRoutes } from '@/routes/MainRoutes'
import { getUserInfo } from '@/ultis/storage'

type NewInboxContextType = {
	hasNewInboxMessage: boolean
	clearInboxUnread: () => void
}

export const NewInboxContext = createContext<NewInboxContextType>({
	hasNewInboxMessage: false,
	clearInboxUnread: () => {},
})

export const NewInboxProvider = ({
	children,
}: {
	children: React.ReactNode
}) => {
	const { socket } = useSocket() ?? { socket: null }
	const { pathname } = useLocalePath()
	const [hasNewInboxMessage, setHasNewInboxMessage] = useState(false)

	const isOnInboxPage = pathname.startsWith(mainRoutes.inbox)

	const clearNewInboxMessage = useCallback(() => {
		setHasNewInboxMessage(false)
	}, [])

	useEffect(() => {
		if (isOnInboxPage) {
			setHasNewInboxMessage(false)
		}
	}, [isOnInboxPage])

	useEffect(() => {
		if (!socket) return

		const onMessage = (data: any) => {
			const myId = getUserInfo()?.id
			const { sender_id } = data || {}

			if (!sender_id || sender_id === myId) return

			if (!pathname.startsWith(mainRoutes.inbox)) {
				setHasNewInboxMessage(true)
			}
		}

		socket.on('message', onMessage)
		return () => {
			socket.off('message', onMessage)
		}
	}, [socket, pathname])

	const value = useMemo(
		() => ({
			hasNewInboxMessage,
			clearInboxUnread: clearNewInboxMessage,
		}),
		[hasNewInboxMessage, clearNewInboxMessage],
	)
	return (
		<NewInboxContext.Provider value={value}>
			{children}
		</NewInboxContext.Provider>
	)
}

export const useNewInbox = () => useContext(NewInboxContext)
