import {
	getLeaderBoard,
	getWalletHistoryGroupByMonth,
	getWalletHistoryandInvite,
} from '@/apis/referralApis'
import { useModal } from '@/context/ModalContext'
import { isArray } from '@/ultis/array'
import { handleScrollCallback } from '@/ultis/common'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export default function useReferral() {
	const { openError } = useModal()
	const [loading, setLoading] = useState<boolean>(false)
	const [loadingHistory, setLoadingHistory] = useState<boolean>(false)
	const [myPosition, setMyPosition] = useState<number>(0)
	const [leaderBoard, setLeaderBoard] = useState<any[]>([])
	const [walletHistory, setWalletHistory] = useState<any[]>([])
	const [walletHistoryGroupByMonth, setWalletHistoryGroupByMonth] = useState<
		any[]
	>([])

	const paginationRef = useRef({ page: 1, limit: 30 })
	const canLoadMoreHistoryRef = useRef(true)

	const handleGetLeaderBoard = async () => {
		setLoading(true)
		try {
			const res: any = await getLeaderBoard()
			const { code, results } = res || {}
			if (code === 200) {
				setLeaderBoard(results?.object?.board ?? [])
				setMyPosition(results?.object?.my_position)
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoading(false)
		}
	}

	const topInvitees = useMemo(() => {
		return leaderBoard?.slice(0, 3)
	}, [leaderBoard])

	const handleGetWalletHistoryGroupByMonth = async () => {
		setLoading(true)
		try {
			const res: any = await getWalletHistoryGroupByMonth()
			const { code, results } = res || {}
			if (code === 200) {
				setWalletHistoryGroupByMonth(results?.objects)
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoading(false)
		}
	}

	const handleGetWalletHistoryandInvite = async (isLoadMore = false) => {
		if (isLoadMore && !canLoadMoreHistoryRef.current) return
		if (isLoadMore && loadingHistory) return

		if (isLoadMore) {
			setLoadingHistory(true)
		} else {
			setLoading(true)
			paginationRef.current.page = 1
			canLoadMoreHistoryRef.current = true
		}

		try {
			const page = isLoadMore ? paginationRef.current.page + 1 : 1
			const limit = paginationRef.current.limit
			const res: any = await getWalletHistoryandInvite({
				page,
				limit,
				fields: ['$all', { invitee: ['phone', 'name', 'avatar'] }],
			})
			const { code, results } = res || {}
			if (code === 200) {
				const { rows = [], count = 0 } = results?.objects || {}
				paginationRef.current.page = page
				canLoadMoreHistoryRef.current =
					isArray(rows, limit) && page * limit < count
				setWalletHistory((prev) => (page === 1 ? rows : [...prev, ...rows]))
			}
		} catch (error) {
			openError(error)
		} finally {
			if (isLoadMore) {
				setLoadingHistory(false)
			} else {
				setLoading(false)
			}
		}
	}

	const handleLoadMoreHistory = useCallback(async () => {
		if (!canLoadMoreHistoryRef.current || loadingHistory) return
		await handleGetWalletHistoryandInvite(true)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [loadingHistory])

	const handleScrollHistory = useCallback(
		(e: React.UIEvent<HTMLDivElement>) => {
			handleScrollCallback(e, handleLoadMoreHistory)
		},
		[handleLoadMoreHistory],
	)

	useEffect(() => {
		handleGetLeaderBoard()
		handleGetWalletHistoryGroupByMonth()
		handleGetWalletHistoryandInvite()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return {
		loading,
		loadingHistory,
		myPosition,
		leaderBoard,
		walletHistory,
		walletHistoryGroupByMonth,
		topInvitees,
		onLoadMoreHistory: handleLoadMoreHistory,
		onScrollHistory: handleScrollHistory,
	}
}
