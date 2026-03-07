import { useEffect, useRef, useState } from 'react'

import { useModal } from '@/context/ModalContext'

import { isArray, uniqueArray } from '@/ultis/array.ults'
import {
	cloneDeep,
	delay,
	getCurrentLocation,
	handleScrollCallback,
} from '@/ultis/common.ults'
import { getUserInfo } from '@/ultis/storage.ults'

import {
	inviteAllJoinConv,
	inviteJoinConv,
	joinConversation,
	leaveConversation,
} from '@/apis/conversationApis'
import { getFullAddressFromLatLng } from '@/apis/ggApis'
import {
	getInappCategoryClub,
	getInappCategoryClubMatching,
	getInappCategoryUser,
	getInappCategoryUserMatching,
} from '@/apis/searchApis'

import { useQuery } from '@/ultis/route.ults'

import { paginationCommon } from '@/Variable/common.variable'
import { radiusOpts } from '@/Variable/select.variable'

import { PaginationType } from '@/interface/common/common.interface'
import {
	MatchingClubProps,
	MatchingUserProps,
	NetworkClubSearchInAppProps,
} from '@/interface/Community/Community.interface'

const tabs = [
	{
		value: 'club',
		label: 'Communities',
	},
	{
		value: 'user',
		label: 'People by interest',
	},
]

