'use client'

import { IconChevronLeft } from '@tabler/icons-react'
import { Skeleton } from 'antd'
import clsx from 'clsx'

import CalenderIcon from '@/svg/CalenderIcon'
import ClockIcon from '@/svg/ClockIcon'
import CoinIcon from '@/svg/CoinIcon'
import TickCircleIcon from '@/svg/TickCircleIcon'
import WalletIcon from '@/svg/Referral/WalletIcon'
import useRedeemHistory, {
	type RedeemHistoryItem,
} from '@/hooks/Referral/useRedeemHistory'
import { mainRoutes } from '@/routes/MainRoutes'
import { useLocalePath } from '@/ultis/route'
import { formatNumberString } from '@/ultis/string'

import classes from './RedeemHistory.module.scss'

function RedeemHistory() {
	const { onChangeRoute } = useLocalePath()
	const { loading, items, onScroll } = useRedeemHistory()

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

			<div className={classes.list} onScroll={onScroll}>
				{loading ? (
					<>
						<Skeleton.Input active style={{ width: '100%', height: 140 }} />
						<Skeleton.Input active style={{ width: '100%', height: 140 }} />
					</>
				) : (
					items.map((item) => renderRedeemItem(item))
				)}
			</div>
		</div>
	)
}

export default RedeemHistory
