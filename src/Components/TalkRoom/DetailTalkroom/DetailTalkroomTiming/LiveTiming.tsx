'use client'

import { IconClock } from '@tabler/icons-react'
import { memo, useEffect, useRef } from 'react'

import { formatTalkRoomCountdownMmSs } from '@/ultis/talkRoom'

import classes from './DetailTalkroomTiming.module.scss'
import useTalkRoomCountdown from './useTalkRoomCountdown'

type LiveTimingProps = {
	secondsLeft: number
	onTimeUp?: () => void
}

/** countRoomLive banner: active session countdown (MM:SS). */
function LiveTiming({ secondsLeft, onTimeUp }: LiveTimingProps) {
	const countdown = useTalkRoomCountdown(secondsLeft)
	const hasTriggeredTimeUpRef = useRef(false)

	useEffect(() => {
		hasTriggeredTimeUpRef.current = false
	}, [secondsLeft])

	useEffect(() => {
		if (countdown !== 0 || secondsLeft <= 0 || hasTriggeredTimeUpRef.current) {
			return
		}

		hasTriggeredTimeUpRef.current = true
		onTimeUp?.()
	}, [countdown, secondsLeft, onTimeUp])

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
