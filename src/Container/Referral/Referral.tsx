'use client'
import React, { useCallback } from 'react'

import CInput from '@/Components/Custom/CInput'
import ReferralTabPanel from '@/Components/Referral/ReferralTabPanel/ReferralTabPanel'
import ReferralTutorialSteps from '@/Components/Referral/ReferralTutorialSteps/ReferralTutorialSteps'
import { useModal } from '@/context/ModalContext'
import useReferral from '@/hooks/Referral/useReferral'
import useProfile from '@/hooks/Profile/useProfile'
import CopyIcon from '@/svg/ChatBox/CopyIcon'
import CoinIcon from '@/svg/CoinIcon'
import GiftBoxIcon from '@/svg/GiftBoxIcon'
import ReceiptIcon from '@/svg/ReceiptIcon'
import UnboxGiftIcon from '@/svg/Referral/UnboxGiftIcon'
import { formatNumberString, copyToClipboard } from '@/ultis/string'
import { useLocalePath } from '@/ultis/route'
import { mainRoutes } from '@/routes/MainRoutes'
import { Divider, Flex, Skeleton } from 'antd'

import classes from './Referral.module.scss'
import WalletIcon from '@/svg/Referral/WalletIcon'
import ShareSquareIcon from '@/svg/Referral/ShareSquareIcon'

const skeletonItems = [
	{ id: '2', value: 220 },
	{ id: '1', value: 120 },
	{ id: '3', value: 320 },
	{ id: '4', value: 240 },
]
function Referral() {
	const {
		loading,
		loadingHistory,
		myPosition,
		leaderBoard,
		walletHistory,
		walletHistoryGroupByMonth,
		topInvitees,
		onLoadMoreHistory,
		onScrollHistory,
	} = useReferral()
	const { userData } = useProfile({})
	const { openSuccess } = useModal()
	const { onChangeRoute } = useLocalePath()
	const { wallet, invite_code, share_link } = userData || {}

	const handleCopy = useCallback(
		(text?: string) => {
			if (!text) return
			copyToClipboard(text)
			openSuccess({ message: 'Copied successfully!' })
		},
		[openSuccess],
	)

	const _renderCopySuffix = useCallback(
		(value?: string) => (
			<button
				type="button"
				className={classes.copyIcon}
				onClick={() => handleCopy(value)}
				aria-label="Copy"
			>
				<CopyIcon fill="#7987A4" width={20} height={20} />
			</button>
		),
		[handleCopy],
	)

	const handleShare = useCallback(async () => {
		if (!share_link) return
		if (navigator.share) {
			try {
				await navigator.share({ url: share_link })
				return
			} catch {
				// User cancelled or share failed — fall back to copy
			}
		}
		handleCopy(share_link)
	}, [share_link, handleCopy])

	const _renderMyTotalRef = useCallback(() => {
		return (
			<div className={classes.myTotalRefContainer}>
				<div className={classes.myTotalRefCardCta}>
					<button
						type="button"
						className={classes.myTotalRefCardAction}
						onClick={() => onChangeRoute(mainRoutes.referralAddBankCard)}
						aria-label="Wallet"
					>
						<WalletIcon />
					</button>
					<button
						type="button"
						className={classes.myTotalRefCardAction}
						onClick={handleShare}
						aria-label="Share referral link"
					>
						<ShareSquareIcon />
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
	}, [wallet, handleShare, onChangeRoute])

	const _renderContentRightTop = () => {
		return (
			<div className={classes.contentRightTop}>
				<UnboxGiftIcon />
				<div className={classes.contentRightTopTitle}>
					Refer to your friends to receive rewards
				</div>
			</div>
		)
	}

	const _renderContentRightMiddle = () => {
		return (
			<div className={classes.contentRightMiddle}>
				<div className={classes.contentRightMiddleTitle}>
					Send referral link to friends
				</div>
				<div className={classes.referralFields}>
					<div className={classes.referralField}>
						<CInput
							label="Referral code"
							isNotBold
							value={invite_code || ''}
							readOnly
							allowClear={false}
							bordered={false}
							suffix={_renderCopySuffix(invite_code)}
						/>
					</div>
					<div className={classes.referralField}>
						<CInput
							label="Referral link"
							isNotBold
							value={share_link || ''}
							readOnly
							allowClear={false}
							bordered={false}
							suffix={_renderCopySuffix(share_link)}
						/>
					</div>
					<button
						type="button"
						className={classes.inviteNowBtn}
						onClick={() => handleCopy(share_link)}
					>
						Invite now
					</button>
				</div>
			</div>
		)
	}

	const _renderContentRightBottom = () => {
		return (
			<div className={classes.contentRightBottom}>
				<ReferralTutorialSteps
					completeData={userData?.complete_profile}
				/>
			</div>
		)
	}

	if (loading) {
		return (
			<Flex className={classes.wrapper} vertical>
				<Flex className={classes.totalInfo} vertical>
					<Skeleton.Input active style={{ width: '100%', height: 320 }} />
				</Flex>
				{skeletonItems.map((i) => (
					<Skeleton.Input
						key={i.id}
						active
						className={classes.contentBody}
						style={{ width: '100%', height: i.value }}
					/>
				))}
			</Flex>
		)
	}
	return (
		<div className={classes.wrapper}>
			<h3 className={classes.title}>Referral</h3>
			<div className={classes.content}>
				<div className={classes.contentLeft}>
					{_renderMyTotalRef()}
					<ReferralTabPanel
						loading={loading}
						loadingHistory={loadingHistory}
						leaderBoard={leaderBoard}
						topInvitees={topInvitees}
						myPosition={myPosition}
						userData={userData}
						walletHistory={walletHistory}
						walletHistoryGroupByMonth={walletHistoryGroupByMonth}
						onLoadMoreHistory={onLoadMoreHistory}
						onScrollHistory={onScrollHistory}
					/>
				</div>
				<div className={classes.contentDivider}></div>
				<div className={classes.contentRight}>
					{_renderContentRightTop()}
					<div className={classes.topDivider}></div>
					{_renderContentRightMiddle()}
					<div className={classes.topDivider}></div>
					{_renderContentRightBottom()}
				</div>
			</div>
		</div>
	)
}

export default Referral
