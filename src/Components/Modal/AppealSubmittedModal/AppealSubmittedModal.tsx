'use client'

import { IconX } from '@tabler/icons-react'
import { memo } from 'react'

import CModal from '@/Components/Custom/CModal/CModal'
import AppealIcon from '@/svg/AppealIcon'

import classes from './AppealSubmittedModal.module.scss'

export interface AppealSubmittedModalProps {
	open: boolean
	onClose: () => void
}

function AppealSubmittedModal({ open, onClose }: AppealSubmittedModalProps) {
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
					width: 352,
					maxWidth: 'calc(100vw - 28px)',
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
					aria-label="Close"
					onClick={onClose}
				>
					<IconX size={20} />
				</button>

				<div className={classes.content}>
					<div className={classes.icon}>
						<AppealIcon />
					</div>

					<h2 className={classes.title}>Appeal Submitted</h2>

					<div className={classes.textBlock}>
						<p className={classes.description}>
							Your appeal has been received and is under review.
						</p>
						<p className={classes.note}>
							Note: While we review your case, your account remains restricted.
							We&apos;ll notify you once a decision is made (within 3–5 business
							days)
						</p>
					</div>
				</div>
			</div>
		</CModal>
	)
}

export default memo(AppealSubmittedModal)
