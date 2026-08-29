'use client'

import { Spin } from 'antd'
import { memo } from 'react'

import CModal from '@/Components/Custom/CModal/CModal'
import UserTagIcon from '@/svg/Talkroom/UserTagIcon'

import classes from './TalkRoomSpeakerInvitationModal.module.scss'

export interface TalkRoomSpeakerInvitationModalProps {
	open: boolean
	loading?: boolean
	onAccept?: () => void | Promise<void>
	onDecline?: () => void | Promise<void>
}

/** Dialog for listener to accept or decline a host speaker invitation. */
function TalkRoomSpeakerInvitationModal({
	open,
	loading = false,
	onAccept,
	onDecline,
}: TalkRoomSpeakerInvitationModalProps) {
	if (!open) return null

	return (
		<CModal
			open
			centered
			closable={false}
			footer={null}
			styles={{
				content: {
					width: 343,
					maxWidth: 'calc(100vw - 32px)',
					padding: 0,
					borderRadius: 24,
					overflow: 'hidden',
				},
				body: {
					padding: 0,
				},
			}}
		>
			<div className={classes.wrapper}>
				<div className={classes.iconSection}>
					<UserTagIcon width={40} height={40} fill="#48546B" />
				</div>

				<div className={classes.info}>
					<h2 className={classes.title}>Speaker invitation</h2>
					<p className={classes.description}>
						The host invited you to become a speaker. Accept to join the stage
						or decline to stay as a listener.
					</p>
				</div>

				<div className={classes.footer}>
					<button
						type="button"
						className={classes.acceptBtn}
						disabled={loading}
						onClick={() => onAccept?.()}
					>
						{loading ? <Spin size="small" /> : 'Accept'}
					</button>
					<button
						type="button"
						className={classes.declineBtn}
						disabled={loading}
						onClick={() => onDecline?.()}
					>
						Decline
					</button>
				</div>
			</div>
		</CModal>
	)
}

export default memo(TalkRoomSpeakerInvitationModal)
