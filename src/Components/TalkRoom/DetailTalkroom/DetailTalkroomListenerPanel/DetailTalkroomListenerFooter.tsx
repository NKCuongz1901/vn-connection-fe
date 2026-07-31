'use client'

import { memo } from 'react'

import { HostMicState } from '@/ultis/talkRoom'

import HostMicButton from './HostMicButton'
import classes from './DetailTalkroomListenerPanel.module.scss'

type DetailTalkroomListenerFooterProps = {
	isHost?: boolean
	micState: HostMicState
	onToggleMic?: () => void
	onLeaveRoom?: () => void
}

/** Footer actions: host mic toggle and leave room. */
function DetailTalkroomListenerFooter({
	isHost = false,
	micState,
	onToggleMic,
	onLeaveRoom,
}: DetailTalkroomListenerFooterProps) {
	return (
		<div className={classes.footer}>
			<div className={classes.footerActions}>
				{isHost ? (
					<HostMicButton state={micState} size="md" onClick={onToggleMic} />
				) : null}
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
