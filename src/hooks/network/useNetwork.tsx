import { useCallback, useEffect, useRef, useState } from 'react'
import { useModal } from '@/context/ModalContext'
import { PaginationType } from '@/interface/common/common.interface'
import {
	optionFriends,
	paginationMore,
	stateFriends,
} from '@/Variable/common.variable'
import { cloneDeep } from 'lodash'
import { getFriends } from '@/apis/friendApis'
import { searchCommunityNetwork, searchUserNetwork } from '@/apis/searchApis'
import { uniqueArray } from '@/ultis/array'
import { handleScrollCallback } from '@/ultis/common'
import { randomString } from '@/ultis/string'

type NetworkTab = 'friends' | 'user' | 'club'
const defaultFilter = {
	q: '',
}

const mapFriendRowToUser = (row: any) => {
	const user = row?.friend || {}
	return {
		...user,
		id: user.id,
		is_friend: {
			id: row.id,
			state: stateFriends.ACCEPTED,
			friend_id: user.id,
		},
	}
}

export default function useNetwork() {
	const { openError } = useModal()

	const [activeTab, setActiveTab] = useState<NetworkTab>('user')
	const [users, setUsers] = useState<any[]>([])
	const [friends, setFriends] = useState<any[]>([])
	const [clubs, setClubs] = useState<any[]>([])
	const [filter, setFilter] = useState(defaultFilter)
	const [loading, setLoading] = useState({
		user: false,
		friends: false,
		club: false,
	})
	const [total, setTotal] = useState({ user: 0, friends: 0, club: 0 })
	const [searchId, setSearchId] = useState('')

	const userPaginationRef = useRef<PaginationType>(cloneDeep(paginationMore))
	const friendsPaginationRef = useRef<PaginationType>(cloneDeep(paginationMore))
	const clubPaginationRef = useRef<PaginationType>(cloneDeep(paginationMore))
	const userCanLoadMoreRef = useRef(true)
	const friendsCanLoadMoreRef = useRef(true)
	const clubCanLoadMoreRef = useRef(true)

	const buildParams = useCallback(() => {
		const { q, ...rest } = filter
		return {
			q: q?.trim() || '',
			...rest,
		}
	}, [filter])

	const fetchUsers = useCallback(async () => {
		setLoading((prev) => ({ ...prev, user: true }))
		let count = 0
		try {
			const { page, limit } = userPaginationRef.current
			const isNew = page === 1
			if (isNew) setUsers([])
			const res: any = await searchUserNetwork({
				...buildParams(),
				page,
				limit,
			})
			const rows = res?.results?.objects?.rows || []
			count = res?.results?.objects?.count || 0
			userCanLoadMoreRef.current = rows.length >= limit
			setUsers((prev) => uniqueArray(isNew ? rows : [...prev, ...rows], 'id'))
		} catch (error) {
			openError(error)
		} finally {
			setLoading((prev) => ({ ...prev, user: false }))
			setTotal((prev) => ({ ...prev, user: count }))
		}
	}, [buildParams, openError])

	const fetchFriends = useCallback(async () => {
		setLoading((prev) => ({ ...prev, friends: true }))
		let count = 0
		try {
			const { page, limit } = friendsPaginationRef.current
			const isNew = page === 1
			if (isNew) setFriends([])
			const res: any = await getFriends({
				params: {
					type: optionFriends[0].value,
					fields: ['$all', { user: ['$all'] }, { friend: ['$all'] }],
					where: { name: filter.q?.trim() || '' },
					page,
					limit,
				},
			})
			const rows = res?.results?.objects?.rows || []
			count = res?.results?.objects?.count || 0
			friendsCanLoadMoreRef.current = rows.length >= limit
			const normalized = rows.map(mapFriendRowToUser)
			setFriends((prev) =>
				uniqueArray(isNew ? normalized : [...prev, ...normalized], 'id'),
			)
		} catch (error) {
			openError(error)
		} finally {
			setLoading((prev) => ({ ...prev, friends: false }))
			setTotal((prev) => ({ ...prev, friends: count }))
		}
	}, [filter.q, openError])

	const fetchClubs = useCallback(async () => {
		setLoading((prev) => ({ ...prev, club: true }))
		let count = 0
		try {
			const { page, limit } = clubPaginationRef.current
			const isNew = page === 1
			if (isNew) setClubs([])
			const res: any = await searchCommunityNetwork({
				...buildParams(),
				page,
				limit,
			})
			const rows = res?.results?.objects?.rows || []
			count = res?.results?.objects?.count || 0
			clubCanLoadMoreRef.current = rows.length >= limit
			setClubs((prev) => uniqueArray(isNew ? rows : [...prev, ...rows], 'id'))
		} catch (error) {
			openError(error)
		} finally {
			setLoading((prev) => ({ ...prev, club: false }))
			setTotal((prev) => ({ ...prev, club: count }))
		}
	}, [buildParams, openError])

	const onSearch = useCallback(() => {
		userPaginationRef.current.page = 1
		friendsPaginationRef.current.page = 1
		clubPaginationRef.current.page = 1
		userCanLoadMoreRef.current = true
		friendsCanLoadMoreRef.current = true
		clubCanLoadMoreRef.current = true
		if (activeTab === 'user') fetchUsers()
		else if (activeTab === 'friends') fetchFriends()
		else fetchClubs()
	}, [activeTab, fetchUsers, fetchFriends, fetchClubs])

	const onLoadMore = useCallback(async () => {
		if (activeTab === 'user') {
			if (!userCanLoadMoreRef.current || loading.user) return
			userPaginationRef.current.page += 1
			await fetchUsers()
			return
		}
		if (activeTab === 'friends') {
			if (!friendsCanLoadMoreRef.current || loading.friends) return
			friendsPaginationRef.current.page += 1
			await fetchFriends()
			return
		}
		if (!clubCanLoadMoreRef.current || loading.club) return
		clubPaginationRef.current.page += 1
		await fetchClubs()
	}, [activeTab, loading, fetchUsers, fetchFriends, fetchClubs])

	const onScroll = (e: any) => {
		handleScrollCallback(e, onLoadMore)
	}
	const onChangeFilter = (key: string) => (value: any) => {
		if (key === 'q') {
			setFilter((prev) => ({ ...prev, q: value.target?.value ?? value }))
			setSearchId(randomString())
			return
		}
		setFilter((prev) => ({ ...prev, [key]: value }))
	}

	const onChangeTab = (tab: NetworkTab) => {
		setActiveTab(tab)
		if (tab === 'user') {
			userPaginationRef.current.page = 1
			userCanLoadMoreRef.current = true
			fetchUsers()
			return
		}
		if (tab === 'friends') {
			friendsPaginationRef.current.page = 1
			friendsCanLoadMoreRef.current = true
			fetchFriends()
			return
		}
		clubPaginationRef.current.page = 1
		clubCanLoadMoreRef.current = true
		fetchClubs()
	}

	const onResetFilter = () => {
		setFilter(defaultFilter)
		setSearchId(randomString())
	}

	useEffect(() => {
		fetchUsers()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	useEffect(() => {
		if (!searchId) return
		const timeout = setTimeout(onSearch, 500)
		return () => clearTimeout(timeout)
	}, [searchId, onSearch])

	const updateUser = useCallback(
		(userId: string, patch: Record<string, unknown>) => {
			setUsers((prev) =>
				prev.map((user) => (user.id === userId ? { ...user, ...patch } : user)),
			)
		},
		[],
	)

	const updateFriend = useCallback((userId: string) => {
		setFriends((prev) => prev.filter((friend) => friend.id !== userId))
		setTotal((prev) => ({
			...prev,
			friends: Math.max(prev.friends - 1, 0),
		}))
	}, [])

	const updateClub = useCallback((clubId: string, patch: Record<string, unknown>) => {
		setClubs((prev) =>
			prev.map((club) => (club.id === clubId ? { ...club, ...patch } : club)),
		)
	}, [])

	return {
		activeTab,
		users,
		friends,
		clubs,
		filter,
		loading,
		total,
		canLoadMoreUser: userCanLoadMoreRef,
		canLoadMoreFriends: friendsCanLoadMoreRef,
		canLoadMoreClub: clubCanLoadMoreRef,
		onChangeTab,
		onChangeFilter,
		onResetFilter,
		onSearch,
		onLoadMore,
		onScroll,
		updateUser,
		updateFriend,
		updateClub,
	}
}
