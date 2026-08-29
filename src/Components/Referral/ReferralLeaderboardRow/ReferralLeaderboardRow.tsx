'use client'

import clsx from 'clsx'
import { memo } from 'react'

import CAvatar from '@/Components/Custom/CAvatar'
import CoinIcon from '@/svg/CoinIcon'

import classes from './ReferralLeaderboardRow.module.scss'

export interface ReferralLeaderboardRowProps {
	rank?: number | string
	name?: string
	avatar?: string
	points?: number
	scoreLabel?: string
	variant?: 'default' | 'myPosition'
}

function ReferralLeaderboardRow({
	rank,
	name,
	avatar,
	points = 0,
	scoreLabel,
	variant = 'default',
}: ReferralLeaderboardRowProps) {
	return (
		<div
			className={clsx(classes.row, {
				[classes.myPosition]: variant === 'myPosition',
			})}
		>
			<div className={classes.left}>
				<span className={classes.rank}>{rank ?? '—'}</span>
				<div className={classes.person}>
					<div className={classes.avatarWrap}>
						<CAvatar src={avatar} size={32} />
					</div>
					<span className={classes.name}>{name || '—'}</span>
				</div>
			</div>
			<div className={classes.points}>
				{scoreLabel ? (
					<span className={classes.pointsValue}>{scoreLabel}</span>
				) : (
					<>
						<span className={classes.pointsValue}>{points}</span>
						<CoinIcon />
					</>
				)}
			</div>
		</div>
	)
}

export default memo(ReferralLeaderboardRow)
