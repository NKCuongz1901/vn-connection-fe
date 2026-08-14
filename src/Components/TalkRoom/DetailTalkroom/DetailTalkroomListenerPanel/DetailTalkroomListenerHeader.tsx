'use client'

import { memo } from 'react'

import classes from './DetailTalkroomListenerPanel.module.scss'

type DetailTalkroomListenerHeaderProps = {
	listenerCount: number
	isFilterRaiseHand?: boolean
	onCloseFilterRaiseHand?: () => void
}

/** Listener section header with title and count badge. */
function DetailTalkroomListenerHeader({
	listenerCount,
	isFilterRaiseHand = false,
	onCloseFilterRaiseHand,
}: DetailTalkroomListenerHeaderProps) {
	return (
		<div className={classes.header}>
			<div className={classes.headerTitleRow}>
				<h3 className={classes.headerTitle}>Listeners</h3>
				{listenerCount > 0 ? (
					<span className={classes.headerBadge}>{listenerCount}</span>
				) : null}
			</div>
			{isFilterRaiseHand ? (
				<div className={classes.filterRaiseHandBanner}>
					<span className={classes.filterRaiseHandText}>
						Tap a raised-hand listener to accept as speaker
					</span>
					<button
						type="button"
						className={classes.filterRaiseHandClose}
						onClick={onCloseFilterRaiseHand}
					>
						Close
					</button>
				</div>
			) : null}
		</div>
	)
}

export default memo(DetailTalkroomListenerHeader)
