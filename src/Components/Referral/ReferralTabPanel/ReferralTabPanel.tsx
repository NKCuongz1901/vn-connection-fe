'use client'

import clsx from 'clsx'
import { useState } from 'react'

import ReferralHistory from '@/Components/Referral/ReferralHistory/ReferralHistory'
import ReferralLeaderboard from '@/Components/Referral/ReferralLeaderboard/ReferralLeaderboard'

import classes from './ReferralTabPanel.module.scss'
import { Divider } from 'antd'

const TABS = [
	{ key: 'leaderboard', label: 'Leaderboard' },
	{ key: 'history', label: 'History' },
] as const

type ReferralTab = (typeof TABS)[number]['key']

export interface ReferralTabPanelProps {
	loading?: boolean
	leaderBoard?: any[]
	topInvitees?: any[]
	myPosition?: number
	userData?: any
	walletHistory?: any[]
	walletHistoryGroupByMonth?: any[]
	onLoadMoreHistory?: () => void
	onScrollHistory?: (e: React.UIEvent<HTMLDivElement>) => void
	loadingHistory?: boolean
}

function ReferralTabPanel({
	loading,
	leaderBoard = [],
	topInvitees = [],
	myPosition = 0,
	userData = {},
	walletHistory = [],
	walletHistoryGroupByMonth = [],
	onLoadMoreHistory,
	onScrollHistory,
	loadingHistory,
}: ReferralTabPanelProps) {
	const [activeTab, setActiveTab] = useState<ReferralTab>('leaderboard')

	return (
		<div className={classes.wrapper}>
			<div className={classes.tabBar}>
				{TABS.map(({ key, label }) => (
					<button
						key={key}
						type="button"
						className={clsx(classes.tabItem, {
							[classes.tabItemActive]: activeTab === key,
						})}
						onClick={() => setActiveTab(key)}
					>
						{label}
					</button>
				))}
				<div className={classes.tabBarDivider} />
			</div>
			<div className={classes.divider}></div>
			<div className={classes.tabContent}>
				{activeTab === 'leaderboard' && (
					<ReferralLeaderboard
						loading={loading}
						leaderBoard={leaderBoard}
						topInvitees={topInvitees}
						myPosition={myPosition}
						userData={userData}
					/>
				)}
				{activeTab === 'history' && (
					<ReferralHistory
						loading={loading}
						loadingHistory={loadingHistory}
						walletHistory={walletHistory}
						walletHistoryGroupByMonth={walletHistoryGroupByMonth}
						onLoadMore={onLoadMoreHistory}
						onScroll={onScrollHistory}
					/>
				)}
			</div>
		</div>
	)
}

export default ReferralTabPanel
