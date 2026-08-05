'use client'

import { memo } from 'react'

import CModal from '@/Components/Custom/CModal/CModal'
import RoomClosedIcon from '@/svg/Talkroom/RoomClosedIcon'

import classes from './TalkRoomForceClosedModal.module.scss'

export interface TalkRoomForceClosedModalProps {
	open: boolean
	onConfirm?: () => void
}

/** Dialog shown when countWaiting expires or the room is force-closed. */
function TalkRoomForceClosedModal({
	open,
	onConfirm,
}: TalkRoomForceClosedModalProps) {
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
					<RoomClosedIcon width={40} height={40} />
				</div>

				<div className={classes.info}>
					<h2 className={classes.title}>Oops, room closed!</h2>
					<p className={classes.description}>
						This room has been canceled. Let&apos;s hop into another one
					</p>
				</div>

				<div className={classes.footer}>
					<button
						type="button"
						className={classes.confirmBtn}
						onClick={() => onConfirm?.()}
					>
						Got it
					</button>
				</div>
			</div>
		</CModal>
	)
}

export default memo(TalkRoomForceClosedModal)
