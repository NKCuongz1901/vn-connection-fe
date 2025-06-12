import { ItemType } from 'antd/es/menu/interface'
import { useEffect, useMemo, useRef, useState } from 'react'

import {
	deleteHangoutParticipantId,
	getHangoutById,
	updateHangoutById,
} from '@/apis/hangoutApi'
import {
	getListCommentById,
	getListSticket,
	sendCommentPost,
} from '@/apis/postApis'

import { useLoading } from '@/context/LoadingContext'
import { useModal } from '@/context/ModalContext'

import { uniqueArray } from '@/ultis/array.ults'
import { cloneDeep, delay } from '@/ultis/common.ults'
import { onPushState } from '@/ultis/route.ults'
import { getUserInfo } from '@/ultis/storage.ults'
import { randomString } from '@/ultis/string.ults'

import { PaginationType } from '@/interface/common/common.interface'
import { paginationCommon } from '@/Variable/common.variable'

type useHangoutChatProps = {
	postId: string
}
export default function useHangoutChat({ postId }: useHangoutChatProps) {
	const { toggleLoadingContext } = useLoading()
	const { openError } = useModal()
	const _paginationRefs = useRef<PaginationType>(cloneDeep(paginationCommon))
	const _loadmore = useRef<boolean>(true)
	const _scrollRef = useRef<HTMLDivElement>(null)

	const [modal, setModal] = useState({ type: '', data: null }) as any
	const [hangoutInfo, setHangoutInfo] = useState<{ [key: string]: any }>({})
	const [stickerList, setStickerList] = useState([]) as any[]
	const [activeSticker, setActiveSticker] = useState(0)
	const [showSticker, setShowSticker] = useState(false)
	const [text, setText] = useState('')
	const [commentList, setCommentList] = useState<any[]>([])
	const [loading, setLoading] = useState(false)
	const [loadingPage, setLoadingPage] = useState(false)
	const handleMenusClick = ({ key }: { [key: string]: any }) => {
		const { title } = hangoutInfo
		switch (key) {
			// case 'report':
			// 	window.open(onGetPath('/report'), '_blank')
			// 	break
			case 'edit':
				setModal({ type: 'choose', data: title })
				break
			case 'leave':
				handleLeaveHangout()
				break
			default:
		}
	}
	const menus: ItemType[] = useMemo(() => {
		const { user } = hangoutInfo
		const _isMe = getUserInfo('id') === user?.id

		return [
			// ...(!isMe
			// 	? [
			// 			{
			// 				key: 'report',
			// 				label: 'Report Hangout',
			// 				onClick: () => handleMenusClick({ key: 'report' }),
			// 			},
			// 	  ]
			// 	: []),
			{
				key: 'edit',
				label: 'Edit Hangout',
				onClick: () => handleMenusClick({ key: 'edit' }),
			},
			{
				key: 'leave',
				label: 'Leave Hangout',
				onClick: () => handleMenusClick({ key: 'leave' }),
			},
			// {
			// 	key: 'editMettingPoint',
			// 	label: 'Edit metting point',
			// 	onClick: () => handleMenusClick({ key: 'editMettingPoint' }),
			// },
		]
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [hangoutInfo])

	const handleGetListCommentById = async (isNoLoading?: boolean) => {
		if (!isNoLoading) setLoading(true)
		try {
			const { page, limit } = _paginationRefs.current
			// const isNew = page === 1
			// if (isNew) {
			// 	setCommentList([])
			// }
			const res: any = await getListCommentById({
				fields: ['$all', { user: ['name', 'phone', 'avatar', 'is_verified'] }],
				where: { post_id: postId },
				page: isNoLoading ? 1 : page,
				limit,
			})
			const { code, results } = res || {}
			await delay(1000)

			if (code === 200) {
				const { rows: _rows } = results?.objects || {}
				if (_rows.length < limit) {
					_loadmore.current = false
				}
				setCommentList((prev: any[]) => {
					const contents = prev || []
					const newData = isNoLoading
						? uniqueArray([..._rows, ...contents], 'id')
						: uniqueArray([...contents, ..._rows], 'id') || []
					const dataShow = newData.map((item, index) => ({
						...item,
						isFirst: newData?.[index + 1]?.user_id === item?.user_id,
						isLast: newData?.[index - 1]?.user_id !== item?.user_id,
						_id: item.id,
					}))

					return dataShow
				})
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoading(false)
		}
	}
	const handleLoadMore = async () => {
		if (!_loadmore.current || loading) return
		_paginationRefs.current.page += 1
		await handleGetListCommentById()
	}
	const handleScroll = (e: any) => {
		const clientHeight = e.target.clientHeight
		const scrollHeight = e.target.scrollHeight
		const scrollTop = Math.abs(e.target.scrollTop)
		const isReachedEnd = scrollTop + clientHeight >= scrollHeight - 50
		if (!isReachedEnd) return

		handleLoadMore()
	}
	const handleChangeTitleHangout = async (text: string) => {
		toggleLoadingContext(true)
		try {
			const res: any = await updateHangoutById({ id: postId, title: text })
			if (res?.code == 200) {
				handleGetListCommentById(true)
				setHangoutInfo({ ...hangoutInfo, title: text })
				setModal({ type: '' })
			}
		} catch (error) {
			openError(error)
		} finally {
			toggleLoadingContext()
		}
	}
	const handleLeaveHangout = async () => {
		toggleLoadingContext(true)
		const { participant } = hangoutInfo
		try {
			const res: any = await deleteHangoutParticipantId({ id: participant.id })
			if (res?.code == 200) {
				onPushState({})
			}
		} catch (error) {
			openError(error)
		} finally {
			toggleLoadingContext()
		}
	}
	const handleSendMessage = async ({
		type,
		content,
		medias,
	}: {
		type: string
		content?: string
		medias?: []
	}) => {
		try {
			const _id = randomString()
			if (type === 'TEXT') {
				setText('')
			}
			const _res = {
				content,
				type,
				user_id: getUserInfo('id'),
				id: _id,
				_id,
				isTemp: true,
			}
			setCommentList((prev: any[]) => {
				const contents = prev
				const newData = [_res, ...contents]
				const dataShow = newData.map((item, index) => ({
					...item,
					isFirst: newData?.[index + 1]?.user_id === item?.user_id,
					isLast: newData?.[index - 1]?.user_id !== item?.user_id,
				}))

				return dataShow
			})
			if (_scrollRef.current) {
				_scrollRef.current.scrollTop = _scrollRef.current.scrollHeight
			}
			const res: any = await sendCommentPost({
				post_id: postId,
				content,
				medias,
				type,
			})
			const _data = res?.results?.object || {}
			setCommentList((prev: any[]) => {
				const contents = prev
				const newData = uniqueArray([{ ..._data, _id }, ...contents], '_id')
				const dataShow = newData.map((item, index) => ({
					...item,
					isFirst: newData?.[index + 1]?.user_id === item?.user_id,
					isLast: newData?.[index - 1]?.user_id !== item?.user_id,
				}))

				return dataShow
			})
		} catch (error) {
			openError(error)
		}
	}
	const handleGetSticker = async () => {
		try {
			const res: any = await getListSticket({
				fields: ['$all'],
			})
			setStickerList(res?.results?.objects?.rows || [])
		} catch (error) {
			openError(error)
		}
	}
	const handleGetInfoHangout = async () => {
		setLoadingPage(true)
		try {
			const res: any = await getHangoutById({
				id: postId,
				params: {
					fields: [
						'$all',
						{
							user: [
								'name',
								'phone',
								'avatar',
								'languages_can_speak',
								'birthday',
								'id',
								'gender',
								'is_verified',
							],
						},
					],
				},
			})
			setHangoutInfo(res?.results?.object)
		} catch (error) {
			openError(error)
		} finally {
			setLoadingPage(false)
		}
	}

	useEffect(() => {
		_paginationRefs.current.page = 1
		handleGetInfoHangout()
		handleGetListCommentById()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [postId])

	useEffect(() => {
		handleGetSticker()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return {
		_scrollRef,
		commentList,
		hangoutInfo,
		activeSticker,
		showSticker,
		stickerList,
		loadingPage,
		loading,
		text,
		menus,
		modal,
		setModal,
		setText,
		setActiveSticker,
		setShowSticker,
		onSendMessage: handleSendMessage,
		onScroll: handleScroll,
		onChangeTitleHangout: handleChangeTitleHangout,
	}
}
