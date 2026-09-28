'use client'

import { memo, useEffect, useState } from 'react'
import { IconFlame } from '@tabler/icons-react'

import { parseApiList } from '@/apis/book/bookApis'
import { getStreakLeaderboard } from '@/apis/book/streakApis'
import { StreakLeaderboardRow } from '@/interface/Book/streak.interface'
import { useLocalePath } from '@/ultis/route'
import { BOOK_STREAK_PATH } from '@/Variable/book.variable'

import classes from './StreakChip.module.scss'

/** Books overview: the top 3 readers by current streak, links to the leaderboard */
function StreakTopReaders() {
	const { onChangeRoute } = useLocalePath()
	const [rows, setRows] = useState<StreakLeaderboardRow[]>([])

	useEffect(() => {
		getStreakLeaderboard('yearly', { limit: 3 })
			.then((res) =>
				setRows(
					parseApiList<StreakLeaderboardRow>(res).filter(
						(row) => (row.current_streak || 0) > 0,
					),
				),
			)
			.catch(() => setRows([]))
	}, [])

	if (!rows.length) return null

	return (
		<button
			type="button"
			className={classes.top}
			onClick={() => onChangeRoute(`${BOOK_STREAK_PATH}?tab=leaderboard`)}
			aria-label="Open the streak leaderboard"
		>
			{rows.map((row, index) => {
				const name = row.reader?.name || 'Reader'
				return (
					<span key={row.id || row.reader_id} className={classes.topItem}>
						<span className={classes.topAvatar}>
							{row.reader?.avatar ? (
								// eslint-disable-next-line @next/next/no-img-element
								<img src={row.reader.avatar} alt="" />
							) : (
								name.charAt(0).toUpperCase()
							)}
							<span className={classes.topRank}>{index + 1}</span>
						</span>
						<span className={classes.topCopy}>
							<span className={classes.topName}>{name}</span>
							<span className={classes.topDays}>
								<IconFlame size={12} /> {row.current_streak}{' '}
								{row.current_streak === 1 ? 'day' : 'days'}
							</span>
						</span>
					</span>
				)
			})}
		</button>
	)
}

export default memo(StreakTopReaders)
