'use client'

import { Flex, Skeleton } from 'antd'

import ReferralHistoryItem from '@/Components/Referral/ReferralHistory/ReferralHistoryItem/ReferralHistoryItem'
import CalenderIcon from '@/svg/CalenderIcon'
import CoinIcon from '@/svg/CoinIcon'

import classes from './ReferralHistory.module.scss'
import type { ReferralWalletHistoryItem } from './referralHistory.utils'

const REF_BY_MONTH_STATS = [
	{ label: 'May 2025', value: 18 },
	{ label: 'June 2025', value: 17 },
	{ label: 'Total', value: 35 },
] as const

export interface ReferralHistoryProps {
	loading?: boolean
	loadingHistory?: boolean
	walletHistory?: ReferralWalletHistoryItem[]
	walletHistoryGroupByMonth?: any[]
	onLoadMore?: () => void
	onScroll?: (e: React.UIEvent<HTMLDivElement>) => void
}

function ReferralHistory({
	loading,
	loadingHistory,
	walletHistory = [],
	onScroll,
}: ReferralHistoryProps) {
	const _renderRefByMonth = () => {
		return (
			<div className={classes.refByMonthWrapper}>
				{REF_BY_MONTH_STATS.map((item, index) => (
					<div key={item.label} className={classes.refByMonthItemWrap}>
						{index > 0 && <div className={classes.refByMonthDivider} />}
						<div className={classes.refByMonthCard}>
							<span className={classes.refByMonthLabel}>{item.label}</span>
							<span className={classes.refByMonthValue}>{item.value}</span>
							<div className={classes.refByMonthCaption}>
								<span>points</span>
								<div className={classes.refByMonthCoin}>
									<CoinIcon />
								</div>
							</div>
						</div>
					</div>
				))}
			</div>
		)
	}

	const _renderLatestReferralSkeleton = () => {
		return Array.from({ length: 4 }).map((_, index) => (
			<div key={index} className={classes.skeletonRow}>
				<Skeleton.Avatar active size={40} shape="circle" />
				<Skeleton active paragraph={{ rows: 1 }} title={false} />
			</div>
		))
	}

	const _renderLatestReferralList = () => {
		if (loading && !walletHistory.length) {
			return _renderLatestReferralSkeleton()
		}

		if (!walletHistory.length) {
			return !loading ? (
				<div className={classes.empty}>No history yet</div>
			) : null
		}

		return walletHistory.map((item) => (
			<ReferralHistoryItem key={item.id} item={item} />
		))
	}

	const _renderLatestReferral = () => {
		return (
			<div className={classes.latestReferral}>
				<div className={classes.latestReferralHeader}>
					<h3>Latest referral</h3>
				</div>
				<div className={classes.listScroll} onScroll={onScroll}>
					<div className={classes.listContent}>{_renderLatestReferralList()}</div>
					{loadingHistory && (
						<div className={classes.loadingMore}>Loading more...</div>
					)}
				</div>
			</div>
		)
	}

	return (
		<div className={classes.wrapper}>
			<Flex
				align="center"
				justify="space-between"
				className={classes.monthHeader}
			>
				<h3>Referrals by month</h3>
				<div className={classes.allYears}>
					<CalenderIcon fill="#0F1729" />
					<span className={classes.allYearsText}>All years</span>
				</div>
			</Flex>
			{_renderRefByMonth()}
			{_renderLatestReferral()}
		</div>
	)
}

export default ReferralHistory
