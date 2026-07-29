'use client'

import { memo } from 'react'

import classes from './DetailTalkroomListenerPanel.module.scss'

type DetailTalkroomListenerHeaderProps = {
	listenerCount: number
}

/** Listener section header with title and count badge. */
function DetailTalkroomListenerHeader({
	listenerCount,
}: DetailTalkroomListenerHeaderProps) {
	return (
		<div className={classes.header}>
			<div className={classes.headerTitleRow}>
				<h3 className={classes.headerTitle}>Listeners</h3>
				<span className={classes.headerBadge}>{listenerCount}</span>
			</div>
		</div>
	)
}

export default memo(DetailTalkroomListenerHeader)
