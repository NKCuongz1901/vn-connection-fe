'use client'

import { Spin } from 'antd'
import { memo } from 'react'

import CModal from '@/Components/Custom/CModal/CModal'
import LeaveRoomIcon from '@/svg/Talkroom/LeaveRoomIcon'

import classes from './TalkRoomListenerLeaveRoom.module.scss'

export interface TalkRoomListenerLeaveRoomProps {
	open: boolean
	loading?: boolean
	onClose: () => void
	onLeave?: () => void | Promise<void>
}

/** Confirm dialog before a listener proactively leaves the talk room. */
function TalkRoomListenerLeaveRoom({
	open,
	loading = false,
	onClose,
	onLeave,
}: TalkRoomListenerLeaveRoomProps) {
	if (!open) return null

	return (
		<CModal
			open
			centered
			closable={false}
			footer={null}
			onCancel={loading ? undefined : onClose}
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
					<LeaveRoomIcon width={40} height={40} />
				</div>

				<div className={classes.info}>
					<h2 className={classes.title}>Leave this room?</h2>
					<p className={classes.description}>
						If you leave now, you&apos;ll miss the rest of the conversation.
						Don&apos;t forget to exchange contacts before leaving
					</p>
				</div>

				<div className={classes.footer}>
					<button
						type="button"
						className={classes.leaveBtn}
						disabled={loading}
						onClick={() => onLeave?.()}
					>
						{loading ? <Spin size="small" /> : 'Leave room'}
					</button>
					<button
						type="button"
						className={classes.stayBtn}
						disabled={loading}
						onClick={onClose}
					>
						Stay here
					</button>
				</div>
			</div>
		</CModal>
	)
}

export default memo(TalkRoomListenerLeaveRoom)
