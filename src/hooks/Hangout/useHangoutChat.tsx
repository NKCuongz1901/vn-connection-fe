import { useLoadScript } from '@react-google-maps/api'
import { ItemType } from 'antd/es/menu/interface'
import { useEffect, useMemo, useRef, useState } from 'react'

import {
	actionParticipant,
	deleteHangoutParticipantId,
	getHangoutById,
	updateHangoutById,
} from '@/apis/hangoutApi'
import {
	getListCommentById,
	getListParticipant,
	sendCommentPost,
} from '@/apis/postApis'

import { useLoading } from '@/context/LoadingContext'
import { useModal } from '@/context/ModalContext'

import { mappingMessageChat, uniqueArray } from '@/ultis/array.ults'
import { cloneDeep, delay } from '@/ultis/common.ults'
import { onPushState } from '@/ultis/route.ults'
import { getUserInfo } from '@/ultis/storage.ults'
import { randomString } from '@/ultis/string.ults'

import { PaginationType } from '@/interface/common/common.interface'
import { paginationCommon } from '@/Variable/common.variable'
const libraries: any = ['places']

type useHangoutChatProps = {
	postId: string
	onAction: any
}
export default function useHangoutChat({
	postId,
	onAction,
}: useHangoutChatProps) {
	const { toggleLoadingContext } = useLoading()
	const { openError, openSuccess } = useModal()
	const _paginationRefs = useRef<PaginationType>(cloneDeep(paginationCommon))
	const _loadmore = useRef<boolean>(true)
	const _scrollRef = useRef<HTMLDivElement>(null)
	const { isLoaded } = useLoadScript({
		googleMapsApiKey: process.env.NEXT_PUBLIC_GGMAP_KEY || '', // ← Thay bằng API key của bạn
		libraries,
		language: 'en',
	})
	const [modal, setModal] = useState({ type: '', data: null }) as any
	const [hangoutInfo, setHangoutInfo] = useState<{ [key: string]: any }>({})
	const [commentList, setCommentList] = useState<any[]>([])
	const [listParticipant, setListParticipant] = useState<{
		[key: string]: any
	}>({
		WAITING: [],
	})
	const [loading, setLoading] = useState(false)
	const [loadingPage, setLoadingPage] = useState(false)
	const [showGGmap, setShowGGmap] = useState(false)
	const handleMenusClick = ({ key }: { [key: string]: any }) => {
		const { title, latitude, longitude, id } = hangoutInfo
		switch (key) {
			case 'report':
				setModal({ type: 'report', data: { hangout_id: id } })
				break
			case 'edit':
				setModal({ type: 'choose', data: title })
				break
			case 'leave':
				handleLeaveHangout()
				break
			case 'editMettingPoint':
				setModal({ type: 'location', data: { latitude, longitude } })
				break
			default:
		}
	}
	const menus: ItemType[] = useMemo(() => {
		const { user } = hangoutInfo
		const isMe = getUserInfo('id') === user?.id

		return [
			...(!isMe
				? [
						{
							key: 'report',
							label: 'Report Hangout',
							onClick: () => handleMenusClick({ key: 'report' }),
						},
				  ]
				: []),
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
			{
				key: 'editMettingPoint',
				label: 'Edit metting point',
				onClick: () => handleMenusClick({ key: 'editMettingPoint' }),
			},
		]
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [hangoutInfo])

	const handleGetListCommentById = async (isNoLoading?: boolean) => {
		if (!isNoLoading) setLoading(true)
		try {
			const { page, limit } = _paginationRefs.current
			const res: any = await getListCommentById({
				fields: ['$all', { user: ['name', 'phone', 'avatar', 'is_verified'] }],
				where: { post_id: postId },
				page: isNoLoading ? 1 : page,
				limit: isNoLoading ? 10 : limit,
			})
			const { code, results } = res || {}
			if (!isNoLoading) {
				await delay(1000)
			}

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
					const dataShow = mappingMessageChat(newData)

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
			console.log(
				'🏖️🏖️🏖️ TrieuNinhHan ~ :176 ~ handleLeaveHangout ~ res:',
				hangoutInfo,
			)

			if (res?.code == 200) {
				onPushState({})
				onAction({ key: 'leave', value: hangoutInfo })
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
				const dataShow = mappingMessageChat(newData)

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
				const dataShow = mappingMessageChat(newData)

				return dataShow
			})
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
	const handleEditLocation = async ({ lat, lng }) => {
		toggleLoadingContext(true)
		try {
			const res: any = await updateHangoutById({
				id: postId,
				latitude: lat,
				longitude: lng,
			})
			if (res?.code == 200) {
				setHangoutInfo((prev) => ({
					...prev,
					latitude: lat,
					longtitude: lng,
				}))
				setModal({ type: '' })
				handleGetListCommentById(true)
			}
		} catch (error) {
			openError(error)
		} finally {
			toggleLoadingContext()
		}
	}
	const handleGetWaitingParticipant = async ({ request_join_status }) => {
		try {
			const res: any = await getListParticipant({
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
				where: {
					post_id: postId,
					request_join_status,
				},
				page: 1,
				limit: 50,
			})
			if (res?.code == 200) {
				setListParticipant((pre) => ({
					...pre,
					[request_join_status]: res?.results?.objects?.rows || [],
				}))
			}
		} catch (error) {
			openError(error)
		} finally {
		}
	}
	const handleActionPart = async ({
		id,
		request_join_status,
	}: {
		id: string
		request_join_status: string
	}) => {
		toggleLoadingContext(true)
		try {
			const res: any = await actionParticipant({ id, request_join_status })
			if (res?.code === 200) {
				handleGetListCommentById(true)
				setListParticipant((prev) => ({
					...prev,
					WAITING: prev.WAITING.filter((item) => item?.id !== id),
				}))
				openSuccess({
					message: `You ${request_join_status.toLocaleLowerCase()} request !`,
				})
			}
		} catch (error) {
			openError(error)
		} finally {
			toggleLoadingContext(false)
		}
	}
	useEffect(() => {
		_paginationRefs.current.page = 1
		handleGetInfoHangout()
		handleGetListCommentById()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [postId])

	useEffect(() => {
		handleGetWaitingParticipant({ request_join_status: 'WAITING' })
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return {
		_scrollRef,
		commentList,
		hangoutInfo,
		loadingPage,
		loading,
		menus,
		modal,
		setModal,
		isLoaded,
		showGGmap,
		listParticipant,
		setShowGGmap,
		onSendMessage: handleSendMessage,
		onChangeTitleHangout: handleChangeTitleHangout,
		onEditLocation: handleEditLocation,
		onActionPart: handleActionPart,
		onLoadMore: handleLoadMore,
	}
}
