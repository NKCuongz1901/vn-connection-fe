import {
	getLeaderBoard,
	getWalletHistoryGroupByMonth,
	getWalletHistoryandInvite,
	type ReferralLeaderboardPeriod,
} from '@/apis/referralApis'
import { useModal } from '@/context/ModalContext'
import { isArray } from '@/ultis/array'
import { handleScrollCallback } from '@/ultis/common'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export default function useReferral() {
	const { openError } = useModal()
	const [loading, setLoading] = useState<boolean>(false)
	const [loadingLeaderBoard, setLoadingLeaderBoard] = useState<boolean>(false)
	const [loadingHistory, setLoadingHistory] = useState<boolean>(false)
	const [myPosition, setMyPosition] = useState<number>(0)
	const [myTotalPoints, setMyTotalPoints] = useState<number>(0)
	const [leaderBoard, setLeaderBoard] = useState<any[]>([])
	const [period, setPeriod] = useState<ReferralLeaderboardPeriod>('monthly')
	const [walletHistory, setWalletHistory] = useState<any[]>([])
	const [walletHistoryGroupByMonth, setWalletHistoryGroupByMonth] = useState<
		any[]
	>([])

	const paginationRef = useRef({ page: 1, limit: 30 })
	const canLoadMoreHistoryRef = useRef(true)

	/** Fetches referral leaderboard for the selected period. */
	const handleGetLeaderBoard = useCallback(
		async (
			selectedPeriod: ReferralLeaderboardPeriod = period,
			options?: { isInitial?: boolean },
		) => {
			if (options?.isInitial) {
				setLoading(true)
			} else {
				setLoadingLeaderBoard(true)
			}
			try {
				const res: any = await getLeaderBoard({
					period: selectedPeriod,
					page: 1,
					limit: 30,
				})
				const { code, results } = res || {}
				if (code === 200) {
					const rows = results?.objects?.rows ?? []
					setLeaderBoard(
						rows.map((item: any) => ({
							...item,
							total_points: Number(item?.total_points) || 0,
							user_rank: Number(item?.user_rank) || item?.user_rank,
						})),
					)
					setMyPosition(Number(results?.my_position) || 0)
					setMyTotalPoints(Number(results?.total_points) || 0)
				}
			} catch (error) {
				openError(error)
			} finally {
				if (options?.isInitial) {
					setLoading(false)
				} else {
					setLoadingLeaderBoard(false)
				}
			}
		},
		[openError, period],
	)

	/** Updates period and refetches leaderboard. */
	const handleChangePeriod = useCallback(
		(nextPeriod: ReferralLeaderboardPeriod) => {
			setPeriod(nextPeriod)
			handleGetLeaderBoard(nextPeriod)
		},
		[handleGetLeaderBoard],
	)

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
		handleGetLeaderBoard('monthly', { isInitial: true })
		handleGetWalletHistoryGroupByMonth()
		handleGetWalletHistoryandInvite()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return {
		loading,
		loadingLeaderBoard,
		loadingHistory,
		myPosition,
		myTotalPoints,
		leaderBoard,
		period,
		walletHistory,
		walletHistoryGroupByMonth,
		topInvitees,
		onChangePeriod: handleChangePeriod,
		onLoadMoreHistory: handleLoadMoreHistory,
		onScrollHistory: handleScrollHistory,
	}
}
