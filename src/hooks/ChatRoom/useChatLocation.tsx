import {
	createConversation,
	findChatLocation,
	getListActiveChatLocation,
	getListFullMiniChat,
	getListMyChatLocation,
	getListMyMiniChat,
	getListSuggestChatLocation,
	getMessageReadMessage,
	leaveConvById,
} from '@/apis/conversationApis'
import { showMiniChatLeftToast } from '@/Components/Toast/SocketToastContent'
import { useModal } from '@/context/ModalContext'
import { useSocket } from '@/context/SocketContext'
import {
	ChatLocationItemProps,
	FullMiniChatItemProps,
	MiniChatItemProps,
} from '@/interface/Conversation/Conversation.interface'
import { onPushState } from '@/ultis/route'
import { getUserInfo } from '@/ultis/storage'
import { useCallback, useEffect, useRef, useState } from 'react'

interface useChatLocationProps {
	tabOpts?: { value: string; label: string }[]
	id?: string
	activeMiniChatId?: string
}

export interface ChatLocationEntry {
	id: string | null
	title: string
	level?: number
}

export default function useChatLocation(props: useChatLocationProps) {
	const { id, activeMiniChatId } = props
	const { openError } = useModal()
	const { socket } = useSocket() ?? { socket: null }
	const [loading, setLoading] = useState({
		myChatLocation: false,
		activeChatLocation: false,
		suggestChatLocation: false,
		findChatLocation: false,
		getMyMiniChat: false,
		getFullMiniChat: false,
	})
	const [listMyChatLocation, setListMyChatLocation] = useState<
		ChatLocationItemProps[]
	>([])
	const [listActiveChatLocation, setListActiveChatLocation] = useState<
		ChatLocationItemProps[]
	>([])
	const [listSuggestChatLocation, setListSuggestChatLocation] = useState<
		ChatLocationEntry[]
	>([])
	const [listFindChatLocation, setListFindChatLocation] = useState<
		ChatLocationEntry[]
	>([])
	const [findKeyword, setFindKeyword] = useState('')
	const [enteringLocationKey, setEnteringLocationKey] = useState<string | null>(
		null,
	)
	const [miniChatActionId, setMiniChatActionId] = useState<string | null>(null)
	const [listMyMiniChat, setListMyMiniChat] = useState<MiniChatItemProps[]>([])
	const [listFullMiniChat, setListFullMiniChat] = useState<
		FullMiniChatItemProps[]
	>([])

	const activeMiniChatIdRef = useRef(activeMiniChatId)
	const listMyMiniChatRef = useRef(listMyMiniChat)
	const listFullMiniChatRef = useRef(listFullMiniChat)
	const locationIdRef = useRef(id)

	activeMiniChatIdRef.current = activeMiniChatId
	listMyMiniChatRef.current = listMyMiniChat
	listFullMiniChatRef.current = listFullMiniChat
	locationIdRef.current = id

	const handleGetListMyMiniChat = async (parentId: string) => {
		setLoading((prev) => ({ ...prev, getMyMiniChat: true }))
		try {
			const res: any = await getListMyMiniChat({
				parent_id: parentId,
				page: 1,
				limit: 50,
			})
			const { code, results } = res
			if (code === 200) {
				setListMyMiniChat(results.objects.rows || [])
			}
		} catch (error) {
			openError(error.message)
		} finally {
			setLoading((prev) => ({ ...prev, getMyMiniChat: false }))
		}
	}

	const handleGetListFullMiniChat = async (parentId: string) => {
		setLoading((prev) => ({ ...prev, getFullMiniChat: true }))
		try {
			const res: any = await getListFullMiniChat({
				parent_id: parentId,
			})
			const { code, results } = res
			if (code === 200) {
				setListFullMiniChat(results.objects.rows || [])
			}
		} catch (error) {
			openError(error.message)
		} finally {
			setLoading((prev) => ({ ...prev, getFullMiniChat: false }))
		}
	}

	/** Marks a mini chat as read in local lists and notifies the backend. */
	const handleMarkMiniChatRead = useCallback(async (miniChatId?: string) => {
		if (!miniChatId) return

		setListMyMiniChat((prev) =>
			prev.map((item) =>
				item.id === miniChatId ? { ...item, is_read: true } : item,
			),
		)
		setListFullMiniChat((prev) =>
			prev.map((item) =>
				item.id === miniChatId ? { ...item, is_read: true } : item,
			),
		)

		try {
			await getMessageReadMessage(miniChatId)
		} catch {
			// Keep optimistic local clear even if read API fails.
		}
	}, [])

	/** Applies realtime mini-chat unread state from socket messages. */
	const handleMiniChatSocketMessage = useCallback((data: any) => {
		const locationId = locationIdRef.current
		const { conversation_id, sender_id, related_conversation_id } = data || {}
		if (!locationId || !conversation_id) return

		const isKnownMini =
			listMyMiniChatRef.current.some((item) => item.id === conversation_id) ||
			listFullMiniChatRef.current.some((item) => item.id === conversation_id)
		const isUnderLocation =
			related_conversation_id === locationId || isKnownMini

		if (!isUnderLocation) return

		const myUserId = getUserInfo('id')
		const isMe = sender_id === myUserId
		const isActive = conversation_id === activeMiniChatIdRef.current
		const nextIsRead = Boolean(isMe || isActive)

		setListMyMiniChat((prev) => {
			const idx = prev.findIndex((item) => item.id === conversation_id)
			if (idx < 0) return prev

			const next = [...prev]
			next[idx] = {
				...next[idx],
				is_read: nextIsRead,
				last_message: {
					...(next[idx].last_message || {}),
					...data,
					id: data?.id || next[idx].last_message?.id,
					conversation_id,
					sender_id,
				},
			}
			return next
		})

		setListFullMiniChat((prev) => {
			const idx = prev.findIndex((item) => item.id === conversation_id)
			if (idx < 0) return prev

			const next = [...prev]
			next[idx] = {
				...next[idx],
				is_read: nextIsRead,
				last_message: data?.id
					? {
							id: data.id,
							content: data.content || next[idx].last_message?.content || '',
							type: data.type || next[idx].last_message?.type || '',
							created_at:
								data.created_at || next[idx].last_message?.created_at || '',
						}
					: next[idx].last_message,
			}
			return next
		})
	}, [])

	// Leave a mini chat and refresh both mini-chat lists.
	const handleLeaveMiniChat = async (miniChatId: string) => {
		if (!id || miniChatActionId) return false

		setMiniChatActionId(miniChatId)
		try {
			const res: any = await leaveConvById({ id: miniChatId })
			if (res?.code !== 200) {
				openError(res)
				return false
			}

			await Promise.all([
				handleGetListMyMiniChat(id),
				handleGetListFullMiniChat(id),
			])
			showMiniChatLeftToast()
			return true
		} catch (error) {
			openError(error)
			return false
		} finally {
			setMiniChatActionId(null)
		}
	}

	const handleGetListMyChatLocation = async () => {
		setLoading((prev) => ({ ...prev, myChatLocation: true }))
		try {
			const res: any = await getListMyChatLocation({
				fields: ['$all'],
				page: 1,
				limit: 50,
			})
			const { code, results } = res
			if (code === 200) {
				setListMyChatLocation(results.objects.rows || [])
			}
		} catch (error) {
			openError(error.message)
		} finally {
			setLoading((prev) => ({ ...prev, myChatLocation: false }))
		}
	}

	const handleGetListActiveChatLocation = async () => {
		setLoading((prev) => ({ ...prev, activeChatLocation: true }))
		try {
			const res: any = await getListActiveChatLocation({
				fields: ['$all'],
				page: 1,
				limit: 50,
			})
			const { code, results } = res
			if (code === 200) {
				setListActiveChatLocation(results.objects.rows || [])
			}
		} catch (error) {
			openError(error.message)
		} finally {
			setLoading((prev) => ({ ...prev, activeChatLocation: false }))
		}
	}

	const handleGetListSuggestChatLocation = async () => {
		setLoading((prev) => ({ ...prev, suggestChatLocation: true }))
		try {
			const res: any = await getListSuggestChatLocation({
				latitude: 0,
				longitude: 0,
			})
			const { code, results } = res
			if (code === 200) {
				setListSuggestChatLocation(results.object || [])
			}
		} catch (error) {
			openError(error.message)
		} finally {
			setLoading((prev) => ({ ...prev, suggestChatLocation: false }))
		}
	}

	// Find chat locations by latitude and longitude.
	const handleFindChatLocation = async ({
		latitude,
		longitude,
		keyword = '',
	}: {
		latitude?: number
		longitude?: number
		keyword?: string
	} = {}) => {
		const { latitude: userLat, longitude: userLng } = getUserInfo() || {}
		const lat = Number(latitude ?? userLat) || 0
		const lng = Number(longitude ?? userLng) || 0

		setLoading((prev) => ({ ...prev, findChatLocation: true }))
		try {
			const res: any = await findChatLocation({
				latitude: lat,
				longitude: lng,
			})
			const { code, results } = res
			if (code === 200) {
				setListFindChatLocation(results?.object?.rows || [])
				setFindKeyword(keyword)
			}
		} catch (error) {
			openError(error.message)
		} finally {
			setLoading((prev) => ({ ...prev, findChatLocation: false }))
		}
	}

	// Resolve an existing location or create a new location room before opening it.
	const handleEnterChatLocation = async (item: ChatLocationEntry) => {
		const { id: locationId, title, level } = item || {}
		const locationKey = locationId || `${title}-${level || ''}`
		if (!title || enteringLocationKey) return

		setEnteringLocationKey(locationKey)
		try {
			if (locationId) {
				onPushState({ type: 'location', id: locationId })
				return
			}
			if (!level) {
				openError({
					message:
						'Unable to create this location because its level is missing.',
				})
				return
			}

			const res: any = await createConversation({
				title,
				kind: 'CHAT_LOCATION',
				level,
			})
			const createdId = res?.results?.object?.id
			if (res?.code !== 200 || !createdId) {
				openError(res)
				return
			}

			await handleGetListMyChatLocation()
			onPushState({ type: 'location', id: createdId })
		} catch (error) {
			openError(error)
		} finally {
			setEnteringLocationKey(null)
		}
	}

	useEffect(() => {
		handleGetListMyChatLocation()
		handleGetListActiveChatLocation()
		handleGetListSuggestChatLocation()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	useEffect(() => {
		if (!activeMiniChatId) return
		void handleMarkMiniChatRead(activeMiniChatId)
	}, [activeMiniChatId, handleMarkMiniChatRead])

	useEffect(() => {
		if (!socket || !id) return

		socket.on('message', handleMiniChatSocketMessage)
		return () => {
			socket.off('message', handleMiniChatSocketMessage)
		}
	}, [handleMiniChatSocketMessage, id, socket])

	return {
		loading,
		listMyChatLocation,
		listActiveChatLocation,
		listSuggestChatLocation,
		listFindChatLocation,
		findKeyword,
		enteringLocationKey,
		miniChatActionId,
		listMyMiniChat,
		listFullMiniChat,

		// Actions
		onFindChatLocation: handleFindChatLocation,
		onEnterChatLocation: handleEnterChatLocation,
		onGetListMyMiniChat: handleGetListMyMiniChat,
		onGetListFullMiniChat: handleGetListFullMiniChat,
		onLeaveMiniChat: handleLeaveMiniChat,
		onRefreshMyChatLocation: handleGetListMyChatLocation,
		onMarkMiniChatRead: handleMarkMiniChatRead,
	}
}
