import { useEffect, useMemo, useRef, useState } from 'react'

import { useModal } from '@/context/ModalContext'

import { getChatRoomList, updateConvMember } from '@/apis/conversationApis'
import { getUserProfile } from '@/apis/userApis'

import { isArray, uniqueArray } from '@/ultis/array'
import { cloneDeep, delay } from '@/ultis/common'
import { useQuery } from '@/ultis/route'
import { getUserInfo } from '@/ultis/storage'

import { PaginationType } from '@/interface/common/common.interface'
import { ConversationChatRoomProps } from '@/interface/Conversation/Conversation.interface'
import { UserProps } from '@/interface/User/User.interface'
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

	const [_profile, setProfile] = useState<UserProps>(null)
	const [openModal, setOpenModal] = useState(false)

	const isChatRoomDetail = useMemo(
		() => type === 'language' && !!id,
		[type, id],
	)
	const handleGetListChatRoom = async (isNotLoading = false) => {
		setLoading((prev) => ({ ...prev, chatroom: true }))
		try {
			const { page } = _paginationRefs.current
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
				limit: !isNotLoading ? 50 : 50,
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

	const handleUpdateUserInConv = async (convInfo) => {
		try {
			const { id, users_in_conversation } = convInfo || {}
			const { id: memberId, amount_of_remind } = users_in_conversation[0] || {}
			if (!memberId || !id) {
				return
			}
			const res: any = await updateConvMember({
				id,
				memberId,
				payload: { amount_of_remind: (amount_of_remind || 0) + 1 },
			})
			setListChatRoom((prev) => {
				const newData = cloneDeep(prev).map((i) => {
					if (i.id !== id) return i
					const { users_in_conversation } = i || {}
					users_in_conversation[0].amount_of_remind =
						res?.results?.object?.amount_of_remind || 1
					return i
				})
				return newData
			})
		} catch {
		} finally {
		}
	}
	const handleSuccess = ({ type, id, data }) => {
		switch (type) {
			case 'join':
				{
					const item = listChatRoom.find((i) => i.id === id)
					if (!isArray(item?.users_in_conversation, 1)) {
						const {
							id: _id,
							type,
							conversation_id,
							user_id,
							amount_of_remind,
						} = data || {}
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
													amount_of_remind,
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
			case 'leave':
				setListChatRoom((prev) =>
					prev.map((i) => {
						if (i.id === id) {
							return {
								...i,
								users_in_conversation: [],
							}
						} else {
							return i
						}
					}),
				)
				break
			case 'remind':
				{
					const convInfo = listChatRoom.find((i) => i.id === id)
					handleUpdateUserInConv(convInfo)
				}
				break
			default:
				break
		}
	}

	const handleGetProfile = async () => {
		try {
			const res: any = await getUserProfile({
				params: {
					fields: ['$all'],
				},
			})
			const { languages_can_speak, avatar } = res?.results?.object || {}

			if (!languages_can_speak || !avatar) {
				setOpenModal(true)
			}
			setProfile(res?.results?.object)
		} catch (error) {
			openError(error)
		}
	}

	useEffect(() => {
		handleGetListChatRoom()
		handleGetProfile()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])
	return {
		openModal,
		loading,
		id,
		isChatRoomDetail,
		tab,
		listChatRoom,
		setTab,
		onSuccess: handleSuccess,
		setOpenModal,
	}
}
