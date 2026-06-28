'use client'

import { IconX } from '@tabler/icons-react'
import { memo } from 'react'

import CModal from '@/Components/Custom/CModal/CModal'
import PlusIcon from '@/svg/PlusIcon'

import classes from './ModalTalkRoomWarning.module.scss'

export interface ModalTalkRoomWarningProps {
	open: boolean
	onClose: () => void
	onConfirm?: () => void
}

function ModalTalkRoomWarning({
	open,
	onClose,
	onConfirm,
}: ModalTalkRoomWarningProps) {
	if (!open) return null

	const handleConfirm = () => {
		onConfirm?.()
	}

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
				<button
					type="button"
					className={classes.closeBtn}
					onClick={onClose}
					aria-label="Close"
				>
					<IconX size={20} />
				</button>

				<div className={classes.iconSection}>
					<div className={classes.icon}>
						<PlusIcon />
					</div>
				</div>

				<div className={classes.info}>
					<h2 className={classes.title}>
						Creating a new Talk Room will leave your current room
					</h2>
				</div>

				<div className={classes.footer}>
					<button
						type="button"
						className={classes.confirmBtn}
						onClick={handleConfirm}
					>
						Create room
					</button>
				</div>
			</div>
		</CModal>
	)
}

export default memo(ModalTalkRoomWarning)
