import { useCallback, useEffect, useRef, useState } from 'react'
import dayjs from 'dayjs'

import { getMyRedeemRequests } from '@/apis/referralApis'
import { useModal } from '@/context/ModalContext'
import { isArray } from '@/ultis/array'
import { handleScrollCallback } from '@/ultis/common'

export type RedeemStatus = 'pending' | 'paid'

export type RedeemHistoryItem = {
	id: string
	date: string
	status: RedeemStatus
	amount: number
	points: number
	paidAt?: string
}

/** Maps API redeem status to UI status. */
const mapRedeemStatus = (status?: string): RedeemStatus => {
	if (status === 'PENDING') return 'pending'
	return 'paid'
}

/** Formats redeem request row for the history list UI. */
const normalizeRedeemItem = (row: any): RedeemHistoryItem => {
	const status = mapRedeemStatus(row?.status)
	const processedAt = row?.processed_at
	return {
		id: row?.id,
		date: row?.created_at
			? dayjs(row.created_at).format('MMM D, YYYY')
			: '',
		status,
		amount: Number(row?.amount_vnd) || 0,
		points: Number(row?.points) || 0,
		paidAt:
			status === 'paid' && processedAt
				? `Paid on ${dayjs(processedAt).format('MMM D, YYYY [at] hh:mm A')}`
				: undefined,
	}
}

export default function useRedeemHistory() {
	const { openError } = useModal()
	const [loading, setLoading] = useState(false)
	const [loadingMore, setLoadingMore] = useState(false)
	const [items, setItems] = useState<RedeemHistoryItem[]>([])

	const paginationRef = useRef({ page: 1, limit: 30 })
	const canLoadMoreRef = useRef(true)

	/** Fetches redeem history with optional pagination. */
	const handleGetRedeemHistory = useCallback(
		async (isLoadMore = false) => {
			if (isLoadMore && !canLoadMoreRef.current) return
			if (isLoadMore && loadingMore) return

			if (isLoadMore) {
				setLoadingMore(true)
			} else {
				setLoading(true)
				paginationRef.current.page = 1
				canLoadMoreRef.current = true
			}

			try {
				const page = isLoadMore ? paginationRef.current.page + 1 : 1
				const limit = paginationRef.current.limit
				const res: any = await getMyRedeemRequests({ page, limit })
				const { code, results } = res || {}
				if (code === 200) {
					const { rows = [], count = 0 } = results?.objects || {}
					paginationRef.current.page = page
					canLoadMoreRef.current =
						isArray(rows, limit) && page * limit < count
					const nextItems = rows.map(normalizeRedeemItem)
					setItems((prev) =>
						page === 1 ? nextItems : [...prev, ...nextItems],
					)
				}
			} catch (error) {
				openError(error)
			} finally {
				if (isLoadMore) {
					setLoadingMore(false)
				} else {
					setLoading(false)
				}
			}
		},
		[loadingMore, openError],
	)

	const handleLoadMore = useCallback(async () => {
		if (!canLoadMoreRef.current || loadingMore) return
		await handleGetRedeemHistory(true)
	}, [handleGetRedeemHistory, loadingMore])

	const handleScroll = useCallback(
		(e: React.UIEvent<HTMLDivElement>) => {
			handleScrollCallback(e, handleLoadMore)
		},
		[handleLoadMore],
	)

	useEffect(() => {
		handleGetRedeemHistory()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return {
		loading,
		loadingMore,
		items,
		onScroll: handleScroll,
	}
}
