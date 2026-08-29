'use client'

import { memo } from 'react'

import CModal from '@/Components/Custom/CModal/CModal'
import SessionEndChatIcon from '@/svg/Talkroom/SessionEndChatIcon'

import classes from './TalkRoomSessionEndModal.module.scss'

export interface TalkRoomSessionEndModalProps {
	open: boolean
	onClose: () => void
}

/** Dialog shown when the live talk session ends and chat time begins. */
function TalkRoomSessionEndModal({
	open,
	onClose,
}: TalkRoomSessionEndModalProps) {
	if (!open) return null

	return (
		<CModal
			open
			centered
			closable={false}
			footer={null}
			onCancel={onClose}
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
					<SessionEndChatIcon width={40} height={32} />
				</div>

				<div className={classes.info}>
					<h2 className={classes.title}>
						Session talk ended - Extra 10 minutes to chat
					</h2>
					<p className={classes.description}>
						The Talk Room has ended, but you still have 10 minutes to{' '}
						<strong>chat or exchange contacts</strong> to join future rooms
						together
					</p>
				</div>

				<div className={classes.footer}>
					<button
						type="button"
						className={classes.gotItBtn}
						onClick={onClose}
					>
						Got it
					</button>
				</div>
			</div>
		</CModal>
	)
}

export default memo(TalkRoomSessionEndModal)
