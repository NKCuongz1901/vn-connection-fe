'use client'

import { memo } from 'react'

import { HostMicState } from '@/ultis/talkRoom'

import HostMicButton from './HostMicButton'
import classes from './DetailTalkroomListenerPanel.module.scss'

type DetailTalkroomListenerFooterProps = {
	micState: HostMicState
	onToggleMic?: () => void
	onLeaveRoom?: () => void
}

/** Footer actions: host mic toggle and leave room. */
function DetailTalkroomListenerFooter({
	micState,
	onToggleMic,
	onLeaveRoom,
}: DetailTalkroomListenerFooterProps) {
	return (
		<div className={classes.footer}>
			<div className={classes.footerActions}>
				<HostMicButton state={micState} size="md" onClick={onToggleMic} />
				<button
					type="button"
					className={classes.leaveButton}
					onClick={onLeaveRoom}
				>
					Leave room
				</button>
			</div>
		</div>
	)
}

export default memo(DetailTalkroomListenerFooter)
