'use client'

import { memo } from 'react'

import { HostMicState } from '@/ultis/talkRoom'

import BeSpeakerButton from './BeSpeakerButton'
import HostMicButton from './HostMicButton'
import classes from './DetailTalkroomListenerPanel.module.scss'

type DetailTalkroomListenerFooterProps = {
	isHost?: boolean
	isListener?: boolean
	isSpeaker?: boolean
	micState: HostMicState
	beSpeakerState: HostMicState
	onToggleMic?: () => void
	onBeSpeaker?: () => void
	onLeaveRoom?: () => void
}

/** Footer actions: host/speaker mic or listener be speaker, plus leave room. */
function DetailTalkroomListenerFooter({
	isHost = false,
	isListener = false,
	isSpeaker = false,
	micState,
	beSpeakerState,
	onToggleMic,
	onBeSpeaker,
	onLeaveRoom,
}: DetailTalkroomListenerFooterProps) {
	return (
		<div className={classes.footer}>
			<div className={classes.footerActions}>
				{isHost || isSpeaker ? (
					<HostMicButton state={micState} size="md" onClick={onToggleMic} />
				) : null}
				{isListener && !isSpeaker ? (
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
