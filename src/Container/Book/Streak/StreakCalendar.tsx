'use client'

import { memo, useEffect, useMemo, useState } from 'react'
import {
	IconCheck,
	IconChevronLeft,
	IconChevronRight,
	IconSnowflake,
} from '@tabler/icons-react'
import clsx from 'clsx'
import dayjs from 'dayjs'

import { getStreakCalendar, parseStreakCalendar } from '@/apis/book/streakApis'
import { StreakCalendarData } from '@/interface/Book/streak.interface'

import classes from './BookStreak.module.scss'

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

type DayState = 'done' | 'frozen' | null

const dayState = (data: StreakCalendarData, date: string): DayState => {
	const items = data[date] || []
	if (items.some((item) => item.achievement_type === 'STREAKFREEZE')) return 'frozen'
	if (items.some((item) => item.mission_completed)) return 'done'
	return null
}

type StreakCalendarProps = {
	freezeLimit: number
}

/** Month view: days the daily challenge was completed, and days saved by a streak freeze */
function StreakCalendar({ freezeLimit }: StreakCalendarProps) {
	const [month, setMonth] = useState(() => dayjs().startOf('month'))
	const [data, setData] = useState<StreakCalendarData>({})
	const [loading, setLoading] = useState(true)
	const isCurrentMonth = month.isSame(dayjs(), 'month')

	useEffect(() => {
		let cancelled = false
		setLoading(true)
		getStreakCalendar(
			month.format('YYYY-MM-DD'),
			month.endOf('month').format('YYYY-MM-DD'),
		)
			.then((res) => {
				if (!cancelled) setData(parseStreakCalendar(res))
			})
			.catch(() => {
				if (!cancelled) setData({})
			})
			.finally(() => {
				if (!cancelled) setLoading(false)
			})
		return () => {
			cancelled = true
		}
	}, [month])

	const cells = useMemo(() => {
		// Monday-first grid
		const lead = (month.day() + 6) % 7
		const days = Array.from({ length: month.daysInMonth() }, (_, i) =>
			month.add(i, 'day'),
		)
		return [...Array.from({ length: lead }, () => null), ...days]
	}, [month])

	const monthDays = cells.filter(Boolean) as dayjs.Dayjs[]
	const doneCount = monthDays.filter(
		(day) => dayState(data, day.format('YYYY-MM-DD')) === 'done',
	).length
	const frozenCount = monthDays.filter(
		(day) => dayState(data, day.format('YYYY-MM-DD')) === 'frozen',
	).length

	return (
		<>
			<div className={classes.stats}>
				<div className={classes.statCard}>
					<span className={clsx(classes.statIcon, { [classes.statIconOn]: doneCount > 0 })}>
						<IconCheck size={20} stroke={2.5} />
					</span>
					<div>
						<div className={classes.statValue}>
							{doneCount}/{month.daysInMonth()}
						</div>
						<div className={classes.statLabel}>Day read</div>
					</div>
				</div>
				<div className={classes.statCard}>
					<span className={clsx(classes.statIcon, classes.statIconFreeze)}>
						<IconSnowflake size={20} />
					</span>
					<div>
						<div className={classes.statValue}>
							{frozenCount}/{freezeLimit}
						</div>
						<div className={classes.statLabel}>Streak freeze</div>
					</div>
				</div>
			</div>

			<div className={clsx(classes.card, { [classes.loading]: loading })}>
				<div className={classes.calendarHead}>
					<button
						type="button"
						className={classes.navBtn}
						onClick={() => setMonth((prev) => prev.subtract(1, 'month'))}
						aria-label="Previous month"
					>
						<IconChevronLeft size={16} />
					</button>
					<div className={classes.calendarTitle}>{month.format('MMMM YYYY')}</div>
					<button
						type="button"
						className={classes.navBtn}
						onClick={() => setMonth((prev) => prev.add(1, 'month'))}
						disabled={isCurrentMonth}
						aria-label="Next month"
					>
						<IconChevronRight size={16} />
					</button>
				</div>
				<div className={classes.calendarGrid}>
					{WEEK_DAYS.map((day) => (
						<div key={day} className={classes.weekDay}>
							{day}
						</div>
					))}
					{cells.map((day, index) => {
						if (!day) return <div key={`blank-${index}`} />
						const key = day.format('YYYY-MM-DD')
						const state = dayState(data, key)
						const isToday = day.isSame(dayjs(), 'day')
						return (
							<div
								key={key}
								className={clsx(classes.day, {
									[classes.dayDone]: state === 'done',
									[classes.dayFrozen]: state === 'frozen',
									[classes.dayToday]: isToday,
									[classes.dayFuture]: day.isAfter(dayjs(), 'day'),
								})}
								title={
									state === 'done'
										? 'Daily challenge completed'
										: state === 'frozen'
											? 'Streak freeze used'
											: undefined
								}
							>
								{state === 'done' ? (
									<IconCheck size={16} stroke={3} />
								) : state === 'frozen' ? (
									<IconSnowflake size={16} />
								) : (
									day.date()
								)}
							</div>
						)
					})}
				</div>
			</div>
		</>
	)
}

export default memo(StreakCalendar)
