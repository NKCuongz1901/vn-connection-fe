'use client'

import { IconX } from '@tabler/icons-react'
import { memo } from 'react'

import CModal from '@/Components/Custom/CModal/CModal'
import RedeemGiftIcon from '@/svg/Referral/RedeemGiftIcon'
import { formatNumberString } from '@/ultis/string'

import classes from './RedeemPointsModal.module.scss'

interface RedeemPointsModalProps {
	onClose: () => void
	onConfirm?: () => void
	minimumRedeemPoints?: number
	pointValueVnd?: number
	loading?: boolean
}

function RedeemPointsModal({
	onClose,
	onConfirm,
	minimumRedeemPoints = 200,
	pointValueVnd = 5000,
	loading = false,
}: RedeemPointsModalProps) {
	const minAmount = formatNumberString(minimumRedeemPoints * pointValueVnd)

	return (
		<div className={classes.wrapper}>
			<CModal
				onClose={onClose}
				onCancel={onClose}
				closable={false}
				footer={null}
				styles={{
					content: {
						width: 375,
						maxWidth: 'calc(100vw - 32px)',
						minHeight: 'auto',
						padding: 0,
						borderRadius: 24,
						overflow: 'hidden',
						boxShadow:
							'0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
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
						<IconX size={20} stroke={1.5} />
					</button>

					<div className={classes.iconWrap}>
						<div className={classes.iconBox}>
							<RedeemGiftIcon width={32} height={34} />
						</div>
					</div>

					<div className={classes.info}>
						<h2 className={classes.title}>Redeem Your Points</h2>
						<p className={classes.description}>
							{`• Minimum redeem: ${formatNumberString(minimumRedeemPoints)} points (${minAmount} VND). Payout: 1st–5th monthly`}
							{'\n'}• 1 redemption/month
						</p>
					</div>

					<div className={classes.footer}>
						<button
							type="button"
							className={classes.redeemBtn}
							disabled={loading}
							onClick={onConfirm}
						>
							<span className={classes.redeemBtnText}>Redeem now</span>
						</button>
					</div>
				</div>
			</CModal>
		</div>
	)
}

export default memo(RedeemPointsModal)
