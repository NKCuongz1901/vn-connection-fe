'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import {
	getTalkRoomLeaderBoard,
	getTalkRoomLeaderBoardMy,
	TalkRoomLeaderBoardItem,
} from '@/apis/talkRoomApis'
import {
	TalkRoomLeaderboardMetric,
	TalkRoomLeaderboardPeriod,
} from '@/Components/TalkRoom/TalkRoomLeaderboard'
import { useModal } from '@/context/ModalContext'
import { formatHostMinutes } from '@/ultis/talkRoom'

const LIST_LIMIT = 20

/** Map API leaderboard row to UI list/podium item */
const mapLeaderBoardItem = (
	item: TalkRoomLeaderBoardItem,
	index: number,
	metric: TalkRoomLeaderboardMetric,
) => {
	const seconds =
		metric === 'speak_time'
			? item.total_speaking_seconds
			: item.total_hosting_seconds

	return {
		id: item.user_id,
		name: item.user?.name,
		avatar: item.user?.avatar,
		scoreLabel: formatHostMinutes(seconds),
		user_rank: String(index + 1),
	}
}

/** Fetch Talk Room leaderboard list + my position by metric/period */
export default function useTalkRoomLeaderBoard() {
	const { openError } = useModal()
	const [loading, setLoading] = useState(false)
	const [metric, setMetric] = useState<TalkRoomLeaderboardMetric>('host_time')
	const [period, setPeriod] = useState<TalkRoomLeaderboardPeriod>('monthly')
	const [rows, setRows] = useState<TalkRoomLeaderBoardItem[]>([])
	const [myPositionData, setMyPositionData] =
		useState<TalkRoomLeaderBoardItem | null>(null)
	const [myRank, setMyRank] = useState(0)

	const handleFetchLeaderBoard = useCallback(async () => {
		setLoading(true)
		try {
			const [listRes, myRes]: any[] = await Promise.all([
				getTalkRoomLeaderBoard({
					params: {
						fields: ['$all'],
						page: 1,
						limit: LIST_LIMIT,
						period,
						metric,
					},
				}),
				getTalkRoomLeaderBoardMy({
					params: {
						fields: ['$all'],
						period,
						metric,
					},
				}),
			])

			if (listRes?.code === 200) {
				setRows(listRes?.results?.objects?.rows ?? [])
			}

			if (myRes?.code === 200) {
				const myObject =
					myRes?.results?.object ?? myRes?.results?.objects ?? null
				setMyPositionData(myObject)
				setMyRank(
					myObject?.rank ??
						myObject?.user_rank ??
						myObject?.position ??
						0,
				)
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoading(false)
		}
	}, [metric, openError, period])

	useEffect(() => {
		handleFetchLeaderBoard()
	}, [handleFetchLeaderBoard])

	const leaderBoard = useMemo(
		() => rows.map((item, index) => mapLeaderBoardItem(item, index, metric)),
		[metric, rows],
	)

	const topHosts = useMemo(() => leaderBoard.slice(0, 3), [leaderBoard])

	const myMapped = useMemo(() => {
		if (!myPositionData) return null
		const seconds =
			metric === 'speak_time'
				? myPositionData.total_speaking_seconds
				: myPositionData.total_hosting_seconds

		return {
			id: myPositionData.user_id,
			name: myPositionData.user?.name,
			avatar: myPositionData.user?.avatar,
			scoreLabel: formatHostMinutes(seconds),
			user_rank: myRank ? String(myRank) : undefined,
		}
	}, [metric, myPositionData, myRank])

	/** Prefer API my-position; fallback to list match */
	const leaderBoardWithMe = useMemo(() => {
		if (!myMapped?.id) return leaderBoard
		const exists = leaderBoard.some((item) => item.id === myMapped.id)
		if (exists) {
			return leaderBoard.map((item) =>
				item.id === myMapped.id
					? {
							...item,
							scoreLabel: myMapped.scoreLabel,
							user_rank: myMapped.user_rank || item.user_rank,
						}
					: item,
			)
		}
		return [...leaderBoard, myMapped]
	}, [leaderBoard, myMapped])

	return {
		loading,
		metric,
		period,
		leaderBoard: leaderBoardWithMe,
		topHosts,
		myPosition: myRank,
		onChangeMetric: setMetric,
		onChangePeriod: setPeriod,
		onRefresh: handleFetchLeaderBoard,
	}
}
