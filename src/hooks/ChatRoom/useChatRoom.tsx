import { useEffect, useMemo, useRef, useState } from 'react'

import { useModal } from '@/context/ModalContext'

import { getChatRoomList } from '@/apis/conversationApis'
import { getUserProfile } from '@/apis/userApis'

import { isArray, uniqueArray } from '@/ultis/array'
import { cloneDeep, delay } from '@/ultis/common'
import { useQuery } from '@/ultis/route'
import { getUserInfo } from '@/ultis/storage'

import { PaginationType } from '@/interface/common/common.interface'
import { ConversationChatRoomProps } from '@/interface/Conversation/Conversation.interface'
import { UserProps } from '@/interface/User/User.interface'
import { paginationMore } from '@/Variable/common.variable'

interface useChatRoomProps {
	tabOpts: { value: string; label: string }[]
}

export default function useChatRoom(props: useChatRoomProps) {
	const { tabOpts } = props
	const { openError } = useModal()
	const { onGetQuerry } = useQuery()
	const { type, id } = onGetQuerry()

	const _paginationRefs = useRef<PaginationType>(cloneDeep(paginationMore))

	const [tab, setTab] = useState(tabOpts[0].value)
	const [loading, setLoading] = useState({
		chatroom: false,
	})

	const [listChatRoom, setListChatRoom] = useState<ConversationChatRoomProps[]>(
		[],
	)
	const [modal, setModal] = useState<{
		type?: string
		data?: any
		title?: string
	}>({
		type: '',
		data: null,
		title: null,
	})
	const [_profile, setProfile] = useState<UserProps>(null)
	const [openModal, setOpenModal] = useState(false)

	const isChatRoomDetail = useMemo(
		() => ['language', 'location'].includes(type) && !!id,
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

	const handleRefreshListChatRoom = async () => {
		_paginationRefs.current.page = 1
		setLoading((prev) => ({ ...prev, chatroom: true }))
		try {
			const res: any = await getChatRoomList({
				fields: ['$all'],
				page: 1,
				limit: 50,
				order: [['created_at', 'desc']],
			})
			if (res?.code === 200) {
				setListChatRoom(res?.results?.objects?.rows || [])
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoading((prev) => ({ ...prev, chatroom: false }))
		}
	}

	const handleSuccess = ({ type, id, data }: { type?: string; id?: string; data?: any }) => {
		switch (type) {
			case 'join':
			case 'leave':
				handleRefreshListChatRoom()
				break
			case 'remind': {
				// amount_of_remind is already persisted in useDetailChatRoom
				if (data?.amount_of_remind == null) break

				setListChatRoom((prev) => {
					const newData = cloneDeep(prev).map((item) => {
						if (item.id !== id) return item
						const { users_in_conversation } = item || {}
						if (users_in_conversation?.[0]) {
							users_in_conversation[0].amount_of_remind = data.amount_of_remind
						}
						return item
					})
					return newData
				})
				break
			}
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
			console.log('🌸🌸🌸 TrieuNinhHan ~ :186 ~ handleGetProfile ~ res:', res)
			const { languages_can_speak_array, avatar } = res?.results?.object || {}

			if (!isArray(languages_can_speak_array, 1) || !avatar) {
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
	useEffect(() => {
		if (tabOpts.some((option) => option.value === type)) {
			setTab(type)
		}
	}, [tabOpts, type])
	return {
		openModal,
		loading,
		id,
		isChatRoomDetail,
		tab,
		listChatRoom,
		modal,
		setModal,
		setTab,
		onSuccess: handleSuccess,
		setOpenModal,
	}
}
