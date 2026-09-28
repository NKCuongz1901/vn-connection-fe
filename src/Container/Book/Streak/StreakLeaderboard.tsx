'use client'

import { memo, useEffect, useState } from 'react'
import { IconFlame } from '@tabler/icons-react'
import { Select } from 'antd'
import clsx from 'clsx'

import { parseApiList } from '@/apis/book/bookApis'
import { getStreakLeaderboard } from '@/apis/book/streakApis'
import {
	StreakLeaderboardPeriod,
	StreakLeaderboardRow,
} from '@/interface/Book/streak.interface'

import classes from './BookStreak.module.scss'

// Same choices as the app: current streak (this year) or longest streak (all time)
const SORT_OPTIONS: { value: StreakLeaderboardPeriod; label: string }[] = [
	{ value: 'yearly', label: 'Current streak' },
	{ value: 'all_time', label: 'Longest streak' },
]

type StreakLeaderboardProps = {
	/** reader_id of the signed-in reader, to highlight their row */
	myReaderId?: string
}

function Avatar({ row, size }: { row: StreakLeaderboardRow; size: number }) {
	const name = row.reader?.name || 'Reader'
	return (
		<span className={classes.avatar} style={{ width: size, height: size }}>
			{row.reader?.avatar ? (
				// eslint-disable-next-line @next/next/no-img-element
				<img src={row.reader.avatar} alt="" />
			) : (
				name.charAt(0).toUpperCase()
			)}
		</span>
	)
}

function StreakLeaderboard({ myReaderId }: StreakLeaderboardProps) {
	const [period, setPeriod] = useState<StreakLeaderboardPeriod>('yearly')
	const [rows, setRows] = useState<StreakLeaderboardRow[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		let cancelled = false
		setLoading(true)
		getStreakLeaderboard(period)
			.then((res) => {
				if (!cancelled) setRows(parseApiList<StreakLeaderboardRow>(res))
			})
			.catch(() => {
				if (!cancelled) setRows([])
			})
			.finally(() => {
				if (!cancelled) setLoading(false)
			})
		return () => {
			cancelled = true
		}
	}, [period])

	const points = (row: StreakLeaderboardRow) =>
		(period === 'all_time' ? row.longest_streak : row.current_streak) || 0
	const podium = rows.slice(0, 3)
	// 2nd, 1st, 3rd like a podium
	const podiumOrder = [podium[1], podium[0], podium[2]].filter(Boolean)
	const rest = rows.slice(3)
	const myIndex = rows.findIndex((row) => row.reader_id === myReaderId)

	return (
		<div className={classes.card}>
			<div className={classes.leaderHead}>
				<div className={classes.cardTitle}>Leaderboard</div>
				<Select
					value={period}
					options={SORT_OPTIONS}
					onChange={setPeriod}
					className={classes.leaderSort}
					aria-label="Sort by"
				/>
			</div>

			{loading ? (
				<div className={classes.empty}>Loading…</div>
			) : !rows.length ? (
				<div className={classes.empty}>No readers on the leaderboard yet.</div>
			) : (
				<>
					<div className={classes.podium}>
						{podiumOrder.map((row) => {
							const rank = rows.indexOf(row) + 1
							return (
								<div
									key={row.id || row.reader_id}
									className={clsx(classes.podiumItem, classes[`rank${rank}`], {
										[classes.me]: row.reader_id === myReaderId,
									})}
								>
									<span className={classes.podiumRank}>{rank}</span>
									<Avatar row={row} size={rank === 1 ? 68 : 56} />
									<div className={classes.podiumName}>{row.reader?.name || 'Reader'}</div>
									<div className={classes.points}>
										<IconFlame size={14} /> {points(row)}
									</div>
								</div>
							)
						})}
					</div>
					<div className={classes.leaderList}>
						{rest.map((row, index) => (
							<div
								key={row.id || row.reader_id}
								className={clsx(classes.leaderRow, {
									[classes.me]: row.reader_id === myReaderId,
								})}
							>
								<span className={classes.leaderRank}>{index + 4}</span>
								<Avatar row={row} size={32} />
								<span className={classes.leaderName}>{row.reader?.name || 'Reader'}</span>
								<span className={classes.points}>
									<IconFlame size={14} /> {points(row)}
								</span>
							</div>
						))}
					</div>
					{myIndex === -1 && myReaderId ? (
						<div className={classes.myPosition}>
							You are not on this leaderboard yet. Complete the daily challenge to
							start a streak.
						</div>
					) : null}
				</>
			)}
		</div>
	)
}

export default memo(StreakLeaderboard)
