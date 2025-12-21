import { useEffect, useState } from 'react'

import { useModal } from '@/context/ModalContext'

import { joinConversation } from '@/apis/conversationApis'

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

	const handleSetTimesJoin = () => {
		onSuccess({ type: 'remind', id: id })
		setModal({})
	}
	const handleJoinChatRoom = async () => {
		try {
			const res: any = await joinConversation({ id, status: true })
			onSuccess({ type: 'join', id, data: res?.results?.object })
		} catch (error) {
			openError(error)
		}
	}
	useEffect(() => {
		// handleCheckTimesJoin()
		handleJoinChatRoom()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id])
	return {
		modal,
		setModal,
		onSetTimesJoin: handleSetTimesJoin,
	}
}
