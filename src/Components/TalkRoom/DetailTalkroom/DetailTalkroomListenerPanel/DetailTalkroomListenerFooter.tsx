'use client'

import { memo } from 'react'

import { HostMicState } from '@/ultis/talkRoom'

import BeSpeakerButton from './BeSpeakerButton'
import HostMicButton from './HostMicButton'
import classes from './DetailTalkroomListenerPanel.module.scss'

type DetailTalkroomListenerFooterProps = {
	isHost?: boolean
	isListener?: boolean
	micState: HostMicState
	beSpeakerState: HostMicState
	onToggleMic?: () => void
	onBeSpeaker?: () => void
	onLeaveRoom?: () => void
}

/** Footer actions: host mic or listener be speaker, plus leave room. */
function DetailTalkroomListenerFooter({
	isHost = false,
	isListener = false,
	micState,
	beSpeakerState,
	onToggleMic,
	onBeSpeaker,
	onLeaveRoom,
}: DetailTalkroomListenerFooterProps) {
	return (
		<div className={classes.footer}>
			<div className={classes.footerActions}>
				{isHost ? (
					<HostMicButton state={micState} size="md" onClick={onToggleMic} />
				) : null}
				{isListener ? (
					<BeSpeakerButton state={beSpeakerState} onClick={onBeSpeaker} />
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
