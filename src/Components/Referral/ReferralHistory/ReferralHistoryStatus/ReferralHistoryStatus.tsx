'use client'

import { IconCircleCheckFilled, IconClock } from '@tabler/icons-react'
import { memo } from 'react'

import CoinIcon from '@/svg/CoinIcon'

import type { ReferralHistoryStatusResult } from '../referralHistory.utils'
import classes from './ReferralHistoryStatus.module.scss'

export interface ReferralHistoryStatusProps {
	status: ReferralHistoryStatusResult
}

function ReferralHistoryStatus({ status }: ReferralHistoryStatusProps) {
	if (status.type === 'reward') {
		return (
			<div className={classes.status}>
				<span className={classes.rewardValue}>+{status.amount ?? 0}</span>
				<div className={classes.coinIcon}>
					<CoinIcon />
				</div>
			</div>
		)
	}

	if (status.type === 'profile') {
		return (
			<div className={classes.status}>
				<IconCircleCheckFilled size={20} color="#006B35" />
				<span className={classes.profileText}>Profile</span>
			</div>
		)
	}

	return (
		<div className={classes.status}>
			<span className={classes.pendingText}>Pending</span>
			<IconClock size={16} color="#7987A4" />
		</div>
	)
}

export default memo(ReferralHistoryStatus)
