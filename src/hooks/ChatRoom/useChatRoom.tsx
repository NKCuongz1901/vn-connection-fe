import { useEffect, useMemo, useRef, useState } from 'react'

import { useModal } from '@/context/ModalContext'

import { getChatRoomList } from '@/apis/conversationApis'

import { isArray, uniqueArray } from '@/ultis/array.ults'
import { cloneDeep, delay } from '@/ultis/common.ults'
import { useQuery } from '@/ultis/route.ults'
import { getUserInfo } from '@/ultis/storage.ults'

import { PaginationType } from '@/interface/common/common.interface'
import { ConversationChatRoomProps } from '@/interface/Conversation/Conversation.interface'
import { paginationCommon } from '@/Variable/common.variable'

interface useChatRoomProps {
	tabOpts: { value: string; label: string }[]
}

export default function useChatRoom(props: useChatRoomProps) {
	const { tabOpts } = props
	const { openError } = useModal()
	const { onGetQuerry } = useQuery()
	const { type, id } = onGetQuerry()

	const _paginationRefs = useRef<PaginationType>(cloneDeep(paginationCommon))

	const [tab, setTab] = useState(tabOpts[0].value)
	const [loading, setLoading] = useState({
		chatroom: false,
	})

	const [listChatRoom, setListChatRoom] = useState<ConversationChatRoomProps[]>(
		[],
	)

	const isChatRoomDetail = useMemo(
		() => type === 'language' && !!id,
		[type, id],
	)
	const handleGetListChatRoom = async (isNotLoading = false) => {
		setLoading((prev) => ({ ...prev, chatroom: true }))
		try {
			const { page, limit } = _paginationRefs.current
			let isNew = page === 1
			if (isNotLoading) {
				isNew = false
			}
			if (isNew) {
				setListChatRoom([])
			}
			const res: any = await getChatRoomList({
				fields: ['$all'],
				page: !isNotLoading ? page : 1,
				limit: !isNotLoading ? limit : 50,
				order: [['created_at', 'desc']],
			})
			const { code, results } = res || {}
			await delay(500)
			if (code === 200) {
				const { rows } = results?.objects || {}
				setListChatRoom((prev: ConversationChatRoomProps[]) => {
					const contents = isNew && !isNotLoading ? [] : prev
					const dataShow = uniqueArray([...contents, ...rows], 'id') as any[]
					return dataShow
				})
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoading((prev) => ({ ...prev, chatroom: false }))
		}
	}

	const handleSuccess = ({ type, id, data }) => {
		switch (type) {
			case 'join':
				{
					const item = listChatRoom.find((i) => i.id === id)
					if (!isArray(item?.users_in_conversation, 1)) {
						const { id: _id, type, conversation_id, user_id } = data || {}
						const { avatar, name } = getUserInfo() || {}
						setListChatRoom((prev) =>
							prev.map((i) =>
								i.id === id
									? {
											...i,
											users_in_conversation: [
												{
													id: _id,
													type: type,
													conversation_id: conversation_id,
													user_id: user_id,
													amount_of_remind: 2,
													user: {
														id: user_id,
														avatar: avatar,
														name: name,
													},
												},
											],
									  }
									: i,
							),
						)
					}
				}
				break
			default:
				break
		}
	}

	useEffect(() => {
		handleGetListChatRoom()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])
	return {
		loading,
		id,
		isChatRoomDetail,
		tab,
		listChatRoom,
		setTab,
		onSuccess: handleSuccess,
	}
}
