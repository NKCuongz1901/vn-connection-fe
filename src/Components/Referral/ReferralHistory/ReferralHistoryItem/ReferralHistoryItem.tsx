'use client'

import { memo } from 'react'

import CAvatar from '@/Components/Custom/CAvatar'

import ReferralHistoryStatus from '../ReferralHistoryStatus/ReferralHistoryStatus'
import {
	formatReferralDate,
	getInviteeAvatar,
	getInviteeDisplayName,
	getReferralHistoryStatus,
	type ReferralWalletHistoryItem,
} from '../referralHistory.utils'
import classes from './ReferralHistoryItem.module.scss'

export interface ReferralHistoryItemProps {
	item: ReferralWalletHistoryItem
}

function ReferralHistoryItem({ item }: ReferralHistoryItemProps) {
	const displayName = getInviteeDisplayName(item)
	const avatar = getInviteeAvatar(item)
	const date = formatReferralDate(item.created_at)
	const status = getReferralHistoryStatus(item)

	return (
		<div className={classes.row}>
			<div className={classes.content}>
				<div className={classes.avatarWrap}>
					<CAvatar src={avatar} size={40} />
				</div>
				<div className={classes.info}>
					<span className={classes.name}>{displayName}</span>
					<span className={classes.date}>{date}</span>
				</div>
			</div>
			<ReferralHistoryStatus status={status} />
		</div>
	)
}

export default memo(ReferralHistoryItem)
