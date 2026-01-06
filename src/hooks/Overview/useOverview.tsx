'use client'
import { Dayjs } from 'dayjs'
import { useEffect, useRef, useState } from 'react'

import { useLoading } from '@/context/LoadingContext'
import { useModal } from '@/context/ModalContext'

import { getChatRoomList, getConvClubList } from '@/apis/conversationApis'
import { getUserOpenHangout } from '@/apis/hangoutApi'
import { getListPost, getmyEventInHome } from '@/apis/postApis'
import { getUserProfile, updateUserProfile } from '@/apis/userApis'

import { PaginationType } from '@/interface/common/common.interface'
import { isArray, uniqueArray } from '@/ultis/array.ults'
import { cloneDeep, delay } from '@/ultis/common.ults'
import { getUserInfo } from '@/ultis/storage.ults'

import { paginationCommon } from '@/Variable/common.variable'
import { mainRoutes } from '@/routes/MainRoutes'

import { NetworkItemProps } from '@/interface/Community/Community.interface'
import { ConversationChatRoomProps } from '@/interface/Conversation/Conversation.interface'

type userDataProps = {
	is_open_hangout: boolean
	title_open_hangout: string
	latitude: null | number
	longitude: null | number
}
type filterProps = {
	radius: number | null
	date: [Dayjs, Dayjs] | null
	categories: string[] | null
	title: string | null
}
export default function useOverview() {
	const { toggleLoadingContext } = useLoading()
	const { openError } = useModal()

	const _childRef = useRef<HTMLDivElement | null>(null)
	const _filterRef = useRef<filterProps>({
		radius: 50,
		date: null,
		categories: null,
		title: '',
	})
	const _parentRef = useRef<HTMLDivElement | null>(null)
	const _childRefUp = useRef<HTMLDivElement | null>(null)
	const _paginationRefs = useRef<PaginationType>(cloneDeep(paginationCommon))
	const _paginationNetworkRef = useRef<PaginationType>(
		cloneDeep(paginationCommon),
	)
	const timeoutRef = useRef<any>()
	const _loadmore = useRef({ myevent: true, network: true })
	const [modal, setModal] = useState({ type: '', data: null }) as any
	const [userData, setUserData] = useState<userDataProps>({
		is_open_hangout: false,
		title_open_hangout: '',
		latitude: null,
		longitude: null,
	})
	const [hangoutPeople, setHangoutPeople] = useState<any[]>([])
	const [totalHangout, setTotalHangout] = useState(0)

	const [listMyEvent, setListMyEvent] = useState<any[]>([])
	const [totalMyEvent, setTotalMyEvent] = useState(0)
	const [listPost, setListPost] = useState([]) as any[]
	const [listChatRoom, setListChatRoom] = useState<ConversationChatRoomProps[]>(
		[],
	)
	const [listNetwork, setListNetwork] = useState<NetworkItemProps[]>([])

	const [loadingProfile, setLoadingProfile] = useState<boolean>(false)
	const [loadingMyEvent, setLoadingMyEvent] = useState<boolean>(false)
	const [loading, setLoading] = useState({
		event: false,
		network: false,
		chatroom: false,
	})
	const [total, setTotal] = useState({ event: 0, network: 0, chatroom: 0 })

	const [loadmore, setLoadMore] = useState(true)
	const [filters, setFilters] = useState<filterProps>({
		radius: 50,
		date: null,
		categories: null,
		title: '',
	})

	const handleChangeFilter = (type: string) => (value) => {
		switch (type) {
			case 'radius':
			case 'date':
			case 'categories':
				setFilters((prev) => ({ ...prev, [type]: value }))
				_filterRef.current[type] = value
				break
			default:
				break
		}
		setLoadMore(true)
		_paginationRefs.current.page = 1
		handleGetListPost()
		if (userData.is_open_hangout && type === 'radius') {
			handleGetOpenHangout()
		}
	}

	const handleChangeKeyword = (e) => {
		const value = e.target.value
		setFilters((prev) => ({ ...prev, title: value }))
		_filterRef.current.title = value
		if (timeoutRef) {
			clearTimeout(timeoutRef.current)
		}
		timeoutRef.current = setTimeout(() => {
			setLoadMore(true)
			_paginationRefs.current.page = 1
			handleGetListPost()
		}, 1000)
	}

	const handleGetListPost = async (isNotLoading = false) => {
		setLoading((prev) => ({ ...prev, event: true }))
		try {
			const { page, limit } = _paginationRefs.current
			const { radius, date, categories, title } = _filterRef.current
			const dates = {}
			if (date) {
				Object.assign(dates, {
					start_time: date[0].startOf('day').valueOf(),
					end_time: date[0].endOf('day').valueOf(),
				})
			}
			let isNew = page === 1
			if (isNotLoading) {
				isNew = false
			}
			if (isNew) {
				setListPost([])
			}
			const res: any = await getListPost({
				fields: ['$all', { user: ['name', 'phone', 'avatar', 'is_verified'] }],
				page: !isNotLoading ? page : 1,
				limit: !isNotLoading ? limit : 50,
				type: mainRoutes.upcomingEvent,
				radius,
				...(categories && { categories: [categories] }),
				...(title && { title }),
				...dates,
			})
			const { code, results } = res || {}
			await delay(1000)
			if (code === 200) {
				const { rows, count } = results?.objects || {}
				if (!isNotLoading) {
					setLoadMore(isArray(rows, limit))
				}
				setListPost((prev: any[]) => {
					const contents = isNew && !isNotLoading ? [] : prev
					const dataShow = uniqueArray([...contents, ...rows], 'id') as any[]
					return dataShow
				})
				setTotal((prev) => ({ ...prev, event: count }))
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoading((prev) => ({ ...prev, event: false }))
		}
	}
	const handleGetListChatRoom = async (isNotLoading = false) => {
		setLoading((prev) => ({ ...prev, chatroom: true }))
		try {
			const { page, limit } = _paginationRefs.current
			let isNew = page === 1
			if (isNotLoading) {
				isNew = false
			}
			if (isNew) {
				setListChatRoom([])
			}
			const res: any = await getChatRoomList({
				fields: ['$all'],
				page: !isNotLoading ? page : 1,
				limit: !isNotLoading ? limit : 50,
				order: [['created_at', 'desc']],
			})
			const { code, results } = res || {}
			await delay(500)
			if (code === 200) {
				const { rows, count } = results?.objects || {}
				setListChatRoom((prev: ConversationChatRoomProps[]) => {
					const contents = isNew && !isNotLoading ? [] : prev
					const dataShow = uniqueArray([...contents, ...rows], 'id') as any[]
					return dataShow
				})
				setTotal((prev) => ({ ...prev, chatroom: count }))
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoading((prev) => ({ ...prev, chatroom: false }))
		}
	}
	const handleGetListNetwork = async (isNotLoading = false) => {
		setLoading((prev) => ({ ...prev, network: true }))
		try {
			const { page, limit } = _paginationNetworkRef.current
			let isNew = page === 1
			if (isNotLoading) {
				isNew = false
			}
			if (isNew) {
				setListNetwork([])
			}
			const res: any = await getConvClubList({
				fields: ['$all'],
				page: !isNotLoading ? page : 1,
				limit: !isNotLoading ? limit : 50,
			})
			const { code, results } = res || {}
			await delay(1000)
			if (code === 200) {
				const { rows, count } = results?.objects || {}
				if (!isNotLoading) {
					_loadmore.current.network = false
				}
				setListNetwork((prev: any[]) => {
					const contents = isNew && !isNotLoading ? [] : prev
					const dataShow = uniqueArray([...contents, ...rows], 'id') as any[]
					return dataShow
				})
				setTotal((prev) => ({ ...prev, network: count }))
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoading((prev) => ({ ...prev, network: false }))
		}
	}
	const handleGetUserProfile = async () => {
		const id = getUserInfo('id')
		setLoadingProfile(true)
		try {
			const res: any = await getUserProfile({
				id,
				params: {
					fields: ['$all'],
				},
			})
			const { code, results } = res || {}
			if (code === 200) {
				const { is_open_hangout, title_open_hangout, latitude, longitude } =
					results?.object || {}
				setUserData({
					is_open_hangout,
					title_open_hangout,
					latitude,
					longitude,
				})
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoadingProfile(false)
		}
	}
	const handleUpdateUserInfo = async (otherData) => {
		toggleLoadingContext(true)
		try {
			const payload = {
				...userData,
				...otherData,
			}
			const res = (await updateUserProfile(payload)) as any
			await delay(500)
			const { code, results } = res || {}

			if (code === 200) {
				const { is_open_hangout, title_open_hangout, latitude, longitude } =
					results?.object || {}
				setUserData({
					is_open_hangout,
					title_open_hangout,
					latitude,
					longitude,
				})
			}
		} catch (error) {
			openError(error)
		} finally {
			toggleLoadingContext()
		}
	}
	const handleOnChangeTitleHangout = async (values) => {
		setUserData((pre) => ({ ...pre, title_open_hangout: values }))
		setModal(null)
		try {
			await handleUpdateUserInfo({ title_open_hangout: values })
		} catch (error) {
			openError(error)
		}
	}
	const handleCRUDSuccess = ({ key, value }) => {
		switch (key) {
			case 'create':
				setListMyEvent((prev) => [value, ...prev])
				setTotalMyEvent((prev) => prev + 1)
				break
			case 'createNetwork':
				setListNetwork((prev) => [value, ...prev])
				setTotal((prev) => ({ ...prev, network: prev.network + 1 }))
				break
			default:
				break
		}
	}
	const handleGetMyEvent = async (isNoLoading?: boolean) => {
		if (!isNoLoading) {
			setLoadingMyEvent(true)
		}
		try {
			const { page, limit } = _paginationRefs.current
			let isNew = false
			if (!isNoLoading && page === 1) {
				setListMyEvent([])
				isNew = true
			}
			const res: any = await getmyEventInHome({
				fields: ['$all', { user: ['name', 'phone', 'avatar', 'is_verified'] }],
				page: isNoLoading ? 1 : page,
				limit: isNoLoading ? 20 : limit,
			})
			const { code, results, pagination } = res || {}
			if (!isNoLoading) {
				await delay(1000)
			}

			if (code === 200) {
				const { rows: _rows } = results?.objects || {}
				if (!isNoLoading && _rows.length < limit) {
					_loadmore.current.myevent = false
				}
				setTotalMyEvent(pagination?.total || 0)
				setListMyEvent((prev: any[]) => {
					const contents = isNew ? [] : prev
					const mappingRow = _rows.map((i) => {
						return {
							...i,
						}
					})
					const newData = isNoLoading
						? uniqueArray([...mappingRow, ...contents], 'id')
						: uniqueArray([...contents, ...mappingRow], 'id') || []
					return newData
				})
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoadingMyEvent(false)
		}
	}

	const handleLoadMore = async () => {
		if (!_loadmore.current.myevent || loadingMyEvent) return
		const { limit } = _paginationRefs.current
		const currentPage = Math.trunc((listMyEvent || []).length / limit)
		_paginationRefs.current.page = currentPage + 1
		await handleGetMyEvent()
	}
	const handleScroll = (e: any) => {
		const clientWidth = e.target.clientWidth
		const scrollWidth = e.target.scrollWidth
		const scrollLeft = Math.abs(e.target.scrollLeft)
		const isReachedEnd = scrollLeft + clientWidth >= scrollWidth - 50
		if (!isReachedEnd) return

		handleLoadMore()
	}
	const handleGetOpenHangout = async () => {
		try {
			const { radius } = _filterRef.current
			const res: any = await getUserOpenHangout({
				fields: ['$all'],
				radius: radius,
			})
			if (res) {
				const { pagination, results } = res || {}
				const { rows } = results?.objects || {}
				const { total } = pagination || {}
				setHangoutPeople([getUserInfo(), ...rows])
				setTotalHangout(total || 0)
			}
		} catch (error) {
			openError(error)
		}
	}

	const handleLoadMoreUp = async () => {
		const { limit } = _paginationRefs.current

		if (!loadmore || loading.event) return
		_paginationRefs.current.page =
			Math.trunc((listPost || []).length / limit) + 1
		await handleGetListPost()
	}

	const handleScrollUp = (e: any) => {
		const clientHeight = e.target.clientHeight
		const scrollHeight = e.target.scrollHeight
		const scrollTop = Math.abs(e.target.scrollTop)
		const isReachedEnd = scrollTop + clientHeight >= scrollHeight - 50
		if (!isReachedEnd) return

		handleLoadMoreUp()
	}
	const handleAutoLoadMore = () => {
		if (_parentRef.current && _childRefUp.current) {
			if (
				_parentRef.current?.clientHeight > _childRefUp.current?.scrollHeight
			) {
				handleLoadMoreUp()
			}
		}
	}
	useEffect(() => {
		handleGetUserProfile()
		handleGetMyEvent()
		handleGetListPost()
		handleGetListNetwork()
		handleGetListChatRoom()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	useEffect(() => {
		if (userData.is_open_hangout) {
			handleGetOpenHangout()
		} else {
			setHangoutPeople([getUserInfo()])
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userData.is_open_hangout])

	useEffect(() => {
		handleAutoLoadMore()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [JSON.stringify(listPost)])

	return {
		_childRef,
		_parentRef,
		_childRefUp,

		userData,
		modal,
		loadingProfile,
		loadingMyEvent,
		listMyEvent,
		totalMyEvent,
		totalHangout,
		hangoutPeople,
		setModal,
		loading,
		total,
		listPost,
		filters,
		listNetwork,
		listChatRoom,
		OnChangeTitleHangout: handleOnChangeTitleHangout,
		onUpdateUserInfo: handleUpdateUserInfo,
		onCRUDSuccess: handleCRUDSuccess,
		onScroll: handleScroll,
		onScrollUp: handleScrollUp,
		onChangeFilter: handleChangeFilter,
		onChangeKeyword: handleChangeKeyword,
	}
}
