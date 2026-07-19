'use client'

import { IconChevronLeft } from '@tabler/icons-react'
import { Flex } from 'antd'
import { useCallback } from 'react'

import TalkRoomLeaderboard from '@/Components/TalkRoom/TalkRoomLeaderboard'
import useProfile from '@/hooks/Profile/useProfile'
import useTalkRoomLeaderBoard from '@/hooks/TalkRoom/useTalkRoomLeaderBoard'
import BookIcon from '@/svg/BookIcon'
import CalenderIcon from '@/svg/CalenderIcon'
import CoinIcon from '@/svg/CoinIcon'
import GiftBoxIcon from '@/svg/GiftBoxIcon'
import ReceiptIcon from '@/svg/ReceiptIcon'
import { mainRoutes } from '@/routes/MainRoutes'
import { useLocalePath } from '@/ultis/route'

import classes from './LeaderBoard.module.scss'

function LeaderBoard() {
	const { onChangeRoute } = useLocalePath()
	const { userData } = useProfile({})
	const {
		loading,
		metric,
		period,
		leaderBoard,
		topHosts,
		myPosition,
		onChangeMetric,
		onChangePeriod,
	} = useTalkRoomLeaderBoard()

	/** Render earnings summary card (placeholder points until wallet API is wired) */
	const _renderMyTotalRef = useCallback(() => {
		return (
			<div className={classes.myTotalRefContainer}>
				<div className={classes.myTotalRefCardCta}>
					<button
						type="button"
						className={classes.myTotalRefCardAction}
						aria-label="Rules"
					>
						<BookIcon fill="#fff" />
					</button>
					<button
						type="button"
						className={classes.myTotalRefCardAction}
						aria-label="Calendar"
					>
						<CalenderIcon fill="#fff" />
					</button>
				</div>
				<div className={classes.myTotalRefCard}>
					<Flex
						align="center"
						justify="space-between"
						gap={12}
						style={{ width: '100%' }}
					>
						<Flex vertical align="flex-start" justify="center" gap={4}>
							<div className={classes.myTotalRefCardTitle}>Total earnings</div>
							<div className={classes.myTotalRefCardPoint}>
								750 <span>points</span>
							</div>
						</Flex>
						<GiftBoxIcon />
					</Flex>
					<Flex align="flex-start" gap={4} style={{ width: '100%' }}>
						<CoinIcon />
						<div className={classes.normalText}>20 minutes host = 1 point</div>
					</Flex>
					<div className={classes.actionRow}>
						<button
							type="button"
							className={classes.redeemHistoryBtn}
							onClick={() => onChangeRoute(mainRoutes.referralRedeemHistory)}
						>
							<ReceiptIcon />
							<span className={classes.normalText}>Redeem history</span>
						</button>
						<button type="button" className={classes.redeemBtn}>
							<span className={classes.redeemText}>Redeem</span>
						</button>
					</div>
				</div>
			</div>
		)
	}, [onChangeRoute])

	return (
		<div className={classes.wrapper}>
			<Flex align="center" gap={4} className={classes.header}>
				<IconChevronLeft
					className={classes.iconBack}
					onClick={() => onChangeRoute(mainRoutes.talkroom)}
				/>
				<div className={classes.title}>Leaderboard</div>
			</Flex>
			<div className={classes.container}>
				{_renderMyTotalRef()}
				<TalkRoomLeaderboard
					loading={loading}
					leaderBoard={leaderBoard}
					topHosts={topHosts}
					myPosition={myPosition}
					userData={userData}
					metric={metric}
					period={period}
					onChangeMetric={onChangeMetric}
					onChangePeriod={onChangePeriod}
				/>
			</div>
		</div>
	)
}

export default LeaderBoard
