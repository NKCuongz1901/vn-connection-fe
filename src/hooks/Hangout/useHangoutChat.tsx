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
	deleteCommentPost,
	getListCommentById,
	getListParticipant,
	sendCommentPost,
} from '@/apis/postApis'

import { useLoading } from '@/context/LoadingContext'
import { useModal } from '@/context/ModalContext'

import { mappingMessageChat, uniqueArray } from '@/ultis/array'
import { cloneDeep, delay } from '@/ultis/common'
import { onPushState } from '@/ultis/route'
import { getUserInfo } from '@/ultis/storage'
import { parseMentions, randomString } from '@/ultis/string'

import { PaginationType } from '@/interface/common/common.interface'
import { paginationCommon } from '@/Variable/common.variable'
import {
	handleUploadAudio,
} from '@/apis/uploadApis'
import { buildChatMediasPayload } from '@/ultis/chatMedia'
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
	const [mentionData, setMentionData] = useState<
		{ id: string; display: string; avatar?: string }[]
	>([])
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
				label: 'Edit meeting point',
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
		type: _type,
		content,
		medias: _medias,
		parent,
		audio,
	}: {
		type: string
		content?: string
		medias?: any[]
		parent?: any
		audio?: any
	}) => {
		try {
			const { _id: parent_id } = parent || {}
			let type = _type
			let medias: any[] = []
			if (_medias?.length > 0) {
				medias = await buildChatMediasPayload(_medias)
				if (medias.length > 0) {
					type = 'MEDIAS'
				}
			}
			if (!!audio) {
				const resAudio = await handleUploadAudio(audio)
				type = 'MEDIAS'
				medias.push({
					url: resAudio,
					fileName: null,
					width: null,
					height: null,
					ratio: null,
					type: 'AUDIO',
					thumbnail: null,
					duration: 3,
				})
			}
			const { text: parsedText, mentions } =
				type !== 'MEDIAS' && content
					? parseMentions(content)
					: { text: content, mentions: [] }

			const _id = randomString()
			const _res = {
				content: parsedText,
				mentions,
				type,
				user_id: getUserInfo('id'),
				id: _id,
				_id,
				isTemp: true,
				...(parent && { parent }),
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
				content: parsedText,
				mentions,
				medias,
				type,
				...(parent_id && { parent_id }),
			})
			const _data = res?.results?.object || {}
			const { id } = _data || {}
			setCommentList((prev: any[]) => {
				const contents = prev
				let newData = []
				const idx = contents.findIndex((i) => i.id === _id)
				if (idx > -1) {
					contents[idx] = { ..._data, _id: id, ...(parent && { parent }) }
					newData = contents
				} else {
					newData = uniqueArray(
						[{ ..._data, _id: id, ...(parent && { parent }) }, ...contents],
						'_id',
					)
				}

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
								'languages_can_speak_array',
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
			const { code, results } = res || {}
			if (code == 200) {
				const { object } = results || {}
				setHangoutInfo((prev) => ({
					...prev,
					...object,
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
	const handleGetMentionParticipants = async () => {
		try {
			const res: any = await getListParticipant({
				fields: [
					'$all',
					{ user: ['name', 'phone', 'avatar', 'is_verified'] },
				],
				where: {
					post_id: postId,
					request_join_status: 'ACCEPT',
				},
				page: 1,
				limit: 100,
			})
			const rows = res?.results?.objects?.rows || []
			const currentUserId = getUserInfo('id')
			const mapped = rows
				.map((i: any) => ({
					id: i?.user_id,
					display: i?.user?.name,
					avatar: i?.user?.avatar,
				}))
				.filter(
					(i: { id: string; display: string }) =>
						!!i.id && !!i.display && i.id !== currentUserId,
				)
			setMentionData(mapped)
		} catch (error) {
			console.log('handleGetMentionParticipants', error)
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
							'languages_can_speak_array',
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
				if (request_join_status === 'ACCEPT') {
					handleGetMentionParticipants()
				}
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
	const handleDeleteMessage = async (value) => {
		const { id } = value || {}
		try {
			setCommentList((prev) =>
				prev.map((i) => (i.id === id ? { ...i, isTemp: true } : i)),
			)
			const res: any = await deleteCommentPost(id)
			if (res?.results?.object) {
				setCommentList((prev) => {
					const _data = prev.filter((i) => i.id !== id)
					return mappingMessageChat(_data)
				})
			}
		} catch (error) {
			openError(error)
			setCommentList((prev) =>
				prev.map((i) => (i.id === id ? { ...i, isTemp: false } : i)),
			)
		} finally {
		}
	}

	const handleActionMessage = async ({ key, value }) => {
		switch (key) {
			case 'delete':
				handleDeleteMessage(value)
				break
			default:
				break
		}
	}
	useEffect(() => {
		_paginationRefs.current.page = 1
		handleGetInfoHangout()
		handleGetListCommentById()
		handleGetMentionParticipants()
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
		mentionData,
		setShowGGmap,
		onSendMessage: handleSendMessage,
		onChangeTitleHangout: handleChangeTitleHangout,
		onEditLocation: handleEditLocation,
		onActionPart: handleActionPart,
		onLoadMore: handleLoadMore,
		onActionMessage: handleActionMessage,
	}
}
