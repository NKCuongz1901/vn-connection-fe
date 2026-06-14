import { useCallback, useEffect, useRef, useState } from 'react'

import { useModal } from '@/context/ModalContext'
import { searchCommunityNetwork } from '@/apis/searchApis'
import { uniqueArray } from '@/ultis/array'
import { cloneDeep, handleScrollCallback } from '@/ultis/common'
import { randomString } from '@/ultis/string'
import { paginationMore } from '@/Variable/common.variable'
import { PaginationType } from '@/interface/common/common.interface'

interface UseExploreInterestCommunitiesProps {
	enabled: boolean
	latitude?: number | null
	longitude?: number | null
	radius?: number | string
}

export default function useExploreInterestCommunities({
	enabled,
	latitude,
	longitude,
	radius,
}: UseExploreInterestCommunitiesProps) {
	const { openError } = useModal()
	const clubPaginationRef = useRef<PaginationType>(cloneDeep(paginationMore))
	const canLoadMoreClubRef = useRef(true)
	const [searchId, setSearchId] = useState('')

	const [clubs, setClubs] = useState<any[]>([])
	const [filter, setFilter] = useState({ q: '' })
	const [loading, setLoading] = useState(false)
	const [total, setTotal] = useState(0)

	const buildParams = useCallback(() => {
		return {
			q: filter.q?.trim() || '',
			latitude: latitude ?? undefined,
			longitude: longitude ?? undefined,
			radius,
		}
	}, [filter.q, latitude, longitude, radius])

	const fetchClubs = useCallback(async () => {
		setLoading(true)
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
			canLoadMoreClubRef.current = rows.length >= limit
			setClubs((prev) => uniqueArray(isNew ? rows : [...prev, ...rows], 'id'))
		} catch (error) {
			openError(error)
		} finally {
			setLoading(false)
			setTotal(count)
		}
	}, [buildParams, openError])

	const onSearch = useCallback(() => {
		clubPaginationRef.current.page = 1
		canLoadMoreClubRef.current = true
		fetchClubs()
	}, [fetchClubs])

	const onLoadMore = useCallback(async () => {
		if (!canLoadMoreClubRef.current || loading) return
		clubPaginationRef.current.page += 1
		await fetchClubs()
	}, [fetchClubs, loading])

	const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
		handleScrollCallback(e, onLoadMore)
	}

	const onChangeFilter = (value: string) => {
		setFilter({ q: value })
		setSearchId(randomString())
	}

	const updateClub = useCallback(
		(clubId: string, patch: Record<string, unknown>) => {
			setClubs((prev) =>
				prev.map((club) => (club.id === clubId ? { ...club, ...patch } : club)),
			)
		},
		[],
	)

	useEffect(() => {
		if (!enabled) return
		clubPaginationRef.current.page = 1
		canLoadMoreClubRef.current = true
		fetchClubs()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [enabled, latitude, longitude, radius])

	useEffect(() => {
		if (!enabled || !searchId) return
		const timeout = setTimeout(onSearch, 500)
		return () => clearTimeout(timeout)
	}, [enabled, searchId, onSearch])

	return {
		clubs,
		filter,
		loading,
		total,
		canLoadMoreClub: canLoadMoreClubRef,
		onChangeFilter,
		onLoadMore,
		onScroll,
		updateClub,
	}
}
