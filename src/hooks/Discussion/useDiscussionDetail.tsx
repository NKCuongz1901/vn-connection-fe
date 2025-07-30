import { ItemType } from 'antd/es/menu/interface'
import { useEffect, useRef, useState } from 'react'

import { useLoading } from '@/context/LoadingContext'
import { useModal } from '@/context/ModalContext'

import { sendMessageById } from '@/apis/conversationApis'
import {
	deleteDiscussion,
	getDiscussDetail,
	likeDiscuss,
} from '@/apis/discussionApis'
import {
	deleteCommentPost,
	getListCommentById,
	likeComment,
	sendCommentPost,
} from '@/apis/postApis'
import { blockUser } from '@/apis/userApis'

import { isArray, uniqueArray } from '@/ultis/array.ults'
import { cloneDeep, delay } from '@/ultis/common.ults'
import { onPushState, useQuery } from '@/ultis/route.ults'
import { getUserInfo } from '@/ultis/storage.ults'
import { copyToClipboard, randomString } from '@/ultis/string.ults'

import { PaginationType } from '@/interface/common/common.interface'
import { paginationCommon } from '@/Variable/common.variable'
interface useDiscussionDetailProps {
	discussId: string
	onActionProps?: any
}
export default function useDiscussionDetail({
	discussId,
	onActionProps = () => null,
}: useDiscussionDetailProps) {
	const { openError, openSuccess, openConfirm } = useModal()
	const { toggleLoadingContext, loadingContext } = useLoading()
	const { onGetQuerry } = useQuery()
	const { category_id } = onGetQuerry()
	const _paginationRefs = useRef<PaginationType>(cloneDeep(paginationCommon))
	const _paginationRecommendRefs = useRef<PaginationType>(
		cloneDeep(paginationCommon),
	)
	const _loadmore = useRef<boolean>(true)
	const _keyDiscuss = useRef(randomString())
	const [modal, setModal] = useState({ type: '', data: null }) as any

	const [commentContent, setCommentContent] = useState('')

	const [loadingShare, setLoadingShare] = useState({}) as any

	const [shareList, setShareList] = useState([]) as any
	const [commentList, setCommentList] = useState<any[]>([])
	const [totalComment, setTotalComment] = useState<number>(0)
	const [discussDetail, setDiscussDetail] = useState<any>(null)

	const [deleteLoading, setDeleteLoading] = useState<string[]>([])

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
	const handleGetComment = async (isNotLoading = false) => {
		setLoading((prev) => ({ ...prev, commentList: true }))

		try {
			const { page, limit } = _paginationRefs.current
			let isNew = page === 1
			if (isNotLoading) {
				isNew = false
			} else {
				if (isNew) {
					setCommentList([])
				}
			}
			const res: any = await getListCommentById({
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
				],
				where: {
					post_id: discussId,
					parent_id: null,
				},
				page,
				limit,
			})
			const { code, results } = res || {}
			await delay(1000)
			if (code === 200) {
				const { rows, count } = results?.objects || {}
				if (!isNotLoading) {
					_loadmore.current = isArray(rows, limit)
				}
				setTotalComment(count || 0)
				setCommentList((prev: any[]) => {
					const contents = isNew && !isNotLoading ? [] : prev
					const dataShow = uniqueArray([...contents, ...rows], 'id') as any[]
					return dataShow
				})
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoading((prev) => ({ ...prev, commentList: false }))
		}
	}

	const handleLoadMore = async () => {
		if (!_loadmore.current || loading.commentList) return
		const { limit } = _paginationRefs.current
		const currentPage = Math.trunc((commentList || []).length / limit)
		_paginationRefs.current.page = currentPage + 1
		await handleGetComment()
	}
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
					onAccept: () => handleChangeUrl({ key: 'backForce', value: null }),
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

	const handleLikeComment = async (id: string) => {
		if (loading.like) return
		try {
			setLoading((prev) => ({ ...prev, like: true }))
			const res: any = await likeComment({ id })
			if (res) {
				const { status } = res?.results?.object
				setCommentList((prev) =>
					prev.map((item) => {
						if (item.id === id) {
							return {
								...item,
								is_liked: status === 'like',
								amount_of_like:
									(item.amount_of_like || 0) + (status === 'like' ? 1 : -1),
							}
						}
						return item
					}),
				)
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoading((prev) => ({ ...prev, like: false }))
		}
	}

	const handleDeleteComment = async (id: string) => {
		try {
			setDeleteLoading((prev) => [...prev, id])
			const res: any = await deleteCommentPost(id)
			const { code } = res || {}
			if (code === 200) {
				setTotalComment((pre) => pre - 1)
				setCommentList((prev: any[]) => prev.filter((i) => i.id !== id))
				setDiscussDetail((prev) => ({
					...prev,
					amount_of_comment: (prev.amount_of_comment || 0) - 1,
				}))
			}
		} catch (error) {
			openError(error)
		} finally {
			setDeleteLoading((prev) => prev.filter((i) => i !== id))
		}
	}

	const handleActionCommentItem = ({ key, value }) => {
		switch (key) {
			case 'like':
				handleLikeComment(value)
				break
			case 'delete':
				handleDeleteComment(value)
				break
			case 'deleteChildComment':
				setCommentList((prev) =>
					prev.map((item) => {
						if (item.id === value) {
							return {
								...item,
								amount_of_replies: (item.amount_of_replies || 0) - 1,
							}
						}
						return item
					}),
				)
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
	const handleMenusClickCommentItem = ({ key, value }) => {
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
				setModal({ type: 'reportCommentItem', data: value })
				break
			default:
				break
		}
	}
	const handleGetMenusCommentItem = (item: { id: string; user_id: string }) => {
		const { user_id } = item
		const isMe = user_id === getUserInfo()?.id

		const menus: ItemType[] = []
		if (isMe) {
			menus.push(
				// {
				// 	key: 'edit',
				// 	label: 'Edit',
				// },
				{
					key: 'delete',
					label: 'Delete',
					style: { color: '#F80024' },
					onClick: () =>
						handleActionCommentItem({
							key: 'delete',
							value: item.id,
						}),
				},
			)
		} else {
			menus.push({
				key: 'report',
				label: 'Report',
				onClick: () =>
					handleMenusClickCommentItem({
						key: 'report',
						value: cloneDeep(item),
					}),
			})
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
	const handleChangeComment = (e) => {
		const content = e.target.value
		setCommentContent(content)
	}
	const handleSendCommentPost = async () => {
		if (!commentContent.trim() || loadingContext) {
			return
		}
		try {
			toggleLoadingContext(true)
			const res: any = await sendCommentPost({
				post_id: discussId,
				content: commentContent,
			})
			const { code, results } = res || {}
			if (code === 200) {
				const { object } = results || {}
				const { name, avatar, id, is_verified } = getUserInfo()
				const data = {
					...object,
					user: {
						name,
						avatar,
						id,
						is_verified,
					},
				}
				setCommentContent('')
				setCommentList((prev: any[]) => [data, ...prev])
				setTotalComment((prev) => prev + 1)
				setDiscussDetail((prev) => ({
					...prev,
					amount_of_comment: (prev.amount_of_comment || 0) + 1,
				}))
			}
		} catch (error) {
			openError(error)
		} finally {
			toggleLoadingContext()
		}
	}
	const handleKeyDown = (e) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault() // nếu cần chặn mặc định (như xuống dòng)
			e.stopPropagation()
			handleSendCommentPost()
			// Thực hiện hành động tại đây
		}
	}
	const handleChangeUrl = ({ key, value: _value }) => {
		switch (key) {
			case 'back':
				onPushState({
					...(category_id && { category_id, force_id: randomString() }),
				})
				break
			case 'backForce':
				onPushState({
					...(category_id && { category_id }),
					force_id: randomString(),
				})
				break
			default:
				break
		}
	}
	useEffect(() => {
		handleGetDetailDiscuss()
		handleGetComment()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [discussId])

	return {
		loading,
		loadingShare,
		deleteLoading,
		shareList,
		commentList,

		modal,
		setModal,
		discussDetail,
		totalComment,
		commentContent,

		onGetMenus: handleGetMenus,
		onGetMenusCommentItem: handleGetMenusCommentItem,
		onCopy: handleCopy,
		onShareFriend: handleShareFriend,
		onScroll: handleScroll,
		onAction: handleAction,
		onChangeUrl: handleChangeUrl,
		onSendComment: handleSendCommentPost,
		onKeyDown: handleKeyDown,
		onChangeComment: handleChangeComment,
		onActionCommentItem: handleActionCommentItem,
	}
}
