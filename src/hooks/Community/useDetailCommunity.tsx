import { ItemType } from 'antd/es/menu/interface'
import { useEffect, useRef, useState } from 'react'

import {
	getAnnouListById,
	getConvInfoById,
	likeAnnoun,
	sendMessageById,
} from '@/apis/conversationApis'

import { useModal } from '@/context/ModalContext'

import { useLoading } from '@/context/LoadingContext'

import { blockUser } from '@/apis/userApis'

import { isArray, uniqueArray } from '@/ultis/array.ults'
import { cloneDeep, delay, handleScrollCallback } from '@/ultis/common.ults'
import { getUserInfo } from '@/ultis/storage.ults'
import { copyToClipboard } from '@/ultis/string.ults'

import { paginationCommon } from '@/Variable/common.variable'

import { PaginationType } from '@/interface/common/common.interface'
import {
	AnnouncementProps,
	ConversationProps,
} from '@/interface/Community/Community.interface'

const mappingAboutTabsBtn = {
	about: 'about',
	annou: 'annou',
}

interface useDetailCommunityProps {
	id: string
	[key: string]: any
}

export default function useDetailCommunity(props: useDetailCommunityProps) {
	const { openError, openSuccess, openConfirm } = useModal()
	const { toggleLoadingContext } = useLoading()

	const { id } = props

	const _loadmore = useRef(true)
	const _paginationRefs = useRef<PaginationType>(cloneDeep(paginationCommon))
	const discussionRef = useRef<{ [key: string]: any }>({})

	const [modal, setModal] = useState({ type: '', data: null }) as any

	const [loadingAnnou, setLoadingAnnou] = useState(true)
	const [loadingConvInfo, setLoadingConvInfo] = useState(true)
	const [loadingShare, setLoadingShare] = useState({}) as any

	const [convInfo, setConvInfo] = useState<ConversationProps>()
	const [total, setTotal] = useState({ annount: 0 })
	const [annouList, setAnnouList] = useState<AnnouncementProps[]>([])
	const [loadIds, setLoadingIds] = useState<string[]>([])
	const [shareList, setShareList] = useState([]) as any

	const [tabTop, setTabTop] = useState<string>('topic')

	const [tabMiddle, setTabMiddle] = useState(mappingAboutTabsBtn.about)

	const handleGetInfoConv = async () => {
		setLoadingConvInfo(true)
		try {
			const res: any = await getConvInfoById({
				id: id,
				fields: ['$all'],
			})
			setConvInfo(res?.results?.object)
		} catch (error) {
			openError(error)
		} finally {
			setLoadingConvInfo(false)
		}
	}

	const handleGetListAnnou = async () => {
		setLoadingAnnou(true)
		try {
			const { page, limit } = _paginationRefs.current
			const isNew = page === 1
			if (isNew) {
				setAnnouList([])
			}
			const payload = {
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
				where: { conversation_id: id },
				page,
				limit,
			} as any

			const res: any = await getAnnouListById({ params: payload })
			await delay(500)
			const { code, results } = res || {}
			if (code === 200) {
				const { rows, count } = results?.objects || {}
				_loadmore.current = isArray(rows, limit)
				setTotal((prev) => ({ ...prev, annount: count || 0 }))
				setAnnouList((prev: any[]) => {
					const contents = isNew ? [] : prev
					const dataShow = uniqueArray([...contents, ...rows], 'id') as any[]
					return dataShow
				})
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoadingAnnou(false)
		}
	}
	const handleCopy = (data) => {
		copyToClipboard(data, {
			callback: openSuccess({ message: 'Link copied successfully! ' }),
		})
	}
	const handleLoadMore = async () => {
		if (!_loadmore.current || loadingAnnou) return
		const { limit } = _paginationRefs.current
		const currentPage = Math.trunc((annouList || []).length / limit)
		_paginationRefs.current.page = currentPage + 1
		await handleGetListAnnou()
	}

	const handleScroll = (e: any) => {
		if (tabMiddle !== mappingAboutTabsBtn.annou) return
		handleScrollCallback(e, handleLoadMore)
	}

	const handleLike = async (id: string) => {
		if (loadIds.includes(id)) return
		try {
			setLoadingIds((prev) => [...prev, id])
			const res: any = await likeAnnoun({ id })
			if (res) {
				const { status } = res?.results?.object
				setAnnouList((prev) =>
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
				handleLike(value)
				break
			case 'share':
				const { user, id } = value || {}
				const { id: user_id } = user || {}
				setModal({ type: 'share', data: { id, user_id, props: value } })
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
			case 'addNewAnnou':
				{
					if (value) {
						setAnnouList((prev) => [value, ...prev])
					}
				}
				break
			case 'editAnnou':
				{
					if (value) {
						setAnnouList((prev) =>
							prev.map((i) => (i.id === value.id ? { ...i, ...value } : i)),
						)
					}
				}
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
					handleAction({ key: 'share', value: { id, user_id, props } }),
			},
		]
		if (isMe) {
			menus.push(
				{
					key: 'edit',
					label: 'Edit',
					onClick: () =>
						setModal({
							type: 'editAnnou',
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
					onClick: () => handleAction({ key: 'delete', value: id }),
				},
			)
		} else {
			menus.push(
				{
					key: 'block',
					label: 'Block',
					onClick: () =>
						handleAction({ key: 'block', value: { id, user_id, props } }),
				},
				{
					key: 'report',
					label: 'Report',
					onClick: () =>
						handleAction({ key: 'report', value: { id, user_id, props } }),
				},
			)
		}

		return menus
	}

	useEffect(() => {
		handleGetInfoConv()
		handleGetListAnnou()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id])

	return {
		discussionRef,
		loadingConvInfo,
		loadingAnnou,
		convInfo,
		tabMiddle,
		annouList,
		total,
		modal,
		loadingShare,
		shareList,
		tabTop,

		setTabTop,
		setModal,
		setShareList,
		setTabMiddle,
		onScroll: handleScroll,
		onAction: handleAction,
		onCopy: handleCopy,
		onShareFriend: handleShareFriend,
		onGetMenus: handleGetMenus,
	}
}
