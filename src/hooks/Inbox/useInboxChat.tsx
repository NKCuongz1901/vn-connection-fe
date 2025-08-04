import { useEffect, useRef, useState } from 'react'

import { useModal } from '@/context/ModalContext'

import {
	deleteMessageById,
	getConvInfoById,
	getConvMembersById,
	getConvMessById,
	getPinMessageById,
	pinMessageById,
	sendMessage,
} from '@/apis/conversationApis'
import { handleUploadImage } from '@/apis/uploadApis'

import { mappingMessageChat, uniqueArray } from '@/ultis/array.ults'
import { cloneDeep, delay } from '@/ultis/common.ults'
import { getUserInfo } from '@/ultis/storage.ults'
import { generateCustomUuid, randomString } from '@/ultis/string.ults'

import { PaginationType } from '@/interface/common/common.interface'
import { paginationCommon } from '@/Variable/common.variable'

type useHangoutChatProps = {
	convId: string
}
export default function useInboxChat({ convId }: useHangoutChatProps) {
	const { openError } = useModal()
	const _paginationRefs = useRef<PaginationType>(cloneDeep(paginationCommon))
	const _loadmore = useRef<boolean>(true)
	const _scrollRef = useRef<HTMLDivElement>(null)

	const [convInfo, setConvInfo] = useState<{ [key: string]: any }>({})
	const [members, setMember] = useState<any[]>([])
	const [messList, setMessList] = useState<any[]>([])

	const [modal, setModal] = useState({ type: '', data: null }) as any
	const [openSetting, setOpenSetting] = useState(false)

	const [pinList, setPinList] = useState<any[]>([])
	const [totalPin, setTotalPin] = useState<number>(0)
	const [loading, setLoading] = useState(false)
	const [loadingPage, setLoadingPage] = useState(false)
	const [loadingConvInfo, setLoadingConvInfo] = useState(false)

	const handleGetListMessById = async (isNoLoading?: boolean) => {
		if (!isNoLoading) {
			setLoading(true)
		}
		try {
			const { page, limit } = _paginationRefs.current
			let isNew = false
			if (!isNoLoading && page === 1) {
				setMessList([])
				isNew = true
			}
			const res: any = await getConvMessById({
				id: convId,
				page: isNoLoading ? 1 : page,
				limit: isNoLoading ? 20 : limit,
			})
			const { code, results } = res || {}
			if (!isNoLoading) {
				await delay(1000)
			}

			if (code === 200) {
				const { rows: _rows } = results?.objects || {}
				if (!isNoLoading && _rows.length < limit) {
					_loadmore.current = false
				}
				setMessList((prev: any[]) => {
					const contents = isNew ? [] : prev
					const mappingRow = _rows.map((i) => {
						return {
							...i,
							user_id: i?.sender_id,
							user: i?.sender,
							parent: {
								...i?.parent,
								user_id: i?.parent?.sender_id,
								user: i?.parent?.sender,
							},
						}
					})
					const newData = isNoLoading
						? uniqueArray([...mappingRow, ...contents], 'id')
						: uniqueArray([...contents, ...mappingRow], 'id') || []
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
		const { limit } = _paginationRefs.current
		const currentPage = Math.trunc((messList || []).length / limit)
		_paginationRefs.current.page = currentPage + 1
		await handleGetListMessById()
	}

	const handleSendMessage = async ({
		type: _type,
		content,
		medias: _medias,
		parent,
	}: {
		type: string
		content?: string
		medias?: any[]
		parent?: any
	}) => {
		try {
			let type = _type
			let medias = []
			if (_medias?.length > 0) {
				const uploadPromises = _medias.map((media) =>
					handleUploadImage(media.file),
				)
				const resList = await Promise.all(uploadPromises)
				type = 'MEDIAS'
				medias = (resList || []).map((i) => ({
					url: i,
					type: 'IMAGE',
					fileName: null,
					width: 692,
					height: 1500,
					ratio: 0.4613333333333333,
					thumbnail: null,
					duration: 0,
				}))
			}
			const parent_id = parent?.id
			const _id = randomString()
			const message = {
				type,
				message_local_id: generateCustomUuid(),
				...(parent_id && { parent_id }),
				...(medias.length > 0 && { medias }),
			} as {
				[key: string]: any
			}
			switch (type) {
				default:
					message.content = content
					break
			}
			const _res = {
				content,
				type,
				user_id: getUserInfo('id'),
				id: _id,
				_id,
				isTemp: true,
				...(parent && { parent }),
			}
			setMessList((prev: any[]) => {
				const contents = prev
				const newData = [_res, ...contents]
				const dataShow = mappingMessageChat(newData)

				return dataShow
			})
			if (_scrollRef.current) {
				_scrollRef.current.scrollTop = _scrollRef.current.scrollHeight
			}
			const res: any = await sendMessage({
				conversation_id: convId,
				message: message,
			})
			const _data = res?.results?.object || {}
			setMessList((prev: any[]) => {
				const contents = prev
				const newData = uniqueArray(
					[
						{
							user_id: _data.sender_id,
							user: _data?.sender,
							..._data,
							_id,
							...(parent && { parent }),
						},
						...contents,
					],
					'_id',
				)
				const dataShow = mappingMessageChat(newData)

				return dataShow
			})
		} catch (error) {
			openError(error)
		}
	}

	const handleGetInfoConv = async () => {
		setLoadingConvInfo(true)
		try {
			const res: any = await getConvInfoById({
				id: convId,
				fields: ['$all'],
			})
			setConvInfo(res?.results?.object)
		} catch (error) {
			openError(error)
		} finally {
			setLoadingConvInfo(false)
		}
	}

	const handleGetMembersConv = async (isNoLoading = false) => {
		if (!isNoLoading) setLoadingPage(true)
		try {
			const res: any = await getConvMembersById({
				id: convId,
				fields: ['$all'],
				page: 1,
				limit: 50,
			})
			setMember(res?.results?.objects?.rows || [])
		} catch (error) {
			openError(error)
		} finally {
			setLoadingPage(false)
		}
	}
	const handleDeleteMessage = async (value) => {
		const { id } = value || {}
		try {
			setMessList((prev) =>
				prev.map((i) => (i.id === id ? { ...i, isTemp: true } : i)),
			)
			const res: any = await deleteMessageById({ id })
			if (res?.results?.object) {
				setMessList((prev) => {
					const _data = prev.filter((i) => i.id !== id)
					return mappingMessageChat(_data)
				})
			}
		} catch (error) {
			openError(error)
			setMessList((prev) =>
				prev.map((i) => (i.id === id ? { ...i, isTemp: false } : i)),
			)
		} finally {
		}
	}

	const handlePinMessage = async ({ key, value }) => {
		const { id } = value || {}
		try {
			const res: any = await pinMessageById({
				id: id,
				payload: {
					type_pin: key,
				},
			})
			const { code, results } = res || {}
			if (code === 200) {
				setMessList((prev) =>
					prev.map((i) =>
						i.id === id
							? { ...i, pin_message_at: !!results?.object?.pin_message_at }
							: i,
					),
				)
				handleGetListMessById(true)
				handleGetPinMessage()
			}
		} catch (error) {
			openError(error)
		}
	}
	const handleActionMessage = async ({ key, value }) => {
		switch (key) {
			case 'delete':
				handleDeleteMessage(value)
				break
			case 'pin':
			case 'unpin':
				handlePinMessage({ key, value })
				break
			default:
				break
		}
	}
	const handleGetPinMessage = async () => {
		try {
			const res: any = await getPinMessageById({
				id: convId,
				params: {
					page: 1,
					limit: 20,
				},
			})
			if (res) {
				const { rows, count } = res?.results?.objects || {}
				setPinList(rows)
				setTotalPin(count || 0)
			}
		} catch (error) {
			openError(error)
		}
	}
	const handleActionSettingConv = ({ key, value: _value }) => {
		switch (key) {
			case 'noti':
				handleGetMembersConv(true)
				break
			case 'back':
				setOpenSetting(false)
				break
			default:
				break
		}
	}
	useEffect(() => {
		_paginationRefs.current.page = 1
		handleGetInfoConv()
		handleGetListMessById()
		handleGetMembersConv()
		handleGetPinMessage()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [convId])

	return {
		_scrollRef,
		messList,
		pinList,
		members,
		convInfo,
		loadingPage,
		loading,
		loadingConvInfo,
		modal,
		totalPin,
		setModal,
		openSetting,
		setOpenSetting,
		onSendMessage: handleSendMessage,
		onLoadMore: handleLoadMore,
		onActionMessage: handleActionMessage,
		onGetPinMessage: handleGetPinMessage,
		onGetListMessById: handleGetListMessById,
		onActionSettingConv: handleActionSettingConv,
	}
}
