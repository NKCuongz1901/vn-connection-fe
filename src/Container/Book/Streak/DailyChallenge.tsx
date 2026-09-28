'use client'

import { memo } from 'react'
import { IconBook, IconCircleCheckFilled, IconHeadphones } from '@tabler/icons-react'
import clsx from 'clsx'

import { StreakMissions } from '@/interface/Book/streak.interface'

import classes from './BookStreak.module.scss'

/** Today's missions and how far the reader got in each */
function DailyChallenge({ missions, today }: StreakMissions) {
	if (!missions.length) return null

	const rows = missions.map((mission) => {
		const tracked = today?.progress_tracking?.find((item) => item.id === mission.id)
		const required = tracked?.amount_required ?? mission.amount_required ?? 1
		const completed = Math.min(tracked?.amount_completed ?? 0, required)
		return { mission, required, completed, done: completed >= required }
	})
	const allDone = Boolean(today?.mission_completed) || rows.every((row) => row.done)
	const doneCount = rows.filter((row) => row.done).length

	return (
		<div className={classes.card}>
			<div className={classes.challengeHead}>
				<div className={classes.cardTitle}>Daily challenge</div>
				<span className={clsx(classes.challengeBadge, { [classes.challengeBadgeDone]: allDone })}>
					{doneCount}/{rows.length}
				</span>
			</div>
			<div className={classes.challengeHint}>
				{allDone
					? 'Challenge completed, your streak is safe today!'
					: doneCount
						? 'You have almost completed your mission!'
						: 'Complete every mission today to keep your streak.'}
			</div>
			<div className={classes.missions}>
				{rows.map(({ mission, required, completed, done }) => (
					<div key={mission.id} className={classes.mission}>
						<span className={classes.missionIcon}>
							{mission.mission_type === 'LISTENING' ? (
								<IconHeadphones size={18} />
							) : (
								<IconBook size={18} />
							)}
						</span>
						<div className={classes.missionBody}>
							<div className={classes.missionName}>{mission.mission_name}</div>
							<div className={classes.progress}>
								<div
									className={clsx(classes.progressFill, { [classes.progressDone]: done })}
									style={{ width: `${(completed / required) * 100}%` }}
								/>
							</div>
						</div>
						{done ? (
							<IconCircleCheckFilled size={22} className={classes.missionDone} />
						) : (
							<span className={classes.missionCount}>
								{completed}/{required}
							</span>
						)}
					</div>
				))}
			</div>
		</div>
	)
}

export default memo(DailyChallenge)
