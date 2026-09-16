'use client'

import clsx from 'clsx'
import { useState } from 'react'

import ReferralHistory from '@/Components/Referral/ReferralHistory/ReferralHistory'
import ReferralLeaderboard from '@/Components/Referral/ReferralLeaderboard/ReferralLeaderboard'
import type {
	ReferralOverviewData,
	ReferralWalletHistoryItem,
} from '@/Components/Referral/ReferralHistory/referralHistory.utils'

import classes from './ReferralTabPanel.module.scss'

const TABS = [
	{ key: 'leaderboard', label: 'Leaderboard' },
	{ key: 'history', label: 'History' },
] as const

type ReferralTab = (typeof TABS)[number]['key']

export interface ReferralTabPanelProps {
	loadingLeaderBoard?: boolean
	loadingOverview?: boolean
	loadingHistory?: boolean
	leaderBoard?: any[]
	topInvitees?: any[]
	myPosition?: number
	myTotalPoints?: number
	userData?: any
	referralOverview?: ReferralOverviewData
	walletHistory?: ReferralWalletHistoryItem[]
	period?: 'monthly' | 'yearly' | 'all_time'
	onChangePeriod?: (period: 'monthly' | 'yearly' | 'all_time') => void
	onScrollHistory?: (e: React.UIEvent<HTMLDivElement>) => void
}

function ReferralTabPanel({
	loadingLeaderBoard,
	loadingOverview,
	loadingHistory,
	leaderBoard = [],
	topInvitees = [],
	myPosition = 0,
	myTotalPoints = 0,
	userData = {},
	referralOverview,
	walletHistory = [],
	period,
	onChangePeriod,
	onScrollHistory,
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
						loading={loadingLeaderBoard}
						leaderBoard={leaderBoard}
						topInvitees={topInvitees}
						myPosition={myPosition}
						myTotalPoints={myTotalPoints}
						userData={userData}
						period={period}
						onChangePeriod={onChangePeriod}
					/>
				)}
				{activeTab === 'history' && (
					<ReferralHistory
						loading={loadingOverview}
						loadingHistory={loadingHistory}
						referralOverview={referralOverview}
						walletHistory={walletHistory}
						onScroll={onScrollHistory}
					/>
				)}
			</div>
		</div>
	)
}

export default ReferralTabPanel
