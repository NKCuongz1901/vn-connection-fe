'use client'

import { IconClock } from '@tabler/icons-react'
import { memo } from 'react'

import { formatTalkRoomCountdownMmSs } from '@/ultis/talkRoom'

import classes from './DetailTalkroomTiming.module.scss'
import useTalkRoomCountdown from './useTalkRoomCountdown'

type LiveTimingProps = {
	secondsLeft: number
}

/** countRoomLive banner: active session countdown (MM:SS). */
function LiveTiming({ secondsLeft }: LiveTimingProps) {
	const countdown = useTalkRoomCountdown(secondsLeft)
	const countdownLabel =
		countdown == null
			? formatTalkRoomCountdownMmSs(secondsLeft)
			: formatTalkRoomCountdownMmSs(countdown)

	return (
		<div className={`${classes.card} ${classes.cardSuccess}`}>
			<div className={classes.top}>
				<div className={classes.label}>
					<IconClock
						size={24}
						className={`${classes.clockIcon} ${classes.clockIconSuccess}`}
						stroke={1.5}
					/>
					<span className={`${classes.labelText} ${classes.labelTextSuccess}`}>
						Live talk
					</span>
				</div>
				<span className={`${classes.timeValue} ${classes.timeValueSuccess}`}>
					{countdownLabel}
				</span>
			</div>
		</div>
	)
}

export default memo(LiveTiming)
