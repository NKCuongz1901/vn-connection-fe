import { ItemType } from 'antd/es/menu/interface'
import { useEffect, useMemo, useRef, useState } from 'react'

import {
	deleteConvById,
	getAnnouListById,
	getConvInfoById,
	getPublicAnnouListById,
	getPublicConvInfoById,
	joinConversation,
	leaveConversation,
	likeAnnoun,
	sendMessageById,
	updateConvMember,
} from '@/apis/conversationApis'

import { useModal } from '@/context/ModalContext'

import { useLoading } from '@/context/LoadingContext'

import { blockUser } from '@/apis/userApis'

import { isArray, uniqueArray } from '@/ultis/array'
import { cloneDeep, delay, handleScrollCallback } from '@/ultis/common'
import { useLocalePath, useSafeBack } from '@/ultis/route'
import { getUserInfo, isLogin } from '@/ultis/storage'
import { copyToClipboard } from '@/ultis/string'

import { paginationCommon } from '@/Variable/common.variable'

import CSwitch from '@/Components/Custom/CSwitch'
import { PaginationType } from '@/interface/common/common.interface'
import {
	AnnouncementProps,
	ConversationProps,
} from '@/interface/Community/Community.interface'
import { mainRoutes } from '@/routes/MainRoutes'
import { Flex } from 'antd'

const mappingAboutTabsBtn = {
	about: 'about',
	annou: 'annou',
}

interface useDetailCommunityProps {
	id: string
	isPublic?: boolean
	onRequireLogin?: () => void
	[key: string]: any
}

