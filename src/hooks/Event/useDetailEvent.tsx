import { ItemType } from 'antd/es/menu/interface'
import { useEffect, useMemo, useState } from 'react'

import { useLoading } from '@/context/LoadingContext'
import { useModal } from '@/context/ModalContext'

import { sendMessageById } from '@/apis/conversationApis'
import { deletePost, getDetailPost, joinPost } from '@/apis/postApis'

import { delay } from '@/ultis/common.ults'
import { useLocalePath } from '@/ultis/route.ults'
import { getUserInfo } from '@/ultis/storage.ults'

import { mainRoutes } from '@/routes/MainRoutes'
import { repeatOpt } from '@/Variable/select.variable'

interface useDetailEventProps {
	id: string
	[key: string]: any
}
export default function useDetailEvent({ id }: useDetailEventProps) {
	const { openConfirm, openError, closeModal } = useModal()
	const { toggleLoadingContext } = useLoading()
	const { onChangeRoute } = useLocalePath()
	const [detailPost, setDetailPost] = useState({}) as any
	const [loading, setLoading] = useState({ detailLoad: false })
	const [loadingShare, setLoadingShare] = useState({}) as any
	const [shareList, setShareList] = useState([]) as any
	const [openModal, setOpenModal] = useState<{
		type: any
		dataModal: any
	}>({
		type: null,
		dataModal: null,
	})

	const handleSetLoading = ({ key, value }) => {
		setLoading((prev) => ({ ...prev, [key]: value }))
	}
	const handleGetDetailPost = async () => {
		let _data: any = {}
		handleSetLoading({ key: 'detailLoad', value: true })

		try {
			const params = {
				fields: ['$all', { user: ['name', 'phone', 'avatar'] }],
			}
			const res: any = await getDetailPost({ id, params })
			const { code, results } = res || {}
			if (code === 200) {
				_data = results?.object
			}
		} catch (error) {
			openError(error)
		} finally {
			setDetailPost(_data)
			handleSetLoading({ key: 'detailLoad', value: false })
		}
	}
	const handleSetOpenModal = ({
		type = null,
		dataModal = null,
	}: {
		type?: any
		dataModal?: any
	}) => {
		setOpenModal({ type, dataModal })
	}
	const handleCancelEventConfirm = () => {
		const { repeat_type } = detailPost || {}
		const { type } = repeat_type || {}
		if (type === repeatOpt[0].value) {
			handleCancelEvent()
		} else {
			handleSetOpenModal({ type: 'cancel' })
		}
	}
	const handleCancelEvent = async (_params?: any) => {
		handleSetOpenModal({})
		toggleLoadingContext(true)
		try {
			const params = _params && { delete_type: _params }
			const res: any = await deletePost({ id, params })
			const { code } = res || {}
			if (code === 200) {
				onChangeRoute(mainRoutes.event)
			}
		} catch (error) {
			openError(error)
		} finally {
			toggleLoadingContext()
		}
	}
	const handleJoinPost = async () => {
		toggleLoadingContext(true)
		try {
			const { id } = detailPost
			const res: any = await joinPost({
				post_id: id,
			})
			const { code, results } = res || {}
			if (code === 200) {
				const { deleted_at } = results?.object || {}
				if (deleted_at) {
					setDetailPost((prev: any) => ({ ...prev, is_joined: false }))
				} else {
					setDetailPost((prev: any) => ({ ...prev, is_joined: true }))
				}
			}
		} catch (error) {
			openError(error)
		} finally {
			toggleLoadingContext()
		}
	}
	const handleJoinPostConfirm = (type: string) => {
		switch (type) {
			case 'join':
				handleJoinPost()
				break
			case 'leave':
				openConfirm({
					titleLabel: 'Leave event',
					message: 'Are you sure want to leave event ?',
					onAccept: () => {
						handleJoinPost()
						closeModal()
					},
				})
				break
			default:
				break
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}
	const handleShareFriend = async (id: string) => {
		setLoadingShare((prev: any) => ({ ...prev, [id]: true }))
		try {
			const { share_link } = detailPost || {}
			const payload = {
				receiver_id: id,
				message: {
					content: share_link,
					type: 'TEXT',
				},
			}
			await delay(1000)
			const res: any = await sendMessageById(payload)
			const { code } = res || {}
			if (code === 200) {
				setShareList((prev: any) => ({ ...prev, [id]: true }))
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoadingShare((prev: any) => ({ ...prev, [id]: false }))
		}
	}

	const handleMenusClick = ({ key }) => {
		switch (key) {
			case 'share':
				handleSetOpenModal({ type: key })
				break
			case 'cancel':
				openConfirm({
					message:
						'We will send a message to inform the attendees that the event has been canceled',
					onAccept: () => {
						handleCancelEventConfirm()
						closeModal()
					},
					titleLabel: 'Cancel event',
				})
				break
			case 'ALL':
			case 'ONLY_THIS_EVENT':
				setOpenModal({ type: key, dataModal: detailPost })
				break
			default:
				break
		}
	}

	const postMenus: ItemType[] = useMemo(
		() => {
			const { user_id } = detailPost || {}
			const id = getUserInfo('id')
			return [
				{
					key: 'share',
					label: 'Share event',
					onClick: () => handleMenusClick({ key: 'share' }),
				},
				...(id === user_id
					? [
							{
								key: 'cancel',
								label: 'Cancel event',
								style: { color: '#F80024' },
								onClick: () => handleMenusClick({ key: 'cancel' }),
							},
					  ]
					: []),
			]
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[JSON.stringify(detailPost)],
	)
	const editMenus: ItemType[] = useMemo(
		() => {
			return [
				{
					key: 'ALL',
					label: 'Edit all future events',
					onClick: () => handleMenusClick({ key: 'ALL' }),
				},
				{
					key: 'ONLY_THIS_EVENT',
					label: 'Edit only this event',
					onClick: () => handleMenusClick({ key: 'ONLY_THIS_EVENT' }),
				},
			]
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[JSON.stringify(detailPost)],
	)
	useEffect(() => {
		handleGetDetailPost()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id])

	return {
		loading,
		loadingShare,
		detailPost,
		openModal,
		postMenus,
		editMenus,
		shareList,
		onCancelEvent: handleCancelEvent,
		onSetOpenModal: handleSetOpenModal,
		onJoinPostConfirm: handleJoinPostConfirm,
		onShareFriend: handleShareFriend,
		onGetDetailPost: handleGetDetailPost,
	}
}