export default function useExploreInterest({}: any) {
	const { openError } = useModal()
	const [activeTab, setActiveTab] = useState('club')
	const { onGetQuerry } = useQuery()
	const { lat, lng, address, type } = onGetQuerry()

	const firstTime = useRef(true)

	const _paginationRefs = useRef<{ [key: string]: PaginationType }>({
		club: cloneDeep(paginationCommon),
		user: cloneDeep(paginationCommon),
	})
	const _loadmore = useRef({
		club: true,
		user: true,
	})

	const [filters, setFilters] = useState({
		address: address || '',
		latitude: Number(lat) || null,
		longitude: Number(lng) || null,
		radius: radiusOpts[radiusOpts.length - 1].value,
		type,
	})

	const [statusClub, setStatusClub] = useState({
		is_online: false,
		is_offline: true,
	})

	const [modal, setModal] = useState({ type: '', data: null }) as any

	const [loading, setLoading] = useState(true)
	const [loadingMatching, setLoadingMatching] = useState({
		club: true,
		user: true,
	})
	const [loadingInvite, setLoadingInvite] = useState({})
	const [invited, setInvited] = useState({})

	const [loadingJoin, setLoadingJoin] = useState([])
	const [selects, setSelects] = useState([])
	const [matchingClub, setMatchingClub] = useState<MatchingClubProps[]>([])
	const [matchingUser, setMatchingUser] = useState<MatchingUserProps[]>([])

	const [matching, setMatching] = useState(false)

	const [tabsData, setTabsData] = useState<{
		[key: string]: NetworkClubSearchInAppProps[]
	}>({
		[tabs[0].value]: [],
		[tabs[1].value]: [],
	})

	const handleChangeTab = (value: string) => {
		setActiveTab(value)
	}

	const handleChooseCategory = (id) => {
		if (selects.includes(id)) {
			setSelects((prev) => prev.filter((i) => i !== id))
		} else {
			if (!isArray(selects, 3)) {
				setSelects((prev) => [...prev, id])
			} else {
				openError('You can only select up to 3 communities')
			}
		}
	}

	const handleSetStatus = (item) => {
		const { is_offline, is_online } = statusClub
		if (
			(item === 'is_offline' && is_offline && !is_online) ||
			(item === 'is_online' && is_online && !is_offline)
		) {
			return
		}
		_paginationRefs.current.club.page = 1
		_loadmore.current.club = true
		setStatusClub((prev) => ({ ...prev, [item]: !prev[item] }))
	}

	const handleChangeFilter = (_key) => (_value) => {
		let key = _key
		let value = _value
		let other = {}
		switch (key) {
			case 'address':
				const { display_name, lat, lng } = _value || {}
				value = display_name
				key = 'address'
				other = {
					latitude: lat,
					longitude: lng,
				}
				break
			default:
				break
		}

		setFilters((prev) => ({ ...prev, [key]: value, ...other }))
	}
	const handleGetCategoryClubUserLocation = async ({ lat, lng }) => {
		let res
		if (firstTime.current) {
			res = await handleGetLocation({ lat, lng })
			firstTime.current = false
		}
		handleGetCategoryClubUser(res)
	}

	const handleGetAddress = async (marker) => {
		try {
			const res: any = await getFullAddressFromLatLng({
				lat: Number(marker?.lat) || null,
				lng: Number(marker?.lng) || null,
			})
			const { code, results } = res || {}
			if (code === 200) {
				const { formatted_address, geometry } =
					results?.object?.results?.[0] || {}
				setFilters((prev) => ({
					...prev,
					address: formatted_address,
				}))
				return {
					display_name: formatted_address || '',
					lat: geometry?.location?.lat || marker?.lat,
					lng: geometry?.location?.lng || marker?.lng,
				}
			}
		} catch (error) {
			console.log('error:', error)
		}
	}

	const handleGetLocation = async ({ lat, lng }) => {
		let res: any
		try {
			if (!!lat && !!Number(lat) && !!lng && !!Number(lng)) {
				// res = await handleGetAddress({ lat, lng })
			} else {
				res = await getCurrentLocation()
				if (res) {
					res = await handleGetAddress(res)
				}
			}
		} catch (error) {
			console.log(' error:', error)
		} finally {
			return res
		}
	}
	const handleGetCategoryClubUser = async ({ lat, lng }: any = {}) => {
		setLoading(true)
		try {
			const { latitude: _latitude, longitude: _longitude } = getUserInfo() || {}
			const { latitude, longitude, radius } = filters || {}
			const payload = {
				fields: ['$all'],
				latitude: latitude ?? lat ?? (_latitude || 0),
				longitude: longitude ?? lng ?? (_longitude || 0),
				google_title: address || '',
				...(type && {
					type: (type || '').split(','),
				}),
				radius,
			}
			setTabsData({
				club: [],
				user: [],
			})
			const res: any = await Promise.all([
				getInappCategoryClub(payload),
				getInappCategoryUser(payload),
			])
			const [club, user] = res || []
			const clubData = club?.results?.objects?.rows || {}
			const userData = user?.results?.objects?.rows || {}
			setTabsData({
				club: clubData || [],
				user: userData || [],
			})
		} catch (error) {
			openError(error)
		} finally {
			setLoading(false)
		}
	}

	const handleJoinConv = async (id) => {
		try {
			setLoadingJoin((prev) => [...prev, id])
			await joinConversation({ id, status: true })
			setMatchingClub((prev) =>
				prev.map((i) =>
					i.id === id
						? {
								...i,
								amount_of_user: i.amount_of_user + 1,
								users_in_conversation: [
									{
										conversation_id: id,
									},
								],
							}
						: i,
				),
			)
		} catch (error) {
			openError(error)
		} finally {
			setLoadingJoin((prev) => prev.filter((i) => i !== id))
		}
	}
	const handleLeaveConv = async (id) => {
		try {
			setLoadingJoin((prev) => [...prev, id])
			await leaveConversation({ id })
			setMatchingClub((prev) => {
				return prev.map((i) =>
					i.id === id
						? {
								...i,
								amount_of_user: i.amount_of_user - 1,
								users_in_conversation: [],
							}
						: i,
				)
			})
		} catch (error) {
			openError(error)
		} finally {
			setLoadingJoin((prev) => prev.filter((i) => i !== id))
		}
	}

	const handleGetMatchingClub = async (isNotLoading = false) => {
		setLoadingMatching((prev) => ({ ...prev, club: true }))

		try {
			const { page, limit } = _paginationRefs.current.club
			let isNew = page === 1
			if (isNotLoading) {
				isNew = false
			} else {
				if (isNew) {
					setMatchingClub([])
				}
			}
			const { latitude: _latitude, longitude: _longitude } = getUserInfo() || {}
			const { latitude, longitude, radius } = filters || {}
			const { is_online, is_offline } = statusClub
			const payload = {
				category_list: selects,
				latitude: latitude ?? (_latitude || 0),
				longitude: longitude ?? (_longitude || 0),
				...(is_online && { is_online }),
				...(is_offline && { is_offline }),
				radius,
				page,
				limit,
			}
			const res: any = await getInappCategoryClubMatching(payload)
			const { code, results } = res || {}
			if (!isNotLoading) {
				await delay(1000)
			}
			if (code === 200) {
				let { rows } = results?.objects || {}
				if (!isNotLoading) {
					_loadmore.current.club = isArray(rows, limit)
				}
				const mappingData = (selects || []).reduce((obj, item) => {
					const data = (tabsData.club || []).find((i) => i.id === item)
					obj[data.id] = data
					return obj
				}, {})
				setMatchingClub((prev: any[]) => {
					rows = (rows || []).map((i) => {
						const { category_list } = i || {}
						const newCate = (category_list || [])
							.reduce((arr: any[], item: any) => {
								if (mappingData[item]) {
									arr.push(mappingData[item]?.title)
								}
								return arr
							}, [])
							.join(', ')

						return { ...i, category: newCate }
					})
					const contents = isNew && !isNotLoading ? [] : prev
					const dataShow = (
						!isNotLoading
							? uniqueArray([...contents, ...rows], 'id')
							: uniqueArray([...rows, ...contents], 'id')
					) as any[]
					return dataShow
				})
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoadingMatching((prev) => ({ ...prev, club: false }))
		}
	}
	const handleGetMatchingUser = async (isNotLoading = false) => {
		setLoadingMatching((prev) => ({ ...prev, user: true }))

		try {
			const { page, limit } = _paginationRefs.current.user
			let isNew = page === 1
			if (isNotLoading) {
				isNew = false
			} else {
				if (isNew) {
					setMatchingUser([])
				}
			}
			const { latitude: _latitude, longitude: _longitude } = getUserInfo() || {}
			const { latitude, longitude, radius } = filters || {}
			const payload = {
				category_list: selects,
				latitude: latitude ?? (_latitude || 0),
				longitude: longitude ?? (_longitude || 0),
				radius,
				page,
				limit,
			}
			const res: any = await getInappCategoryUserMatching(payload)
			const { code, results } = res || {}
			if (!isNotLoading) {
				await delay(1000)
			}
			if (code === 200) {
				let { rows } = results?.objects || {}
				if (!isNotLoading) {
					_loadmore.current.user = isArray(rows, limit)
				}
				const mappingData = (selects || []).reduce((arr, item) => {
					const data = (tabsData.user || []).find((i) => i.id === item)
					arr.push(data.title)
					return arr
				}, [])
				setMatchingUser((prev: any[]) => {
					rows = (rows || []).map((i) => {
						const { i_am_interested_in } = i || {}
						const cates = (i_am_interested_in || '').split(',')
						const newCate = (mappingData || [])
							.reduce((arr: string[], item) => {
								if (cates.includes(item)) {
									arr.push(item)
								}
								return arr
							}, [])
							.join(', ')

						return { ...i, i_am_interested_in: newCate }
					})
					const contents = isNew && !isNotLoading ? [] : prev
					const dataShow = (
						!isNotLoading
							? uniqueArray([...contents, ...rows], 'id')
							: uniqueArray([...rows, ...contents], 'id')
					) as any[]
					return dataShow
				})
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoadingMatching((prev) => ({ ...prev, user: false }))
		}
	}
	const handleSearchMatching = () => {
		_paginationRefs.current.club.page = 1
		_paginationRefs.current.user.page = 1
		_loadmore.current.club = true
		_loadmore.current.user = true
		setMatching(true)
		handleGetMatchingClub()
		handleGetMatchingUser()
	}

	const handleLoadMoreClub = async () => {
		if (!_loadmore.current.club || loadingMatching.club) return
		const { limit } = _paginationRefs.current.club
		const currentPage = Math.trunc((matchingClub || []).length / limit)
		_paginationRefs.current.club.page = currentPage + 1
		await handleGetMatchingClub()
	}

	const handleLoadMoreUser = async () => {
		if (!_loadmore.current.user || loadingMatching.user) return
		const { limit } = _paginationRefs.current.user
		const currentPage = Math.trunc((matchingUser || []).length / limit)
		_paginationRefs.current.user.page = currentPage + 1
		await handleGetMatchingUser()
	}

	const handleScrollClub = (e: any) => {
		handleScrollCallback(e, handleLoadMoreClub)
	}
	const handleScrollUser = (e: any) => {
		handleScrollCallback(e, handleLoadMoreUser)
	}
	const handleInviteUser = async (id) => {
		const { data } = modal || {}
		setLoadingInvite((prev) => ({ ...prev, [id]: true }))
		try {
			let res: any
			if (data) {
				res = await inviteJoinConv({
					id: id,
					payload: {
						user_id: data,
					},
				})
			} else {
				res = await inviteAllJoinConv({
					id: id,
					payload: {},
					params: {
						category_list: selects,
					},
				})
			}
			if (res) {
				setInvited((prev) => ({ ...prev, [id]: true }))
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoadingInvite((prev) => ({ ...prev, [id]: false }))
		}
	}

	useEffect(() => {
		handleGetCategoryClubUserLocation({ lat, lng })
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	useEffect(() => {
		if (!firstTime.current) {
			handleGetCategoryClubUserLocation({ lat, lng })
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [filters.latitude, filters.longitude, filters.radius])

	useEffect(() => {
		if (matching) {
			handleGetMatchingClub()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [JSON.stringify(statusClub)])

	return {
		loadingInvite,
		invited,
		selects,
		activeTab,
		filters,
		tabsData,
		loading,
		matching,
		loadingMatching,
		statusClub,
		matchingClub,
		matchingUser,
		loadingJoin,
		modal,
		setModal,
		setInvited,
		setMatching,
		onChangeTab: handleChangeTab,
		onChangeFilter: handleChangeFilter,
		onChooseCategory: handleChooseCategory,
		onSearchMatching: handleSearchMatching,
		onSetStatus: handleSetStatus,
		onJoinConv: handleJoinConv,
		onJoinLeave: handleLeaveConv,
		onScrollClub: handleScrollClub,
		onScrollUser: handleScrollUser,
		onInviteUser: handleInviteUser,
	}
}
