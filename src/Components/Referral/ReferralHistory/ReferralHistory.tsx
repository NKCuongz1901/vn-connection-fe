'use client'

import { Flex, Skeleton } from 'antd'
import { useMemo, useState } from 'react'

import ReferralAllYearsModal from '@/Components/Referral/ReferralHistory/ReferralAllYearsModal/ReferralAllYearsModal'
import ReferralHistoryItem from '@/Components/Referral/ReferralHistory/ReferralHistoryItem/ReferralHistoryItem'
import CalenderIcon from '@/svg/CalenderIcon'
import CoinIcon from '@/svg/CoinIcon'

import classes from './ReferralHistory.module.scss'
import {
	buildAllYearsModalData,
	buildRefByMonthStats,
	type ReferralOverviewData,
	type ReferralWalletHistoryItem,
} from './referralHistory.utils'

export interface ReferralHistoryProps {
	loading?: boolean
	loadingHistory?: boolean
	referralOverview?: ReferralOverviewData
	walletHistory?: ReferralWalletHistoryItem[]
	onScroll?: (e: React.UIEvent<HTMLDivElement>) => void
}

function ReferralHistory({
	loading,
	loadingHistory,
	referralOverview,
	walletHistory = [],
	onScroll,
}: ReferralHistoryProps) {
	const [openAllYearsModal, setOpenAllYearsModal] = useState(false)
	const [selectedYear, setSelectedYear] = useState<number | null>(null)

	const years = referralOverview?.years ?? []
	const allTimePoints = referralOverview?.all_time_points ?? 0

	const refByMonthStats = useMemo(
		() =>
			buildRefByMonthStats(years, {
				selectedYear,
				allTimePoints,
			}),
		[years, selectedYear, allTimePoints],
	)

	const allYearsModalData = useMemo(
		() => buildAllYearsModalData(years, allTimePoints),
		[years, allTimePoints],
	)

	const _renderRefByMonth = () => {
		if (loading) {
			return (
				<div className={classes.refByMonthWrapper}>
					{Array.from({ length: 3 }).map((_, index) => (
						<div key={index} className={classes.refByMonthItemWrap}>
							{index > 0 && <div className={classes.refByMonthDivider} />}
							<div className={classes.refByMonthCard}>
								<Skeleton active paragraph={{ rows: 2 }} title={false} />
							</div>
						</div>
					))}
				</div>
			)
		}

		return (
			<div className={classes.refByMonthWrapper}>
				{refByMonthStats.map((item, index) => (
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
		if (!walletHistory.length) {
			return loadingHistory ? (
				_renderLatestReferralSkeleton()
			) : (
				<div className={classes.empty}>No history yet</div>
			)
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
					{loadingHistory && walletHistory.length > 0 && (
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
				<div
					className={classes.allYears}
					onClick={() => setOpenAllYearsModal(true)}
					role="button"
					tabIndex={0}
					onKeyDown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							setOpenAllYearsModal(true)
						}
					}}
				>
					<CalenderIcon fill="#0F1729" />
					<span className={classes.allYearsText}>All years</span>
				</div>
			</Flex>
			{_renderRefByMonth()}
			{_renderLatestReferral()}
			{openAllYearsModal && (
				<ReferralAllYearsModal
					onClose={() => setOpenAllYearsModal(false)}
					years={allYearsModalData.years}
					total={allYearsModalData.total}
					selectedYear={selectedYear}
					onSelectYear={(year) => {
						setSelectedYear(year)
						setOpenAllYearsModal(false)
					}}
				/>
			)}
		</div>
	)
}

export default ReferralHistory
