'use client'

import { memo, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { IconChevronLeft, IconFlame } from '@tabler/icons-react'
import clsx from 'clsx'

import {
	getStreakMissions,
	getStreakProfile,
	parseStreakMissions,
	parseStreakProfile,
} from '@/apis/book/streakApis'
import { StreakMissions, StreakProfile } from '@/interface/Book/streak.interface'
import { useLocalePath } from '@/ultis/route'
import { BOOK_ROOT } from '@/Variable/book.variable'

import DailyChallenge from './DailyChallenge'
import StreakCalendar from './StreakCalendar'
import StreakLeaderboard from './StreakLeaderboard'
import classes from './BookStreak.module.scss'

type StreakTab = 'mine' | 'leaderboard'

/** Books streak: banner, My streak (calendar + daily challenge) and Leaderboard */
function BookStreak() {
	const { onChangeRoute } = useLocalePath()
	const searchParams = useSearchParams()
	const [tab, setTab] = useState<StreakTab>(
		searchParams?.get('tab') === 'leaderboard' ? 'leaderboard' : 'mine',
	)
	const [profile, setProfile] = useState<StreakProfile | null>(null)
	const [missions, setMissions] = useState<StreakMissions>({ missions: [], today: null })

	useEffect(() => {
		getStreakProfile()
			.then((res) => setProfile(parseStreakProfile(res)))
			.catch(() => setProfile(null))
		getStreakMissions()
			.then((res) => setMissions(parseStreakMissions(res)))
			.catch(() => {})
	}, [])

	const current = profile?.current_streak || 0

	return (
		<div className={classes.page}>
			<button
				type="button"
				className={classes.back}
				onClick={() => onChangeRoute(BOOK_ROOT)}
			>
				<IconChevronLeft size={20} />
				<span>Streak</span>
			</button>

			<div className={clsx(classes.banner, { [classes.bannerActive]: current > 0 })}>
				<IconFlame size={44} className={classes.bannerFlame} />
				<div>
					<div className={classes.bannerCount}>{current}</div>
					<div className={classes.bannerLabel}>Day streak</div>
				</div>
				<div className={classes.bannerMeta}>
					<div>
						Longest streak <b>{profile?.longest_streak || 0} days</b>
					</div>
					<div>
						Days completed <b>{profile?.total_days_completed || 0}</b>
					</div>
				</div>
			</div>

			<div className={classes.tabs} role="tablist">
				{(
					[
						['mine', 'My streak'],
						['leaderboard', 'Leaderboard'],
					] as const
				).map(([key, label]) => (
					<button
						key={key}
						type="button"
						role="tab"
						aria-selected={tab === key}
						className={clsx(classes.tab, { [classes.tabActive]: tab === key })}
						onClick={() => setTab(key)}
					>
						{label}
					</button>
				))}
			</div>

			{tab === 'mine' ? (
				<div className={classes.mine}>
					<StreakCalendar freezeLimit={profile?.freeze_limit || 0} />
					<DailyChallenge {...missions} />
				</div>
			) : (
				<StreakLeaderboard myReaderId={profile?.reader_id} />
			)}
		</div>
	)
}

export default memo(BookStreak)
