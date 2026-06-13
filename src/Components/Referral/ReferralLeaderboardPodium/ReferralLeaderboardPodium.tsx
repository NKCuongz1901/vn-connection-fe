'use client'

import { Skeleton } from 'antd'
import { memo, useMemo } from 'react'

import ReferralPodiumItem, {
	LeaderboardUser,
} from '@/Components/Referral/ReferralPodiumItem/ReferralPodiumItem'

import classes from './ReferralLeaderboardPodium.module.scss'

export interface ReferralLeaderboardPodiumProps {
	topInvitees?: LeaderboardUser[]
	loading?: boolean
}

const PODIUM_SLOTS: { rank: 1 | 2 | 3; index: number }[] = [
	{ rank: 2, index: 1 },
	{ rank: 1, index: 0 },
	{ rank: 3, index: 2 },
]

function ReferralLeaderboardPodium({
	topInvitees = [],
	loading,
}: ReferralLeaderboardPodiumProps) {
	const slots = useMemo(
		() =>
			PODIUM_SLOTS.map(({ rank, index }) => ({
				rank,
				user: topInvitees[index],
			})),
		[topInvitees],
	)

	if (loading && !topInvitees.length) {
		return (
			<div className={classes.podium}>
				{PODIUM_SLOTS.map(({ rank }) => (
					<div key={rank} className={classes.skeletonSlot}>
						<Skeleton.Avatar active size={rank === 1 ? 68 : 60} />
						<Skeleton.Input active size="small" style={{ width: 80 }} />
					</div>
				))}
			</div>
		)
	}

	return (
		<div className={classes.podium}>
			{slots.map(({ rank, user }) => (
				<ReferralPodiumItem key={rank} rank={rank} user={user} />
			))}
		</div>
	)
}

export default memo(ReferralLeaderboardPodium)
