import {
	addBankAccount,
	getLeaderBoard,
	getWalletHistoryandInvite,
	getWalletHistoryOverview,
	type AddBankAccountPayload,
	type ReferralLeaderboardPeriod,
} from '@/apis/referralApis'
import {
	normalizeReferralOverview,
	type ReferralOverviewData,
	type ReferralWalletHistoryItem,
} from '@/Components/Referral/ReferralHistory/referralHistory.utils'
import { useModal } from '@/context/ModalContext'
import { isArray } from '@/ultis/array'
import { handleScrollCallback } from '@/ultis/common'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const EMPTY_OVERVIEW: ReferralOverviewData = {
	all_time_points: 0,
	years: [],
	redeemable_months: [],
	minimum_redeem_points: 0,
	point_value_vnd: 0,
}

export default function useReferral() {
	const { openError, openSuccess } = useModal()
	const [loading, setLoading] = useState<boolean>(false)
	const [loadingLeaderBoard, setLoadingLeaderBoard] = useState<boolean>(false)
	const [loadingOverview, setLoadingOverview] = useState<boolean>(false)
	const [loadingHistory, setLoadingHistory] = useState<boolean>(false)
	const [loadingBankAccount, setLoadingBankAccount] = useState<boolean>(false)
	const [myPosition, setMyPosition] = useState<number>(0)
	const [myTotalPoints, setMyTotalPoints] = useState<number>(0)
	const [leaderBoard, setLeaderBoard] = useState<any[]>([])
	const [period, setPeriod] = useState<ReferralLeaderboardPeriod>('monthly')
	const [referralOverview, setReferralOverview] =
		useState<ReferralOverviewData>(EMPTY_OVERVIEW)
	const [walletHistory, setWalletHistory] = useState<
		ReferralWalletHistoryItem[]
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

	/** Fetches full referral overview once for History month cards. */
	const handleGetReferralOverview = useCallback(async () => {
		setLoadingOverview(true)
		try {
			const res: any = await getWalletHistoryOverview()
			const { code, results } = res || {}
			if (code === 200) {
				setReferralOverview(normalizeReferralOverview(results))
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoadingOverview(false)
		}
	}, [openError])

	/** Fetches latest referral invite list with pagination. */
	const handleGetWalletHistoryandInvite = useCallback(
		async (isLoadMore = false) => {
			if (isLoadMore && !canLoadMoreHistoryRef.current) return
			if (isLoadMore && loadingHistory) return

			if (isLoadMore) {
				setLoadingHistory(true)
			} else {
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
				}
			}
		},
		[loadingHistory, openError],
	)

	const handleLoadMoreHistory = useCallback(async () => {
		if (!canLoadMoreHistoryRef.current || loadingHistory) return
		await handleGetWalletHistoryandInvite(true)
	}, [handleGetWalletHistoryandInvite, loadingHistory])

	const handleScrollHistory = useCallback(
		(e: React.UIEvent<HTMLDivElement>) => {
			handleScrollCallback(e, handleLoadMoreHistory)
		},
		[handleLoadMoreHistory],
	)

	/** Saves bank account details for referral redeem payouts. */
	const handleAddBankAccount = useCallback(
		async (payload: AddBankAccountPayload) => {
			setLoadingBankAccount(true)
			try {
				const res: any = await addBankAccount(payload)
				const { code } = res || {}
				if (code === 200) {
					openSuccess({ message: 'Bank account saved successfully' })
					return true
				}
				return false
			} catch (error) {
				openError(error)
				return false
			} finally {
				setLoadingBankAccount(false)
			}
		},
		[openError, openSuccess],
	)

	useEffect(() => {
		handleGetLeaderBoard('monthly', { isInitial: true })
		handleGetReferralOverview()
		handleGetWalletHistoryandInvite()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return {
		loading,
		loadingLeaderBoard,
		loadingOverview,
		loadingHistory,
		loadingBankAccount,
		myPosition,
		myTotalPoints,
		leaderBoard,
		period,
		referralOverview,
		walletHistory,
		topInvitees,
		onChangePeriod: handleChangePeriod,
		onLoadMoreHistory: handleLoadMoreHistory,
		onScrollHistory: handleScrollHistory,
		onAddBankAccount: handleAddBankAccount,
	}
}
