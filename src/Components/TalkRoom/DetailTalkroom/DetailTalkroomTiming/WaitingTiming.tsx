'use client'

import { IconClock } from '@tabler/icons-react'
import { memo } from 'react'

import { formatTalkRoomCountdownMmSs } from '@/ultis/talkRoom'

import classes from './DetailTalkroomTiming.module.scss'
import useTalkRoomCountdown from './useTalkRoomCountdown'

type WaitingTimingProps = {
	secondsLeft: number
}

/** countWaiting banner: live room waiting for session countdown (MM:SS). */
function WaitingTiming({ secondsLeft }: WaitingTimingProps) {
	const countdown = useTalkRoomCountdown(secondsLeft)
	const countdownLabel =
		countdown == null ? formatTalkRoomCountdownMmSs(secondsLeft) : formatTalkRoomCountdownMmSs(countdown)

	return (
		<div className={`${classes.card} ${classes.cardWarning}`}>
			<div className={classes.top}>
				<div className={classes.label}>
					<IconClock
						size={24}
						className={`${classes.clockIcon} ${classes.clockIconWarning}`}
						stroke={1.5}
					/>
					<span className={`${classes.labelText} ${classes.labelTextWarning}`}>
						Waiting
					</span>
				</div>
				<span className={`${classes.timeValue} ${classes.timeValueWarning}`}>
					{countdownLabel}
				</span>
			</div>
		</div>
	)
}

export default memo(WaitingTiming)
