'use client'

import { Spin } from 'antd'
import { IconClock } from '@tabler/icons-react'
import { memo } from 'react'

import CModal from '@/Components/Custom/CModal/CModal'

import classes from './TalkRoomTimeUpModal.module.scss'

export interface TalkRoomTimeUpModalProps {
	open: boolean
	loading?: boolean
	onConfirm?: () => void | Promise<void>
}

/** Dialog shown when the post-live chat window expires. */
function TalkRoomTimeUpModal({
	open,
	loading = false,
	onConfirm,
}: TalkRoomTimeUpModalProps) {
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
					<IconClock
						size={40}
						className={classes.clockIcon}
						stroke={1.5}
					/>
				</div>

				<div className={classes.info}>
					<h2 className={classes.title}>Time&apos;s up</h2>
					<p className={classes.description}>
						The chat time has ended. You will be redirected out of this Talk
						Room.
					</p>
				</div>

				<div className={classes.footer}>
					<button
						type="button"
						className={classes.confirmBtn}
						disabled={loading}
						onClick={() => onConfirm?.()}
					>
						{loading ? <Spin size="small" /> : 'OK'}
					</button>
				</div>
			</div>
		</CModal>
	)
}

export default memo(TalkRoomTimeUpModal)
