import { ItemType } from 'antd/es/menu/interface'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useLoading } from '@/context/LoadingContext'
import { useModal } from '@/context/ModalContext'

import { sendMessageById } from '@/apis/conversationApis'
import {
	deletePost,
	getDetailPost,
	getListParticipant,
	getPublicEventDetail,
	getPublicListParticipant,
	joinPost,
} from '@/apis/postApis'

import { delay } from '@/ultis/common'
import { useLocalePath } from '@/ultis/route'
import { getUserInfo } from '@/ultis/storage'
import { copyToClipboard, randomString } from '@/ultis/string'

import { mainRoutes } from '@/routes/MainRoutes'
import { repeatOpt } from '@/Variable/select.variable'
import { participantType } from '@/Variable/event.variable'

interface useDetailEventProps {
	id: string
	isPublic?: boolean
	onRequireLogin?: () => void
	[key: string]: any
}
export default function useDetailEvent({
	id: _id,
	isPublic,
	onRequireLogin,
}: useDetailEventProps) {
	const { openConfirm, openError, openSuccess, closeModal } = useModal()
	const { toggleLoadingContext } = useLoading()
	const { onChangeRoute } = useLocalePath()

	const _refKeyEventParticipant = useRef(randomString())
	const eventCommentRef = useRef<{ [key: string]: any }>({})

	const [detailPost, setDetailPost] = useState({}) as any
	const [id, setId] = useState(_id)
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
	const [participantList, setParticipantList] = useState([]) as any[]

	const handleSetLoading = ({ key, value }) => {
		setLoading((prev) => ({ ...prev, [key]: value }))
	}
	const handleGetDetailPost = async () => {
		let _data: any = {}
		handleSetLoading({ key: 'detailLoad', value: true })

		try {
			const params = {
				fields: ['$all', { user: ['name', 'phone', 'avatar', 'id'] }],
			}
			const [res, _]: any[] = await Promise.all([
				isPublic
					? getPublicEventDetail({ id, params })
					: getDetailPost({ id, params }),
				isPublic ? Promise.resolve() : handleGetListParticipant(),
			])
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
				_refKeyEventParticipant.current = randomString()
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
		if (isPublic) {
			onRequireLogin?.()
			return
		}
		switch (type) {
			case 'join':
				handleJoinPost()
				break
			case 'leave':
				openConfirm({
					titleLabel: 'Leave activity',
					message: 'Are you sure want to leave activity ?',
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

	const handleGetListParticipant = async () => {
		try {
			const params = {
				fields: ['$all', { user: ['name', 'phone', 'avatar', 'is_verified'] }],
				where: isPublic
					? { post_id: id }
					: { post_id: id, type: participantType.ADMIN },
				page: 1,
				limit: 10,
			}
			const res: any = await (isPublic
				? getPublicListParticipant(params)
				: getListParticipant(params))
			const { code, results } = res || {}
			await delay(1000)
			if (code === 200) {
				const { rows } = results?.objects || {}
				const adminRows = isPublic
					? (rows || []).filter((item) => item?.type === participantType.ADMIN)
					: rows || []
				setParticipantList(adminRows)
			}
		} catch (error) {
			openError(error)
		} finally {
		}
	}

	const handleShareFriend = async (id: string) => {
		if (isPublic) {
			onRequireLogin?.()
			return
		}
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
		if (isPublic) {
			onRequireLogin?.()
			return
		}
		switch (key) {
			case 'share':
				handleSetOpenModal({ type: key })
				break
			case 'cancel':
				openConfirm({
					message:
						'We will send a message to inform the attendees that the activity has been canceled',
					onAccept: () => {
						handleCancelEventConfirm()
						closeModal()
					},
					titleLabel: 'Cancel activity',
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
	const handleCopy = () => {
		copyToClipboard(detailPost?.share_link, {
			callback: openSuccess({ message: 'Link copied successfully! ' }),
		})
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

	const postMenus: ItemType[] = useMemo(
		() => {
			if (isPublic) {
				return [
					{
						key: 'share',
						label: 'Share activity',
						onClick: () => handleMenusClick({ key: 'share' }),
					},
				]
			}
			const { user_id, repeat_type } = detailPost || {}
			const { type } = repeat_type || {}

			const isRepeat = type !== repeatOpt[0].value

			const id = getUserInfo('id')
			const isHost =
				id === user_id ||
				!!participantList.find((item) => item.user_id === getUserInfo('id'))
			return [
				...(isHost
					? [
							{
								key: 'extend',
								label: 'Extend activity',
								onClick: () =>
									handleSetOpenModal({ type: 'extend', dataModal: detailPost }),
							},
							{
								key: 'edit',
								label: 'Edit activity',
								onClick: () =>
									!isRepeat &&
									handleSetOpenModal({ type: 'edit', dataModal: detailPost }),
								children: isRepeat
									? [
											{
												key: 'ALL',
												label: 'Edit all future activities',
												onClick: () => handleMenusClick({ key: 'ALL' }),
											},
											{
												key: 'ONLY_THIS_EVENT',
												label: 'Edit only this activity',
												onClick: () =>
													handleMenusClick({ key: 'ONLY_THIS_EVENT' }),
											},
										]
									: null,
							},
						]
					: []),
				{
					key: 'share',
					label: 'Share activity',
					onClick: () => handleMenusClick({ key: 'share' }),
				},
				...(isHost
					? [
							{
								key: 'cancel',
								label: 'Cancel activity',
								style: { color: '#F80024' },
								onClick: () => handleMenusClick({ key: 'cancel' }),
							},
						]
					: []),
			]
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[JSON.stringify(detailPost), JSON.stringify(participantList), isPublic],
	)

	const editMenus: ItemType[] = useMemo(
		() => {
			return [
				{
					key: 'ALL',
					label: 'Edit all future activities',
					onClick: () => handleMenusClick({ key: 'ALL' }),
				},
				{
					key: 'ONLY_THIS_EVENT',
					label: 'Edit only this activity',
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

	useEffect(() => {
		setId(_id)
	}, [_id])
	return {
		_refKeyEventParticipant,
		eventCommentRef,

		id,
		loading,
		loadingShare,
		detailPost,
		openModal,
		postMenus,
		editMenus,
		shareList,
		participantList,
		onCancelEvent: handleCancelEvent,
		onSetOpenModal: handleSetOpenModal,
		onJoinPostConfirm: handleJoinPostConfirm,
		onShareFriend: handleShareFriend,
		onGetDetailPost: handleGetDetailPost,
		onCopy: handleCopy,
		setId,
		onScroll: handleScroll,
	}
}
