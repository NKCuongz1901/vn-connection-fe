import { ItemType } from 'antd/es/menu/interface'
import { useEffect, useMemo, useRef, useState } from 'react'

import { useLoading } from '@/context/LoadingContext'
import { useModal } from '@/context/ModalContext'

import { mappingMessageChat, uniqueArray } from '@/ultis/array.ults'
import { cloneDeep, delay } from '@/ultis/common.ults'
import { getStorageCookie, getUserInfo } from '@/ultis/storage.ults'
import { generateCustomUuid, randomString } from '@/ultis/string.ults'

import {
	getConvInfoById,
	getConvMembersById,
	getConvMessById,
	sendMessage,
} from '@/apis/conversationApis'
import { PaginationType } from '@/interface/common/common.interface'
import { paginationCommon } from '@/Variable/common.variable'
import { io } from 'socket.io-client'
const libraries: any = ['places']

type useHangoutChatProps = {
	convId: string
}
export default function useInboxChat({ convId }: useHangoutChatProps) {
	const { toggleLoadingContext } = useLoading()
	const { openError, openSuccess } = useModal()
	const _paginationRefs = useRef<PaginationType>(cloneDeep(paginationCommon))
	const _loadmore = useRef<boolean>(true)
	const _scrollRef = useRef<HTMLDivElement>(null)
	const [convInfo, setConvInfo] = useState<{ [key: string]: any }>({})
	const [members, setMember] = useState<any[]>([])
	const [messList, setMessList] = useState<any[]>([])
	const [loading, setLoading] = useState(false)
	const [loadingPage, setLoadingPage] = useState(false)

	const handleGetListMessById = async (isNoLoading?: boolean) => {
		if (!isNoLoading) setLoading(true)
		try {
			const { page, limit } = _paginationRefs.current
			const res: any = await getConvMessById({
				id: convId,
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
				setMessList((prev: any[]) => {
					const contents = prev || []
					const mappingRow = _rows.map((i) => ({
						user_id: i?.sender_id,
						user: i?.sender,
						...i,
					}))
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
		_paginationRefs.current.page += 1
		await handleGetListMessById()
	}

	const handleSendMessage = async ({
		type,
		content,
		medias,
		parent_id,
	}: {
		type: string
		content?: string
		medias?: []
		parent_id?: string
	}) => {
		try {
			const _id = randomString()
			const message = {
				type,
				message_local_id: generateCustomUuid(),
				...(parent_id && { parent_id }),
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
						{ user_id: _data.sender_id, user: _data?.sender, ..._data, _id },
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
		setLoadingPage(true)
		try {
			const res: any = await getConvInfoById({
				id: convId,
				fields: ['$all'],
			})
			setConvInfo(res?.results?.object)
		} catch (error) {
			openError(error)
		} finally {
			setLoadingPage(false)
		}
	}

	const handleGetMembersConv = async () => {
		setLoadingPage(true)
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

	useEffect(() => {
		_paginationRefs.current.page = 1
		handleGetInfoConv()
		handleGetListMessById()
		handleGetMembersConv()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [convId])

	const handleSocket = () => {
		const token = getStorageCookie('token')
		const uid = getUserInfo()?.id
		const socket = io('http://dev-api.univini.com:9001', {
			transports: ['websocket'],
			query: {
				token:
					'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJwYXlsb2FkIjp7InVzZXJfaWQiOiJlMTEwNDM2MC0wNzIxLTExZjAtYjM4NC0zZDI5ZmM4OWUyMTUiLCJyb2xlIjoiVVNFUiIsInR5cGUiOiJBQ0NFU1NfVE9LRU4iLCJuYW1lIjoiMTEyMyJ9LCJyb2xlIjoiVVNFUiIsImV4cCI6IjIwMjUtMDctMjVUMDA6NTU6NTEuNjQ3WiJ9.AewMq8uNCStuU-ckZSYCxvofYfCivwTEv3wVG9rZlfY',
				uid: 'e1104360-0721-11f0-b384-3d29fc89e215',
			},
		})
	}
	return {
		_scrollRef,
		messList,
		members,
		convInfo,
		loadingPage,
		loading,
		onSendMessage: handleSendMessage,
		onLoadMore: handleLoadMore,
		handleSocket: handleSocket,
	}
}
