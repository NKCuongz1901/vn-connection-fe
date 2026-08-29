'use client'

import { IconClock } from '@tabler/icons-react'
import { memo } from 'react'

import classes from './DetailTalkroomTiming.module.scss'

type PreStartTimingProps = {
	startTimeLabel: string
	description: string
}

/** Pre-start timing banner shown within the 10-minute early join window. */
function PreStartTiming({ startTimeLabel, description }: PreStartTimingProps) {
	return (
		<div className={classes.card}>
			<div className={classes.top}>
				<div className={classes.label}>
					<IconClock size={24} className={classes.clockIcon} stroke={1.5} />
					<span className={classes.labelText}>Start at</span>
				</div>
				<span className={classes.timeValue}>{startTimeLabel}</span>
			</div>
			{description ? (
				<p className={classes.description}>{description}</p>
			) : null}
		</div>
	)
}

export default memo(PreStartTiming)
