import { useCallback, useEffect, useRef, useState } from 'react'

import { useModal } from '@/context/ModalContext'
import { useSocket } from '@/context/SocketContext'

import {
	createConversation,
	getConvList,
	getConvPersonal,
	getConvStranger,
} from '@/apis/conversationApis'
import { getFriends } from '@/apis/friendApis'

import { isArray, uniqueArray } from '@/ultis/array'
import { cloneDeep, delay, handleScrollCallback, toJson } from '@/ultis/common'
import { onPushState, useQuery } from '@/ultis/route'
import { getUserInfo } from '@/ultis/storage'
import { randomString } from '@/ultis/string'

import { optionFriends, paginationCommon } from '@/Variable/common.variable'

import { PaginationType } from '@/interface/common/common.interface'

export default function useInbox() {
	const { openError } = useModal()
	const { socket } = useSocket()
	const { onGetQuerry } = useQuery()

	const { id, force_id } = onGetQuerry()
	const key = useRef<string>(randomString())

	const _paginationStranger = useRef<PaginationType>(
		cloneDeep(paginationCommon),
	)
	const _paginationPersonal = useRef<PaginationType>(
		cloneDeep(paginationCommon),
	)

	const _paginationFriend = useRef<PaginationType>(cloneDeep(paginationCommon))
	const _paginationConv = useRef<PaginationType>(cloneDeep(paginationCommon))

	const loadMore = useRef({
		stranger: true,
		personal: true,
		conv: true,
		friend: true,
	})

	const [loadingConv, setLoadingConv] = useState({
		stranger: false,
		personal: false,
		conv: false,
		friend: false,
	})

	const [listConvStranger, setListConvStranger] = useState<any[]>([])
	const [listConvPersonal, setListConvPersonal] = useState<any[]>([])

	const [listFriend, setListFriend] = useState<any[]>([])
	const [listConv, setListConv] = useState<any[]>([])

	const [convId, setConvId] = useState(id || '')

	const [keyword, setKeyword] = useState('')

	const [enable, setEnable] = useState(true)
	const [show, setShow] = useState(false)
	const [showSearch, setShowSearch] = useState(false)
	const [searchType, setSearchType] = useState('conv')

	const handleGetConvStranger = async () => {
		setLoadingConv((prev) => ({ ...prev, stranger: true }))
		const { page, limit } = _paginationStranger.current
		try {
			const isNew = page === 1

			const res: any = await getConvStranger({
				fields: ['$all'],
				page,
				limit,
			})
			await delay(500)
			const { rows } = res?.results?.objects || {}
			if (!isArray(rows, limit)) {
				loadMore.current.stranger = false
			}
			if (isArray(rows)) {
				setListConvStranger((prev: any[]) => {
					const contents = isNew ? [] : prev
					const dataShow = uniqueArray([...contents, ...rows], 'id') as any[]

					return dataShow
				})
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoadingConv((prev) => ({ ...prev, stranger: false }))
		}
	}
	const handleGetConvPersonal = async () => {
		setLoadingConv((prev) => ({ ...prev, personal: true }))
		const { page, limit } = _paginationPersonal.current
		try {
			const isNew = page === 1
			if (isNew) {
				setListConvPersonal([])
			}
			const res: any = await getConvPersonal({
				fields: ['$all'],
				page,
				limit,
			})
			const { rows } = res?.results?.objects || {}
			await delay(500)
			if (!isArray(rows, limit)) {
				loadMore.current.personal = false
			}
			if (isArray(rows)) {
				setListConvPersonal((prev: any[]) => {
					const contents = isNew ? [] : prev
					const dataShow = uniqueArray([...contents, ...rows], 'id') as any[]

					return dataShow
				})
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoadingConv((prev) => ({ ...prev, personal: false }))
		}
	}

	const handleUpdateListConv = (id: string, is_read: boolean) => {
		setListConvPersonal((prev: any[]) => {
			const idx = (prev || []).findIndex((conv) => conv.id === id)
			if (idx > -1) {
				prev[idx].is_read = is_read
			}
			return prev
		})
		setListConv((prev: any[]) => {
			const idx = (prev || []).findIndex((conv) => conv.id === id)
			if (idx > -1) {
				prev[idx].is_read = is_read
			}
			return prev
		})
		setListConvStranger((prev: any[]) => {
			const idx = (prev || []).findIndex((conv) => conv.id === id)
			if (idx > -1) {
				prev[idx].is_read = is_read
			}
			return prev
		})
	}

	const handleLoadMore = useCallback(() => {
		const { stranger, personal } = loadMore.current || {}
		const isLoadMore = stranger || personal
		if (!isLoadMore || loadingConv.stranger || loadingConv.personal) return
		if (stranger) {
			_paginationStranger.current.page += 1
			handleGetConvStranger()
		}
		if (personal) {
			_paginationPersonal.current.page += 1
			handleGetConvPersonal()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [toJson(loadingConv)])

	const handleScroll = (e: any) => {
		const clientHeight = e.target.clientHeight
		const scrollHeight = e.target.scrollHeight
		const scrollTop = Math.abs(e.target.scrollTop)
		const isReachedEnd = scrollTop + clientHeight >= scrollHeight - 50
		if (!isReachedEnd) return

		handleLoadMore()
	}

	const handleParseDataSocket = useCallback((data) => {
		try {
			const { conversation_id, created_at_unix_timestamp, sender_id } =
				data || {}
			const isMe = getUserInfo('id') === sender_id

			if (conversation_id !== convId && !isMe) {
				handleUpdateListConv(conversation_id, false)
			}
			setListConvPersonal((prev: any[]) => {
				const newConv = prev.find((item) => item.id === conversation_id)
				if (newConv) {
					Object.assign(newConv, {
						last_message: data,
						last_time_chat: created_at_unix_timestamp,
					})
					const dataShow = uniqueArray([newConv, ...prev], 'id') as any[]
					return dataShow
				}
				return prev
			})
			setListConv((prev: any[]) => {
				const newConv = prev.find((item) => item.id === conversation_id)
				if (newConv) {
					Object.assign(newConv, {
						last_message: data,
						last_time_chat: created_at_unix_timestamp,
					})
					const dataShow = uniqueArray([newConv, ...prev], 'id') as any[]
					return dataShow
				}
				return prev
			})
		} catch (error) {
			console.log('error:', error)
		}
	}, [])

	const handleSearchConv = async () => {
		setLoadingConv((prev) => ({ ...prev, conv: true }))

		try {
			const { page, limit } = _paginationConv.current
			const isNew = page === 1
			if (isNew) {
				setListConv([])
			}
			const params = {
				fields: ['$all'],
				keyword: keyword,
				page,
				limit,
			}

			const res: any = await getConvList({ params })
			await delay(500)
			if (res) {
				const { rows } = res?.results?.objects
				if (!isArray(rows, limit)) {
					loadMore.current.conv = false
				}
				setListConv((prev) => {
					const newData = isNew
						? rows || []
						: [...(prev || []), ...(rows || [])]
					return uniqueArray(newData, 'id')
				})
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoadingConv((prev) => ({ ...prev, conv: false }))
		}
	}

	const handleSearchFriend = async () => {
		setLoadingConv((prev) => ({ ...prev, friend: true }))

		try {
			const { page, limit } = _paginationFriend.current
			const isNew = page === 1
			if (isNew) {
				setListFriend([])
			}
			const params = {
				type: optionFriends[0].value,
				fields: ['$all', { user: ['$all'] }, { friend: ['$all'] }],
				where: {
					name: keyword,
				},
				page,
				limit,
			}

			const res: any = await getFriends({ params })
			await delay(500)
			if (res) {
				const { rows } = res?.results?.objects
				if (!isArray(rows, limit)) {
					loadMore.current.friend = false
				}
				setListFriend((prev) => {
					const newData = isNew
						? rows || []
						: [...(prev || []), ...(rows || [])]
					return uniqueArray(newData, 'id')
				})
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoadingConv((prev) => ({ ...prev, friend: false }))
		}
	}

	const handleLoadMoreConv = async () => {
		if (!loadMore.current.conv || loadingConv.conv) return
		const { limit } = _paginationConv.current
		const currentPage = Math.trunc((listConv || []).length / limit)
		_paginationConv.current.page = currentPage + 1
		await handleSearchConv()
	}

	const handleScrollConv = (e: any) => {
		handleScrollCallback(e, handleLoadMoreConv)
	}

	const handleLoadMoreFriend = async () => {
		if (!loadMore.current.friend || loadingConv.friend) return
		const { limit } = _paginationFriend.current
		const currentPage = Math.trunc((listFriend || []).length / limit)
		_paginationFriend.current.page = currentPage + 1
		await handleSearchFriend()
	}

	const handleScrollFriend = (e: any) => {
		handleScrollCallback(e, handleLoadMoreFriend)
	}
	const handleCreateConv = async (id) => {
		try {
			const { name } = getUserInfo() || {}
			const payload = {
				title: name || '',
				member_ids: [id],
			}
			const res: any = await createConversation(payload)
			if (res) {
				const { id } = res?.results?.object || {}
				onPushState({ id })
			}
		} catch (error) {
			openError(error)
		}
	}
	useEffect(() => {
		handleGetConvStranger()
		handleGetConvPersonal()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])
	useEffect(() => {
		key.current = randomString()
		setConvId(id)
	}, [id])

	useEffect(() => {
		if (!socket) return

		socket.on('message', handleParseDataSocket)

		return () => {
			socket.off('message', handleParseDataSocket)
		}
	}, [handleParseDataSocket, socket])

	useEffect(() => {
		let id
		if (keyword.trim()) {
			id = setTimeout(() => {
				setShowSearch(true)
				loadMore.current.friend = true
				loadMore.current.conv = true
				_paginationFriend.current.page = 1
				_paginationConv.current.page = 1
				handleSearchConv()
				handleSearchFriend()
			}, 1000)
		} else {
			setShowSearch(false)
		}
		return () => {
			clearTimeout(id)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [keyword])
	useEffect(() => {
		if (force_id) {
			loadMore.current.friend = true
			loadMore.current.conv = true
			loadMore.current.personal = true
			loadMore.current.stranger = true
			_paginationFriend.current.page = 1
			_paginationConv.current.page = 1
			_paginationStranger.current.page = 1
			_paginationPersonal.current.page = 1
			handleSearchConv()
			handleSearchFriend()
			handleGetConvStranger()
			handleGetConvPersonal()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [force_id])
	return {
		key,
		loadingConv,
		listConvStranger,
		listConvPersonal,
		convId,
		enable,
		show,
		showSearch,
		keyword,
		listFriend,
		listConv,
		searchType,
		setSearchType,
		setKeyword,
		setShow,
		setEnable,
		setConvId,
		onScroll: handleScroll,
		onScrollFriend: handleScrollFriend,
		onScrollConv: handleScrollConv,
		onCreateConv: handleCreateConv,
		onUpdateListConv: handleUpdateListConv,
	}
}
