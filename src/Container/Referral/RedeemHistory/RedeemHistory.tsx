'use client'

import { IconChevronLeft } from '@tabler/icons-react'
import clsx from 'clsx'

import CalenderIcon from '@/svg/CalenderIcon'
import ClockIcon from '@/svg/ClockIcon'
import CoinIcon from '@/svg/CoinIcon'
import TickCircleIcon from '@/svg/TickCircleIcon'
import WalletIcon from '@/svg/Referral/WalletIcon'
import { mainRoutes } from '@/routes/MainRoutes'
import { useLocalePath } from '@/ultis/route'
import { formatNumberString } from '@/ultis/string'

import classes from './RedeemHistory.module.scss'

type RedeemStatus = 'pending' | 'paid'

interface RedeemHistoryItem {
	id: string
	date: string
	status: RedeemStatus
	amount: number
	points: number
	paidAt?: string
}

const REDEEM_HISTORY_ITEMS: RedeemHistoryItem[] = [
	{
		id: '1',
		date: 'Jan 10, 2025',
		status: 'pending',
		amount: 1000000,
		points: 200,
	},
	{
		id: '2',
		date: 'Jan 10, 2025',
		status: 'paid',
		amount: 1000000,
		points: 200,
		paidAt: 'Paid on Dec 5, 2024 at 02:45 PM',
	},
]

function RedeemHistory() {
	const { onChangeRoute } = useLocalePath()

	const renderRedeemItem = (item: RedeemHistoryItem) => {
		const isPending = item.status === 'pending'

		return (
			<div key={item.id} className={classes.card}>
				<div className={classes.cardHeader}>
					<div className={classes.dateWrap}>
						<CalenderIcon fill="#7987A4" />
						<span className={classes.date}>{item.date}</span>
					</div>
					<div
						className={clsx(
							classes.statusTag,
							isPending ? classes.statusPending : classes.statusPaid,
						)}
					>
						{isPending ? (
							<ClockIcon fill="#E55A0F" />
						) : (
							<TickCircleIcon fill="#1B8024" width={16} height={16} />
						)}
						<span>{isPending ? 'Pending' : 'Paid'}</span>
					</div>
				</div>

				<div className={classes.cardContent}>
					<div className={classes.walletIconWrap}>
						<WalletIcon fill="#E55A0F" />
					</div>
					<div className={classes.priceWrap}>
						<div className={classes.amount}>
							{formatNumberString(item.amount)} đ
						</div>
						<div className={classes.pointsWrap}>
							<CoinIcon />
							<span>{item.points} points</span>
						</div>
					</div>
				</div>

				{!isPending && item.paidAt && (
					<>
						<div className={classes.divider} />
						<p className={classes.paidAt}>{item.paidAt}</p>
					</>
				)}
			</div>
		)
	}

	return (
		<div className={classes.wrapper}>
			<div className={classes.header}>
				<button
					type="button"
					className={classes.titleRow}
					onClick={() => onChangeRoute(mainRoutes.referral)}
				>
					<IconChevronLeft size={20} color="#0F1729" />
					<span className={classes.title}>Redeem history</span>
				</button>
				<p className={classes.description}>
					Track your redemption requests and payout status
				</p>
			</div>

			<div className={classes.list}>
				{REDEEM_HISTORY_ITEMS.map((item) => renderRedeemItem(item))}
			</div>
		</div>
	)
}

export default RedeemHistory
