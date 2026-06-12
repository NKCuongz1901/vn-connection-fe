import {
	getLeaderBoard,
	getWalletHistoryGroupByMonth,
	getWalletHistoryandInvite,
} from '@/apis/referralApis'
import { useModal } from '@/context/ModalContext'
import { isArray } from '@/ultis/array'
import { useEffect, useState, useRef, useMemo } from 'react'

export default function useReferral() {
	const { openError } = useModal()
	const [loading, setLoading] = useState<boolean>(false)
	const [myPosition, setMyPosition] = useState<number>(0)
	const [leaderBoard, setLeaderBoard] = useState<any[]>([])
	const [walletHistory, setWalletHistory] = useState<any[]>([])
	const [walletHistoryGroupByMonth, setWalletHistoryGroupByMonth] = useState<
		any[]
	>([])

	const handleGetLeaderBoard = async () => {
		setLoading(true)
		try {
			const res: any = await getLeaderBoard()
			const { code, results } = res || {}
			if (code === 200) {
				setLeaderBoard(results?.object?.board)
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
		}
	}

	const paginationRef = useRef({ page: 1, limit: 30 })
	const handleGetWalletHistoryandInvite = async (isLoadMore = false) => {
		setLoading(true)
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
				setWalletHistory((prev) => (page === 1 ? rows : [...prev, ...rows]))
				// optional: lưu count để biết còn load more không
				// setTotal(count)
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		handleGetLeaderBoard()
		handleGetWalletHistoryGroupByMonth()
		handleGetWalletHistoryandInvite()
	}, [])

	return {
		loading,
		myPosition,
		leaderBoard,
		walletHistory,
		walletHistoryGroupByMonth,
		topInvitees,
	}
}
