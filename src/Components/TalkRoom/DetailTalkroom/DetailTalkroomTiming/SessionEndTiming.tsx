'use client'

import { IconClock } from '@tabler/icons-react'
import { memo, useEffect, useRef, useState } from 'react'

import {
	formatTalkRoomCountdownMmSs,
	getTalkRoomSessionEndSecondsLeft,
} from '@/ultis/talkRoom'

import classes from './DetailTalkroomTiming.module.scss'
import useTalkRoomCountdown from './useTalkRoomCountdown'

type SessionEndTimingProps = {
	sessionEndStartedAtMs: number
	onTimeUp?: () => void
}

/** countSessionEnd banner: post-live chat countdown (MM:SS). */
function SessionEndTiming({
	sessionEndStartedAtMs,
	onTimeUp,
}: SessionEndTimingProps) {
	const [secondsLeft, setSecondsLeft] = useState(() =>
		getTalkRoomSessionEndSecondsLeft(sessionEndStartedAtMs),
	)
	const hasTriggeredTimeUpRef = useRef(false)

	useEffect(() => {
		hasTriggeredTimeUpRef.current = false
	}, [sessionEndStartedAtMs])

	useEffect(() => {
		const tick = () => {
			setSecondsLeft(getTalkRoomSessionEndSecondsLeft(sessionEndStartedAtMs))
		}

		tick()
		const intervalId = setInterval(tick, 1000)

		return () => clearInterval(intervalId)
	}, [sessionEndStartedAtMs])

	useEffect(() => {
		if (secondsLeft > 0 || hasTriggeredTimeUpRef.current) return

		hasTriggeredTimeUpRef.current = true
		onTimeUp?.()
	}, [secondsLeft, onTimeUp])

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
						Chat time
					</span>
				</div>
				<span className={`${classes.timeValue} ${classes.timeValueSuccess}`}>
					{countdownLabel}
				</span>
			</div>
			<p className={classes.description}>
				The live talk has ended. Use this time to chat or exchange contacts.
			</p>
		</div>
	)
}

export default memo(SessionEndTiming)
