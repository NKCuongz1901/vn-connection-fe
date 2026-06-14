'use client'

import { memo } from 'react'

import CModal from '@/Components/Custom/CModal/CModal'
import CalenderIcon from '@/svg/CalenderIcon'
import CoinIcon from '@/svg/CoinIcon'
import TropyIcon from '@/svg/Referral/TropyIcon'

import type { ReferralYearStat } from '../referralHistory.utils'

import classes from './ReferralAllYearsModal.module.scss'

interface ReferralAllYearsModalProps {
	onClose: () => void
	years: ReferralYearStat[]
	total: number
}

function ReferralAllYearsModal({
	onClose,
	years,
	total,
}: ReferralAllYearsModalProps) {
	return (
		<div className={classes.wrapper}>
			<CModal
				onClose={onClose}
				onCancel={onClose}
				title={<span className={classes.modalTitle}>Ref list</span>}
				footer={null}
				styles={{
					content: {
						width: 660,
						minHeight: 'auto',
						padding: 0,
						borderRadius: 8,
						overflow: 'hidden',
						boxShadow:
							'0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
					},
					header: {
						marginBottom: 0,
						padding: '16px 24px 8px',
						borderBottom: '1px solid #d9d9d9',
					},
					body: {
						padding: 0,
					},
				}}
			>
				<div className={classes.container}>
					{years.length ? (
						years.map(({ year, total: yearTotal }) => (
							<div key={year} className={classes.yearRow}>
								<div className={classes.iconWrap}>
									<CalenderIcon fill="#E55A0F" />
								</div>
								<span className={classes.yearLabel}>{year}</span>
								<div className={classes.points}>
									<span>{yearTotal}</span>
									<CoinIcon />
								</div>
							</div>
						))
					) : (
						<div className={classes.empty}>No referral points yet</div>
					)}
					<div className={`${classes.yearRow} ${classes.totalRow}`}>
						<div className={classes.iconWrap}>
							<TropyIcon />
						</div>
						<span className={classes.totalLabel}>Total points</span>
						<div className={classes.points}>
							<span>{total}</span>
							<CoinIcon />
						</div>
					</div>
				</div>
			</CModal>
		</div>
	)
}

export default memo(ReferralAllYearsModal)
