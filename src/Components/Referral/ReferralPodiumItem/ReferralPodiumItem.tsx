'use client'

import clsx from 'clsx'
import { memo } from 'react'

import CAvatar from '@/Components/Custom/CAvatar'
import CoinIcon from '@/svg/CoinIcon'
import CrownIcon from '@/svg/Referral/CrownIcon'
import Top1Icon from '@/svg/Referral/Top1Icon'
import Top2Icon from '@/svg/Referral/Top2Icon'
import Top3Icon from '@/svg/Referral/Top3Icon'

import classes from './ReferralPodiumItem.module.scss'

export type LeaderboardUser = {
	id?: string
	name?: string
	avatar?: string
	total_points?: number
	user_rank?: string | number
	scoreLabel?: string
}

export interface ReferralPodiumItemProps {
	rank: 1 | 2 | 3
	user?: LeaderboardUser
}

const MEDAL_ICONS = {
	1: Top1Icon,
	2: Top2Icon,
	3: Top3Icon,
} as const

function ReferralPodiumItem({ rank, user }: ReferralPodiumItemProps) {
	const MedalIcon = MEDAL_ICONS[rank]
	const avatarSize = rank === 1 ? 64 : 56

	return (
		<div
			className={clsx(classes.podiumItem, classes[`rank${rank}`], {
				[classes.isEmpty]: !user,
			})}
		>
			{rank === 1 && user && (
				<div className={classes.crown}>
					<CrownIcon />
				</div>
			)}

			<div className={classes.avatarBlock}>
				<div className={clsx(classes.avatarRing, classes[`avatarRing${rank}`])}>
					<CAvatar src={user?.avatar} size={avatarSize} />
				</div>
				<div className={classes.medal}>
					<MedalIcon />
				</div>
			</div>

			<div className={classes.info}>
				<div className={classes.name}>{user?.name || '—'}</div>
				<div
					className={clsx(classes.points, {
						[classes.pointsDuration]: Boolean(user?.scoreLabel),
					})}
				>
					{user?.scoreLabel ? (
						<span className={classes.pointsDurationValue}>
							{user.scoreLabel}
						</span>
					) : (
						<>
							<span className={classes.pointsValue}>
								{user?.total_points ?? 0}
							</span>
							<CoinIcon />
						</>
					)}
				</div>
			</div>
		</div>
	)
}

export default memo(ReferralPodiumItem)
