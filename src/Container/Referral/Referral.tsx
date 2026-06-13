'use client'
import React, { useCallback } from 'react'

import ReferralTabPanel from '@/Components/Referral/ReferralTabPanel/ReferralTabPanel'
import classes from './Referral.module.scss'
import useReferral from '@/hooks/Referral/useReferral'
import { Divider, Flex } from 'antd'
import GiftBoxIcon from '@/svg/GiftBoxIcon'
import CoinIcon from '@/svg/CoinIcon'
import ReceiptIcon from '@/svg/ReceiptIcon'
import useProfile from '@/hooks/Profile/useProfile'
import { formatNumberString } from '@/ultis/string'
function Referral() {
	const {
		loading,
		myPosition,
		leaderBoard,
		walletHistory,
		walletHistoryGroupByMonth,
		topInvitees,
	} = useReferral()
	const { userData } = useProfile({})
	const { wallet } = userData

	const _renderMyTotalRef = useCallback(() => {
		return (
			<div className={classes.myTotalRefContainer}>
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
								{wallet} <span>points</span>
							</div>
						</Flex>
						<GiftBoxIcon />
					</Flex>
					<Flex align="flex-start" gap={4} style={{ width: '100%' }}>
						<div className={classes.myTotalRefCardMoney}>
							<CoinIcon />{' '}
							<span className={classes.myTotalRefCardMoneyText}>
								{formatNumberString(wallet * 5000)} đ
							</span>
						</div>
						<Divider type="vertical" />
						<div className={classes.normalText}>1 point = 5,000 đ</div>
					</Flex>
					<div className={classes.actionRow}>
						<button type="button" className={classes.redeemHistoryBtn}>
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
	}, [wallet])
	return (
		<div className={classes.wrapper}>
			<h3 className={classes.title}>Referral</h3>
			<div className={classes.content}>
				<div className={classes.contentLeft}>
					{_renderMyTotalRef()}
					<ReferralTabPanel
						loading={loading}
						leaderBoard={leaderBoard}
						topInvitees={topInvitees}
						myPosition={myPosition}
						userData={userData}
						walletHistory={walletHistory}
						walletHistoryGroupByMonth={walletHistoryGroupByMonth}
					/>
				</div>
				<div className={classes.contentRight}></div>
			</div>
		</div>
	)
}

export default Referral
