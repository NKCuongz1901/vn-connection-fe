'use client'

import { IconClock } from '@tabler/icons-react'
import { memo, useEffect, useRef } from 'react'

import { formatTalkRoomCountdownMmSs } from '@/ultis/talkRoom'

import classes from './DetailTalkroomTiming.module.scss'
import useTalkRoomCountdown from './useTalkRoomCountdown'

type WaitingTimingProps = {
	secondsLeft: number
	onTimeUp?: () => void
}

/** countWaiting banner: live room waiting for session countdown (MM:SS). */
function WaitingTiming({ secondsLeft, onTimeUp }: WaitingTimingProps) {
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
