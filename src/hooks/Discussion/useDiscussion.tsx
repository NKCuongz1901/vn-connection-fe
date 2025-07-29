import { ItemType } from 'antd/es/menu/interface'
import { useEffect, useRef, useState } from 'react'

import { useLoading } from '@/context/LoadingContext'
import { useModal } from '@/context/ModalContext'

import { sendMessageById } from '@/apis/conversationApis'
import {
	getDiscuss,
	getMyCategory,
	getRecommendCategory,
	likeCategory,
	likeDiscuss,
} from '@/apis/discussionApis'
import { blockUser } from '@/apis/userApis'

import { isArray, uniqueArray } from '@/ultis/array.ults'
import { cloneDeep, delay } from '@/ultis/common.ults'
import { onPushState, useQuery } from '@/ultis/route.ults'
import { getUserInfo } from '@/ultis/storage.ults'
import { copyToClipboard } from '@/ultis/string.ults'

import { PaginationType } from '@/interface/common/common.interface'
import { paginationCommon } from '@/Variable/common.variable'

export default function useDiscussion({}) {
	const { openError, openSuccess, openConfirm } = useModal()
	const { toggleLoadingContext } = useLoading()
	const { onGetQuerry } = useQuery()
	const { category_id } = onGetQuerry()
	const _paginationRefs = useRef<PaginationType>(cloneDeep(paginationCommon))
	const _paginationRecommendRefs = useRef<PaginationType>(
		cloneDeep(paginationCommon),
	)
	const _loadmore = useRef<boolean>(true)

	const [modal, setModal] = useState({ type: '', data: null }) as any
	const [title, setTitle] = useState('')
	const [categoryId, setCategoryId] = useState(category_id || '')
	const [loadingShare, setLoadingShare] = useState({}) as any

	const [myCategory, setMyCategory] = useState<any[]>([])
	const [recommendCategory, setRecommendCategory] = useState<any[]>([])
	const [discuss, setDiscuss] = useState<any[]>([])
	const [shareList, setShareList] = useState([]) as any
	const [loadIds, setLoadingIds] = useState<any[]>([])

	const [loadingJoin, setLoadingJoin] = useState(false)
	const [loading, setLoading] = useState({
		myCategory: false,
		recommend: false,
		discuss: true,
	})

	const handleGetMyCategory = async () => {
		const { page, limit } = _paginationRecommendRefs.current
		setLoading((prev) => ({ ...prev, myCategory: true }))

		try {
			const res: any = await getMyCategory({
				fields: ['$all'],
				page,
				limit,
			})
			if (res) {
				const { rows } = res?.results?.objects || {}
				const arr = (rows || []).flatMap((item) => item.children)
				setMyCategory(arr)
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoading((prev) => ({ ...prev, myCategory: false }))
		}
	}
	const handleGeRecommendCategory = async () => {
		const { page, limit } = _paginationRecommendRefs.current
		setLoading((prev) => ({ ...prev, recommend: true }))

		try {
			const res: any = await getRecommendCategory({
				fields: ['$all'],
				page,
				limit,
			})
			if (res) {
				const { rows } = res?.results?.objects || {}
				const arr = (rows || []).flatMap((item) => item.children)
				setRecommendCategory(arr)
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoading((prev) => ({ ...prev, recommend: false }))
		}
	}
	const handleJoinCategory = async (id) => {
		try {
			setLoadingJoin(true)
			toggleLoadingContext(true)
			const item = cloneDeep(recommendCategory).find((i) => i.id === id)
			const res: any = await likeCategory({ id })
			if (res) {
				setRecommendCategory((prev) => {
					return prev.filter((item) => item.id !== id)
				})
				setMyCategory((prev) => {
					return [...prev, item]
				})
			}
		} catch (error) {
			openError(error)
			setRecommendCategory((prev) =>
				prev.map((item) =>
					item.id === id ? { ...item, loading: false } : item,
				),
			)
		} finally {
			setLoadingJoin(false)
			toggleLoadingContext()
		}
	}
	const handleGetDiscuss = async (isNotLoading = false) => {
		setLoading((prev) => ({ ...prev, discuss: true }))

		try {
			const { page, limit } = _paginationRefs.current
			let isNew = page === 1
			if (isNotLoading) {
				isNew = false
			} else {
				if (isNew) {
					setDiscuss([])
				}
			}
			const res: any = await getDiscuss({
				fields: [
					'$all',
					{ user: ['name', 'avatar', 'id'] },
					{ category: ['title', 'image', 'id'] },
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
					...(category_id ? { category_id } : { type: 'DISCUSS_IN_TOPIC' }),
					...(title && { title }),
				},
				page,
				limit,
			})
			const { code, results } = res || {}
			await delay(1000)
			if (code === 200) {
				const { rows } = results?.objects || {}
				if (!isNotLoading) {
					_loadmore.current = isArray(rows, limit)
				}
				setDiscuss((prev: any[]) => {
					const contents = isNew && !isNotLoading ? [] : prev
					const dataShow = uniqueArray([...contents, ...rows], 'id') as any[]
					return dataShow
				})
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoading((prev) => ({ ...prev, discuss: false }))
		}
	}
	const handleLoadMore = async () => {
		if (!_loadmore.current || loading.discuss) return
		const { limit } = _paginationRefs.current
		const currentPage = Math.ceil((discuss || []).length / limit)
		_paginationRefs.current.page = currentPage + 1
		await handleGetDiscuss()
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
		if (loadIds.includes(id)) return
		try {
			setLoadingIds((prev) => [...prev, id])
			const res: any = await likeDiscuss({ id })
			if (res) {
				const { status } = res?.results?.object
				setDiscuss((prev) =>
					prev.map((item) => {
						if (item.id === id) {
							return {
								...item,
								is_liked: status === 'like',
								amount_of_like:
									(item.amount_of_like || 0) + (status === 'like' ? 1 : -1),
							}
						} else {
							return item
						}
					}),
				)
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoadingIds((prev) => prev.filter((item) => item !== id))
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
	const handleAction = ({ key, value }) => {
		switch (key) {
			case 'like':
				handleLikeDiscuss(value)
				break

			default:
				break
		}
	}
	const handleMenusClick = ({ key, value }) => {
		console.log('object', { key, value })
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
				},
				{
					key: 'delete',
					label: 'Delete',
					style: { color: '#F80024' },
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
	const handleChangeUrl = ({ key, value }) => {
		switch (key) {
			case 'category_id':
				if (category_id !== value.id) {
					setLoading((prev) => ({ ...prev, discuss: true }))
					setDiscuss([])
					setTitle('')
					onPushState({ category_id: value.id })
				}
				break

			default:
				break
		}
	}
	useEffect(() => {
		handleGetMyCategory()
		handleGeRecommendCategory()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])
	useEffect(() => {
		setCategoryId(category_id || '')
	}, [category_id])
	useEffect(() => {
		const id = setTimeout(() => {
			_paginationRefs.current.page = 1
			handleGetDiscuss()
		}, 1000) // 2s
		return () => {
			clearTimeout(id)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [title, categoryId])

	return {
		loading,
		loadingJoin,
		loadingShare,
		shareList,

		myCategory,
		recommendCategory,
		discuss,
		modal,
		setModal,
		title,
		setTitle,
		onJoinCategory: handleJoinCategory,
		onGetMenus: handleGetMenus,
		onCopy: handleCopy,
		onShareFriend: handleShareFriend,
		onScroll: handleScroll,
		onAction: handleAction,
		onChangeUrl: handleChangeUrl,
		onGetMyCategory: handleGetMyCategory,
		onGeRecommendCategory: handleGeRecommendCategory,
	}
}
