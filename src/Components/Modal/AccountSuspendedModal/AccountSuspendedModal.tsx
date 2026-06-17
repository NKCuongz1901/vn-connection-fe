'use client'

import {
	IconAlertCircleFilled,
	IconInfoCircle,
	IconX,
} from '@tabler/icons-react'
import { memo } from 'react'

import CButton from '@/Components/Custom/CButton'
import CModal from '@/Components/Custom/CModal/CModal'

import {
	AccountSuspendedPayload,
	canShowAppealButton,
	getSuspensionDurationText,
	getSuspensionType,
} from '@/ultis/string'

import classes from './AccountSuspendedModal.module.scss'

export interface AccountSuspendedModalProps {
	open: boolean
	payload: AccountSuspendedPayload
	onClose: () => void
	onAppeal?: () => void
	appealLoading?: boolean
}

function AccountSuspendedModal({
	open,
	payload,
	onClose,
	onAppeal,
	appealLoading,
}: AccountSuspendedModalProps) {
	const suspensionType = getSuspensionType(payload.unblocked_at)
	const duration = getSuspensionDurationText(payload)
	const showAppeal = canShowAppealButton(payload.amount_of_appeal)
	const displayName = payload.name?.trim() || 'your account'
	const reason = payload.reason?.trim() || 'Violation of community standards'

	const isTemporary = suspensionType === 'temporary' && !!duration

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
					width: 520,
					maxWidth: 'calc(100vw - 32px)',
					padding: 0,
					borderRadius: 8,
					overflow: 'hidden',
				},
				body: {
					padding: 0,
				},
			}}
		>
			<div className={classes.wrapper}>
				<div className={classes.header}>
					<div className={classes.titleRow}>
						<IconAlertCircleFilled size={24} className={classes.infoIcon} />
						<div className={classes.title}>
							{isTemporary
								? 'Account Temporarily Suspended'
								: 'Account Permanently Suspended'}
						</div>
					</div>
					<button
						type="button"
						className={classes.closeBtn}
						aria-label="Close"
						onClick={onClose}
					>
						<IconX size={16} />
					</button>
				</div>

				<div className={classes.body}>
					{isTemporary ? (
						<p className={classes.paragraph}>
							Your account{' '}
							<span className={classes.accountName}>{displayName}</span> has
							been temporarily suspended for {duration} due to violations of
							UniVini&apos;s community guidelines.
						</p>
					) : (
						<p className={classes.paragraph}>
							Your account has been permanently suspended due to serious or
							repeated violations of UniVini&apos;s community guidelines.
						</p>
					)}

					<p className={classes.reason}>{reason}</p>
					<div className={classes.spacer} />

					{isTemporary ? (
						<p className={classes.paragraph}>
							⛔️{' '}
							<span className={classes.emphasis}>
								This restriction will last for {duration}.
							</span>
						</p>
					) : (
						<p className={classes.paragraph}>
							⛔️{' '}
							<span className={classes.emphasis}>This decision is final.</span>
						</p>
					)}

					<p className={classes.paragraph}>
						{isTemporary
							? '❗️ Your account will not have access to UniVini features during this period, including posting, chatting, or creating events.'
							: '❗️ Your account will no longer have access to UniVini features, including posting, chatting, or creating events.'}
					</p>

					<div className={classes.spacer} />

					<p className={classes.paragraph}>
						❓{' '}
						<span className={classes.emphasis}>Think this was a mistake?</span>
					</p>
					<p className={classes.paragraph}>
						{isTemporary
							? 'You can still request a review:'
							: 'You can still request a final review:'}
					</p>
				</div>

				{showAppeal && (
					<div className={classes.footer}>
						<div className={classes.appealBtn}>
							<CButton
								ctype="oranger"
								loading={appealLoading}
								disabled={appealLoading}
								onClick={onAppeal || onClose}
							>
								Appeal now
							</CButton>
						</div>
					</div>
				)}
			</div>
		</CModal>
	)
}

export default memo(AccountSuspendedModal)
