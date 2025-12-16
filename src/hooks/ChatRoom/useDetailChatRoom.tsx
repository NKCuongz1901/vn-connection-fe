import { useEffect, useState } from 'react'

import { useModal } from '@/context/ModalContext'

import { joinConversation } from '@/apis/conversationApis'

import { getStorageCookie, handleStorageCookie } from '@/ultis/storage.ults'

import { mainRoutes } from '@/routes/MainRoutes'

interface useDetailChatRoomProps {
	id: string
	onSuccess?: any
}

export default function useDetailChatRoom(props: useDetailChatRoomProps) {
	const { id, onSuccess = () => null } = props
	const { openError } = useModal()
	const [modal, setModal] = useState<{
		type?: string
		data?: any
		title?: string
	}>({
		type: '',
		data: null,
		title: null,
	})
	const handleCheckTimesJoin = () => {
		const data = getStorageCookie(`${mainRoutes.chatRoom}_${id}`)
		if (!Number(data) || Number(data) < 2) {
			setModal({ type: 'noti' })
		}
	}
	const handleSetTimesJoin = () => {
		const data = getStorageCookie(`${mainRoutes.chatRoom}_${id}`) || 0
		handleStorageCookie({
			key: `${mainRoutes.chatRoom}_${id}`,
			expireInDays: 999,
			data: data + 1,
		})
		setModal({})
	}
	const handleJoinChatRoom = async () => {
		try {
			const res: any = await joinConversation({ id, status: true })
			console.log('🌸🌸🌸 TrieuNinhHan ~ :46 ~ handleJoinChatRoom ~ res:', res)
			onSuccess({ type: 'join', id, data: res?.object })
		} catch (error) {
			openError(error)
		}
	}
	useEffect(() => {
		handleCheckTimesJoin()
		handleJoinChatRoom()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id])
	return {
		modal,
		setModal,
		onSetTimesJoin: handleSetTimesJoin,
	}
}
