'use client'

import Image from 'next/image'
import { memo } from 'react'

import classes from './DetailTalkroomListenerPanel.module.scss'

type DetailTalkroomListenerEmptyProps = {
	onInvite?: () => void
}

/** Empty listener state shown before anyone joins as listener. */
function DetailTalkroomListenerEmpty({
	onInvite,
}: DetailTalkroomListenerEmptyProps) {
	return (
		<div className={classes.emptyState}>
			<div className={classes.emptyInfo}>
				<div className={classes.emptyIllustration}>
					<Image
						src="/images/talkroom.png"
						alt=""
						width={120}
						height={120}
						className={classes.emptyImage}
					/>
				</div>
				<div className={classes.emptyContent}>
					<p className={classes.emptyTitle}>
						The room will start with 2 people
					</p>
					<p className={classes.emptyDescription}>
						Start by inviting friends to join the conversation!
					</p>
				</div>
			</div>
			<button type="button" className={classes.inviteButton} onClick={onInvite}>
				Invite
			</button>
		</div>
	)
}

export default memo(DetailTalkroomListenerEmpty)
