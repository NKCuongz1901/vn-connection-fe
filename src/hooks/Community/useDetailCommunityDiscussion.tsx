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
	getDiscuss,
	getDiscussDetail,
	likeDiscuss,
} from '@/apis/discussionApis'
import { blockUser } from '@/apis/userApis'

import { isArray, uniqueArray } from '@/ultis/array'
import { cloneDeep, delay } from '@/ultis/common'
import { useQuery } from '@/ultis/route'
import { getUserInfo } from '@/ultis/storage'
import { copyToClipboard, randomString } from '@/ultis/string'

import { PaginationType } from '@/interface/common/common.interface'
import { paginationCommon } from '@/Variable/common.variable'

export default function useDetailCommunityDiscussion(props, ref) {
	const { id: conversation_id } = props
	const { openError, openSuccess, openConfirm } = useModal()
	const { toggleLoadingContext } = useLoading()
	const { onGetQuerry } = useQuery()
	const { id, force_id } = onGetQuerry()
	const _paginationRefs = useRef<PaginationType>(cloneDeep(paginationCommon))
	const _loadmore = useRef<boolean>(true)
	const _keyDiscuss = useRef(randomString())
	const [modal, setModal] = useState({ type: '', data: null }) as any
	const [discussId, setDiscussId] = useState('')

	const [loadingShare, setLoadingShare] = useState({}) as any

	const [totalDiscuss, setTotalDiscuss] = useState(0)

	const [discuss, setDiscuss] = useState<any[]>([])
	const [shareList, setShareList] = useState([]) as any
	const [loadIds, setLoadingIds] = useState<any[]>([])

	const [loading, setLoading] = useState({
		myCategory: false,
		recommend: false,
		discuss: true,
	})

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
					conversation_id,
				},
				page,
				limit,
			})
			const { code, results } = res || {}
			if (!isNotLoading) {
				await delay(1000)
			}
			if (code === 200) {
				const { rows, count } = results?.objects || {}
				if (!isNotLoading) {
					_loadmore.current = isArray(rows, limit)
				}
				setTotalDiscuss(count || 0)
				setDiscuss((prev: any[]) => {
					const contents = isNew && !isNotLoading ? [] : prev
					const dataShow = (
						!isNotLoading
							? uniqueArray([...contents, ...rows], 'id')
							: uniqueArray([...rows, ...contents], 'id')
					) as any[]
					return dataShow
				})
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoading((prev) => ({ ...prev, discuss: false }))
		}
	}
	const handleLoadMore = useCallback(async () => {
		if (!_loadmore.current || loading.discuss) return
		const { limit } = _paginationRefs.current
		const currentPage = Math.trunc((discuss || []).length / limit)
		_paginationRefs.current.page = currentPage + 1
		await handleGetDiscuss()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [JSON.stringify(discuss), loading.discuss])
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
				setDiscuss((prev) => (prev || []).filter((item) => item.user_id !== id))
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
	const handleReplace = async (id) => {
		try {
			const res: any = await getDiscussDetail({
				id,
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
				setDiscuss((prev) =>
					prev.map((item) => (item.id === id ? object : item)),
				)
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoading((prev) => ({ ...prev, discuss: false }))
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
			case 'addNew':
				{
					setTotalDiscuss((prev) => prev + 1)
					handleGetDiscuss(true)
				}
				break
			case 'edit':
				{
					const { id } = value

					handleReplace(id)
				}
				break
			case 'back':
				setDiscussId('')
				break
			default:
				break
		}
	}
	const handleDeleteDiscuss = async (id: string) => {
		toggleLoadingContext(true)
		try {
			const res: any = await deleteDiscussion({ id })
			if (res) {
				setDiscuss((prev: any[]) => prev.filter((item) => item.id !== id))
				setTotalDiscuss((prev) => prev - 1)
				openSuccess({
					message: 'You have successfully deleted this discuss',
				})
			}
		} catch (error) {
			openError(error)
		} finally {
			toggleLoadingContext()
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
				openSuccess({ message: 'Share link to your friend successfully' })
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoadingShare((prev: any) => ({ ...prev, [id]: false }))
		}
	}
	const handleChangeUrl = ({ key, value }) => {
		switch (key) {
			case 'id':
				if (id !== value.id) {
					_keyDiscuss.current = randomString()
					setDiscussId(value.id || '')
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
		[handleLoadMore, discussId],
	)

	useEffect(() => {
		if (force_id) {
			_paginationRefs.current.page = 1
			handleGetDiscuss()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [force_id])
	useEffect(() => {
		const id = setTimeout(() => {
			_paginationRefs.current.page = 1
			handleGetDiscuss()
		}, 1000) // 2s
		return () => {
			clearTimeout(id)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return {
		loading,
		loadingShare,
		shareList,
		discuss,
		modal,
		setModal,
		discussId,
		totalDiscuss,

		setShareList,
		onGetMenus: handleGetMenus,
		onCopy: handleCopy,
		onShareFriend: handleShareFriend,
		onScroll: handleScroll,
		onAction: handleAction,
		onChangeUrl: handleChangeUrl,
	}
}
