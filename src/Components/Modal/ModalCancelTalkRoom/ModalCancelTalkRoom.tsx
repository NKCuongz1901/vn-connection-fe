'use client'

import { IconCircleXFilled } from '@tabler/icons-react'
import { Spin } from 'antd'
import { memo } from 'react'

import CModal from '@/Components/Custom/CModal/CModal'

import classes from './ModalCancelTalkRoom.module.scss'

export interface ModalCancelTalkRoomProps {
	open: boolean
	loading?: boolean
	onClose: () => void
	onConfirm?: () => void | Promise<void | boolean>
}

function ModalCancelTalkRoom({
	open,
	loading = false,
	onClose,
	onConfirm,
}: ModalCancelTalkRoomProps) {
	if (!open) return null

	const handleConfirm = async () => {
		await onConfirm?.()
	}

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
					<div className={classes.icon}>
						<IconCircleXFilled size={40} color="#CD3031" />
					</div>
				</div>

				<div className={classes.info}>
					<h2 className={classes.title}>Cancel this room</h2>
					<p className={classes.description}>
						Are you sure you want to cancel the talk room now?
					</p>
				</div>

				<div className={classes.footer}>
					<button
						type="button"
						className={classes.confirmBtn}
						disabled={loading}
						onClick={handleConfirm}
					>
						{loading ? (
							<Spin size="small" />
						) : (
							'Cancel room'
						)}
					</button>
					<button
						type="button"
						className={classes.dismissBtn}
						disabled={loading}
						onClick={onClose}
					>
						Keep this room
					</button>
				</div>
			</div>
		</CModal>
	)
}

export default memo(ModalCancelTalkRoom)
