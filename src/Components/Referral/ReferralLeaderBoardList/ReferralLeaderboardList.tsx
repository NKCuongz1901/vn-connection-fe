'use client'

import { Skeleton } from 'antd'
import { memo, useMemo } from 'react'

import ReferralLeaderboardRow from '@/Components/Referral/ReferralLeaderboardRow/ReferralLeaderboardRow'
import { LeaderboardUser } from '@/Components/Referral/ReferralPodiumItem/ReferralPodiumItem'

import classes from './ReferralLeaderboardList.module.scss'

export interface ReferralLeaderboardListProps {
	loading?: boolean
	leaderBoard?: LeaderboardUser[]
	myPosition?: number
	myTotalPoints?: number
	userData?: any
}

function ReferralLeaderboardList({
	loading,
	leaderBoard = [],
	myPosition = 0,
	myTotalPoints = 0,
	userData = {},
}: ReferralLeaderboardListProps) {
	const listItems = useMemo(() => leaderBoard.slice(3), [leaderBoard])

	return (
		<div className={classes.wrapper}>
			<div className={classes.listScroll}>
				{loading ? (
					Array.from({ length: 4 }).map((_, index) => (
						<div key={index} className={classes.skeletonRow}>
							<Skeleton active paragraph={{ rows: 1 }} title={false} />
						</div>
					))
				) : listItems.length ? (
					listItems.map((item) => (
						<ReferralLeaderboardRow
							key={item.id || item.user_rank}
							rank={item.user_rank}
							name={item.name}
							avatar={item.avatar}
							points={item.total_points}
							scoreLabel={item.scoreLabel}
						/>
					))
				) : (
					<div className={classes.empty}>No leaderboard data yet</div>
				)}
			</div>

			<div className={classes.myPositionSection}>
				<div className={classes.myPositionTitle}>Your position</div>
				<ReferralLeaderboardRow
					rank={myPosition}
					name={userData?.name}
					avatar={userData?.avatar}
					points={myTotalPoints}
					variant="myPosition"
				/>
			</div>
		</div>
	)
}

export default memo(ReferralLeaderboardList)
