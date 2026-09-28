import { useCallback, useEffect, useState } from 'react'

import { useModal } from '@/context/ModalContext'

import {
	getConvInfoById,
	joinConversation,
	updateConvMember,
} from '@/apis/conversationApis'

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

	/** Persists chat-rules acknowledgment so the modal stops after 2 reminds. */
	const handleSetTimesJoin = useCallback(async () => {
		setModal({})

		try {
			const infoRes: any = await getConvInfoById({
				id,
				fields: ['$all'],
			})
			const join = infoRes?.results?.object?.join
			const memberId = join?.id

			if (!memberId) {
				onSuccess({ type: 'remind', id })
				return
			}

			const res: any = await updateConvMember({
				id,
				memberId,
				payload: {
					amount_of_remind: (join?.amount_of_remind || 0) + 1,
				},
			})

			onSuccess({
				type: 'remind',
				id,
				data: res?.results?.object,
			})
		} catch (error) {
			openError(error)
			onSuccess({ type: 'remind', id })
		}
	}, [id, onSuccess, openError])

	const handleJoinChatRoom = async () => {
		try {
			const infoRes: any = await getConvInfoById({
				id,
				fields: ['$all'],
			})
			const join = infoRes?.results?.object?.join
			// Already a member — skip join success so topic bar is not refetched/reset.
			if (join) return

			const res: any = await joinConversation({ id, status: true })
			onSuccess({ type: 'join', id, data: res?.results?.object })
		} catch (error: any) {
			const message =
				error?.response?.data?.message || error?.message || error
			if (
				typeof message === 'string' &&
				message.toLowerCase().includes('maximum 10 chat location')
			) {
				openError({ title: 'Limit reached', message })
				return
			}
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