export default function useDetailCommunity(props: useDetailCommunityProps) {
	const { openError, openSuccess, openConfirm } = useModal()
	const { toggleLoadingContext } = useLoading()
	const { onChangeRoute } = useLocalePath()
	const { goBackOrPush } = useSafeBack()
	const { id, isPublic, onRequireLogin } = props

	const _loadmore = useRef(true)
	const _paginationRefs = useRef<PaginationType>(cloneDeep(paginationCommon))
	const discussionRef = useRef<{ [key: string]: any }>({})
	const memberRef = useRef<{ [key: string]: any }>({})

	const [modal, setModal] = useState({
		type: '',
		data: null,
		title: null,
	}) as any

	const [loadingAnnou, setLoadingAnnou] = useState(true)
	const [loadingConvInfo, setLoadingConvInfo] = useState(true)
	const [loadingShare, setLoadingShare] = useState({}) as any
	const [loadingApi, setLoadingApi] = useState({}) as any

	const [convInfo, setConvInfo] = useState<ConversationProps>()
	const [total, setTotal] = useState({ annount: 0 })
	const [annouList, setAnnouList] = useState<AnnouncementProps[]>([])
	const [loadIds, setLoadingIds] = useState<string[]>([])
	const [shareList, setShareList] = useState([]) as any

	const [tabTop, setTabTop] = useState<string>('')

	const [tabMiddle, setTabMiddle] = useState(mappingAboutTabsBtn.about)

	const handleUpdateNoti = async () => {
		try {
			setLoadingApi((prev) => ({ ...prev, noti: true }))
			const { id, join } = convInfo || {}
			const { id: memberId, is_accept_notification } = join || {}
			const res: any = await updateConvMember({
				id,
				memberId,
				payload: { is_accept_notification: !is_accept_notification },
			})
			if (res) {
				handleGetInfoConv(true)
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoadingApi((prev) => ({ ...prev, noti: false }))
		}
	}

	const handleGetInfoConv = async (isNotLoading = false) => {
		if (!isNotLoading) {
			setLoadingConvInfo(true)
		}
		try {
			const res: any = isPublic
				? await getPublicConvInfoById({ id })
				: await getConvInfoById({
						id,
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

			const res: any = isPublic
				? await getPublicAnnouListById({ params: payload })
				: await getAnnouListById({ params: payload })
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

	const handleLike = async (annouId: string) => {
		if (isPublic && !isLogin()) {
			onRequireLogin?.()
			return
		}
		if (loadIds.includes(annouId)) return
		try {
			setLoadingIds((prev) => [...prev, annouId])
			const res: any = await likeAnnoun({ id: annouId })
			if (res) {
				const { status } = res?.results?.object
				setAnnouList((prev) =>
					prev.map((item) => {
						if (item.id === annouId) {
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
			setLoadingIds((prev) => prev.filter((item) => item !== annouId))
		}
	}

	const handleShareFriend = async (friendId) => {
		if (isPublic && !isLogin()) {
			onRequireLogin?.()
			return
		}
		if (!friendId) return

		const { share_link } = modal?.data?.props || {}
		if (!share_link) return

		setLoadingShare((prev: any) => ({ ...prev, [friendId]: true }))

		try {
			const payload = {
				receiver_id: friendId,
				message: {
					content: share_link,
					type: 'TEXT',
				},
			}
			const res: any = await sendMessageById(payload)
			const { code } = res || {}

			if (code === 200) {
				setShareList((prev: any) => ({ ...prev, [friendId]: true }))
				openSuccess({ message: 'Share link to your friend successfully' })
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoadingShare((prev: any) => ({ ...prev, [friendId]: false }))
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
		if (
			isPublic &&
			!isLogin() &&
			['like', 'share', 'block', 'report', 'addNewAnnou', 'editAnnou'].includes(
				key,
			)
		) {
			onRequireLogin?.()
			return
		}
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
			case 'editCommunity':
				handleGetInfoConv(true)
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
		if (isPublic && !isLogin()) {
			return [
				{
					key: 'share',
					label: 'Share',
					onClick: () => onRequireLogin?.(),
				},
			] as ItemType[]
		}

		const isMe = user_id === getUserInfo()?.id

		const menus: ItemType[] = [
			{
				key: 'share',
				label: 'Share',
				onClick: () =>
					handleAction({ key: 'share', value: { ...props, id, user_id } }),
			},
		]
		if (isPublic) {
			return menus
		}
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
	const handleBack = () => {
		if (isPublic) {
			if (tabTop) {
				setTabTop('')
				return
			}
			goBackOrPush(mainRoutes.login)
			return
		}
		if (tabTop) {
			return setTabTop('')
		} else {
			goBackOrPush()
		}
	}

	const handleJoinConv = async (convId) => {
		if (isPublic && !isLogin()) {
			onRequireLogin?.()
			return
		}
		try {
			setLoadingApi((prev) => ({ ...prev, join: true }))
			await joinConversation({ id: convId, status: true })
			handleGetInfoConv(true)
			if (memberRef.current?.onGetMember) {
				memberRef.current.onGetMember()
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoadingApi((prev) => ({ ...prev, join: false }))
		}
	}

	const handleLeaveConv = async () => {
		try {
			setLoadingApi((prev) => ({ ...prev, join: true }))
			await leaveConversation({ id })
			handleGetInfoConv(true)
			openSuccess({ message: 'You leave community successfull' })
			if (memberRef.current?.onGetMember) {
				memberRef.current.onGetMember()
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoadingApi((prev) => ({ ...prev, join: false }))
		}
	}
	const handleDeleteConv = async (id) => {
		toggleLoadingContext(true)
		try {
			const res: any = await deleteConvById({ id })
			await delay(500)
			if (res?.code === 200) {
				openConfirm({
					message: `Delete community successfull`,
					onAccept: () => onChangeRoute(mainRoutes.community),
				})
			}
		} catch (error) {
			openError(error)
		} finally {
			toggleLoadingContext()
		}
	}
	const handleConfirmDelete = () => {
		const { id } = convInfo || {}

		openConfirm({
			message: 'Are you sure want to remove this conversation?',
			titleLabel: 'Delete this conversation',
			onAccept: () => handleDeleteConv(id),
			ctype: 'error',
		})
	}
	const menus: ItemType[] = useMemo(() => {
		if (isPublic && !isLogin()) {
			return [
				{
					key: 'share',
					label: 'Share community',
					onClick: () => onRequireLogin?.(),
				},
			]
		}

		if (isPublic) {
			return [
				{
					key: 'share',
					label: 'Share community',
					onClick: () => handleAction({ key: 'share', value: convInfo }),
				},
			]
		}

		const { host_id, join } = convInfo || {}
		const { is_accept_notification } = join || {}
		const isMe = getUserInfo('id') === host_id

		const returnData: ItemType[] = [
			{
				key: 'share',
				label: 'Share community',
				onClick: () => handleAction({ key: 'share', value: convInfo }),
			},

			...(!isMe
				? [
						{
							key: 'reportCommunity',
							label: 'Report an issue',
							onClick: () =>
								setModal({
									type: 'reportCommunity',
									data: { id, user_id: host_id },
									title: 'You want to report this community?',
								}),
						},
				  ]
				: [
						{
							key: 'edit',
							label: 'Edit',
							onClick: () =>
								setModal({
									type: 'editCommunity',
									data: cloneDeep(convInfo),
								}),
						},
				  ]),
			...(!!join
				? [
						{
							key: 'Mute notification',
							label: (
								<Flex gap={8} align="center">
									<div>Mute notification</div>
									<CSwitch
										disabled={!!loadingApi.noti}
										checked={!is_accept_notification}
										ctype="success"
										onChange={handleUpdateNoti}
									/>
								</Flex>
							),
						},
				  ]
				: []),
			...(isMe
				? [
						{
							key: 'delete',
							label: 'Delete community',
							style: { color: '#F80024' },
							onClick: handleConfirmDelete,
						},
				  ]
				: []),
			...(!!join && !isMe
				? [
						{
							key: 'leave',
							style: { color: '#F80024' },
							label: 'Leave community',
							onClick: handleLeaveConv,
						},
				  ]
				: []),

			// {
			// 	key: 'editMettingPoint',
			// 	label: 'Edit meeting point',
			// 	onClick: () => handleMenusClick({ key: 'editMettingPoint' }),
			// },
		]
		return returnData
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [convInfo, loadingApi.noti, isPublic])

	useEffect(() => {
		handleGetInfoConv()
		handleGetListAnnou()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id])

	return {
		discussionRef,
		memberRef,

		loadingApi,
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

		menus,

		setTabTop,
		setModal,
		setShareList,
		setTabMiddle,
		onScroll: handleScroll,
		onAction: handleAction,
		onCopy: handleCopy,
		onShareFriend: handleShareFriend,
		onGetMenus: handleGetMenus,
		onBack: handleBack,
		onJoinConv: handleJoinConv,
		onLeaveConv: handleLeaveConv,
	}
}
