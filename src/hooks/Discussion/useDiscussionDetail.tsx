import { ItemType } from 'antd/es/menu/interface'
import {
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from 'react'

import { useLoading } from '@/context/LoadingContext'
import { useModal } from '@/context/ModalContext'

import { sendMessageById } from '@/apis/conversationApis'
import {
	deleteDiscussion,
	getDiscussDetail,
	likeDiscuss,
} from '@/apis/discussionApis'
import { blockUser } from '@/apis/userApis'

import { onPushState, useQuery } from '@/ultis/route'
import { getUserInfo } from '@/ultis/storage'
import { copyToClipboard, randomString } from '@/ultis/string'

interface useDiscussionDetailProps {
	discussId: string
	onActionProps?: any
	conversation_id?: string
}
export default function useDiscussionDetail(
	{
		discussId,
		conversation_id,
		onActionProps = () => null,
	}: useDiscussionDetailProps,
	ref,
) {
	const { openError, openSuccess, openConfirm } = useModal()
	const { toggleLoadingContext } = useLoading()
	const { onGetQuerry } = useQuery()
	const { category_id } = onGetQuerry()
	const eventCommentRef = useRef<{ [key: string]: any }>({})

	const [modal, setModal] = useState({ type: '', data: null }) as any

	const [loadingShare, setLoadingShare] = useState({}) as any

	const [shareList, setShareList] = useState([]) as any
	const [discussDetail, setDiscussDetail] = useState<any>(null)

	const [loading, setLoading] = useState({
		discuss: true,
		like: false,
		commentList: true,
	})
	const handleGetDetailDiscuss = async () => {
		try {
			setLoading((prev) => ({ ...prev, discuss: true }))
			const res: any = await getDiscussDetail({
				id: discussId,
				fields: [
					'$all',
					{ user: ['name', 'avatar', 'id'] },
					{
						medias: [
							'thumbnail',
							'duration',
							'url',
							'width',
							'height',
							'ratio',
							'type',
						],
					},
					{
						category: ['id', 'image', 'title'],
					},
				],
			})
			if (res) {
				const { object } = res?.results || {}
				setDiscussDetail(object)
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoading((prev) => ({ ...prev, discuss: false }))
		}
	}

	const handleLoadMore = useCallback(async () => {
		eventCommentRef.current?.onLoadMore()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [eventCommentRef.current?.onLoadMore])
	const handleScroll = (e: any) => {
		const clientHeight = e.target.clientHeight
		const scrollHeight = e.target.scrollHeight
		const scrollTop = Math.abs(e.target.scrollTop)
		const isReachedEnd = scrollTop + clientHeight >= scrollHeight - 50
		if (!isReachedEnd) return

		handleLoadMore()
	}
	const handleCopy = (data) => {
		copyToClipboard(data, {
			callback: openSuccess({ message: 'Link copied successfully! ' }),
		})
	}

	const handleLikeDiscuss = async (id: string) => {
		if (loading.like) return
		try {
			setLoading((prev) => ({ ...prev, like: true }))
			const res: any = await likeDiscuss({ id })
			if (res) {
				const { status } = res?.results?.object
				setDiscussDetail((prev) => ({
					...prev,
					is_liked: status === 'like',
					amount_of_like:
						(prev.amount_of_like || 0) + (status === 'like' ? 1 : -1),
				}))
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoading((prev) => ({ ...prev, like: false }))
		}
	}
	const handleBlockUser = async (id: string) => {
		toggleLoadingContext(true)
		try {
			const res: any = await blockUser(id)
			if (res) {
				openSuccess({
					message: 'You have successfully locked this user',
				})
			}
		} catch (error) {
			openError(error)
		} finally {
			toggleLoadingContext()
		}
	}
	const handleDeleteDiscuss = async (id: string) => {
		toggleLoadingContext(true)
		try {
			const res: any = await deleteDiscussion({ id })
			if (res) {
				openSuccess({
					message: 'You have successfully deleted this discuss',
					onAccept: () => handleChangeUrl({ key: 'backForce', value: id }),
				})
			}
		} catch (error) {
			openError(error)
		} finally {
			toggleLoadingContext()
		}
	}
	const handleAction = ({ key, value }) => {
		switch (key) {
			case 'like':
				handleLikeDiscuss(value)
				break
			case 'share':
				const { user, id } = value || {}
				const { id: user_id } = user || {}
				setModal({ type: 'share', data: { id, user_id, props: value } })
				break
			case 'edit':
				handleGetDetailDiscuss()
				onActionProps({ key: 'edit', value: { id: discussId } })
				break
			default:
				break
		}
	}

	const handleMenusClick = ({ key, value }) => {
		switch (key) {
			case 'share':
				setModal({ type: key, data: value })
				break
			case 'block':
				openConfirm({
					message: 'Do you want to block this user?',
					onAccept: () => handleBlockUser(value.user_id),
				})
				break
			case 'report':
				setModal({ type: 'report', data: value })
				break
			case 'delete':
				openConfirm({
					message: 'Do you want to delete this discussion?',
					onAccept: () => handleDeleteDiscuss(value),
				})
				break
			default:
				break
		}
	}
	const handleGetMenus = ({
		id,
		user_id,
		...props
	}: {
		id: string
		user_id: string
	}) => {
		const isMe = user_id === getUserInfo()?.id

		const menus: ItemType[] = [
			{
				key: 'share',
				label: 'Share',
				onClick: () =>
					handleMenusClick({ key: 'share', value: { id, user_id, props } }),
			},
		]
		if (isMe) {
			menus.push(
				{
					key: 'edit',
					label: 'Edit',
					onClick: () =>
						setModal({
							type: 'edit',
							data: {
								id,
								user_id,
								...props,
							},
						}),
				},
				{
					key: 'delete',
					label: 'Delete',
					style: { color: '#F80024' },
					onClick: () => handleMenusClick({ key: 'delete', value: id }),
				},
			)
		} else {
			menus.push(
				{
					key: 'block',
					label: 'Block',
					onClick: () =>
						handleMenusClick({ key: 'block', value: { id, user_id, props } }),
				},
				{
					key: 'report',
					label: 'Report',
					onClick: () =>
						handleMenusClick({ key: 'report', value: { id, user_id, props } }),
				},
			)
		}

		return menus
	}

	const handleShareFriend = async (id) => {
		setLoadingShare((prev: any) => ({ ...prev, [id]: true }))

		try {
			const { share_link } = modal?.data?.props || {}
			const payload = {
				receiver_id: id,
				message: {
					content: share_link,
					type: 'TEXT',
				},
			}
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

	const handleChangeUrl = ({ key, value: _value }) => {
		switch (key) {
			case 'back':
				onPushState({
					...(category_id && { category_id, force_id: randomString() }),
				})
				onActionProps({ key: 'back' })
				break
			case 'backForce':
				onPushState({
					...(category_id && { category_id }),
					force_id: randomString(),
				})
				if (conversation_id) {
					onActionProps({ key: 'back' })
				}
				break
			default:
				break
		}
	}

	useImperativeHandle(
		ref,
		() => ({
			...(ref.current || {}),
			onLoadMore: handleLoadMore,
		}),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[handleLoadMore],
	)

	useEffect(() => {
		handleGetDetailDiscuss()
		// handleGetComment()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [discussId])

	return {
		eventCommentRef,

		loadingShare,
		loading,
		shareList,
		discussDetail,
		modal,

		setModal,
		onShareFriend: handleShareFriend,
		onCopy: handleCopy,
		onChangeUrl: handleChangeUrl,
		onGetMenus: handleGetMenus,
		onAction: handleAction,
		onScroll: handleScroll,
	}
}
