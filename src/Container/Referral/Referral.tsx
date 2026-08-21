'use client'
import React, { useCallback, useState } from 'react'

import { sendMessageById } from '@/apis/conversationApis'
import CButton from '@/Components/Custom/CButton'
import CInput from '@/Components/Custom/CInput'
import ModalMyFriend from '@/Components/Friend/ModalMyFriend'
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
		loadingLeaderBoard,
		loadingHistory,
		myPosition,
		myTotalPoints,
		leaderBoard,
		period,
		walletHistory,
		walletHistoryGroupByMonth,
		topInvitees,
		onChangePeriod,
		onLoadMoreHistory,
		onScrollHistory,
	} = useReferral()
	const { userData } = useProfile({})
	const { openSuccess, openError } = useModal()
	const { onChangeRoute } = useLocalePath()
	const { wallet, invite_code, share_link } = userData || {}
	const [shareModalOpen, setShareModalOpen] = useState(false)
	const [loadingShare, setLoadingShare] = useState<Record<string, boolean>>({})
	const [shareList, setShareList] = useState<Record<string, boolean>>({})

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

	const handleCloseShareModal = useCallback(() => {
		setShareModalOpen(false)
		setShareList({})
	}, [])

	const handleShareFriend = useCallback(
		async (friendId: string) => {
			if (!share_link) return

			setLoadingShare((prev) => ({ ...prev, [friendId]: true }))
			try {
				const res: any = await sendMessageById({
					receiver_id: friendId,
					message: {
						content: share_link,
						type: 'TEXT',
					},
				})

				if (res?.code === 200) {
					setShareList((prev) => ({ ...prev, [friendId]: true }))
					openSuccess({ message: 'Share link to your friend successfully' })
				}
			} catch (error) {
				openError(error)
			} finally {
				setLoadingShare((prev) => ({ ...prev, [friendId]: false }))
			}
		},
		[share_link, openSuccess, openError],
	)

	const _renderMyFriendComp = useCallback(
		(data: { friend?: { id?: string } }) => {
			const friendId = data?.friend?.id
			return (
				<div className={classes.btnShareFriend}>
					<CButton
						ctype="oranger"
						onClick={() => friendId && handleShareFriend(friendId)}
						loading={friendId ? loadingShare?.[friendId] : false}
						disabled={friendId ? shareList?.[friendId] : false}
					>
						Send
					</CButton>
				</div>
			)
		},
		[handleShareFriend, loadingShare, shareList],
	)

	const _renderShareModal = () => {
		if (!shareModalOpen) return null

		return (
			<ModalMyFriend
				title="Share friend"
				onClose={handleCloseShareModal}
				onCopy={() => handleCopy(share_link)}
				customComp={_renderMyFriendComp}
			/>
		)
	}

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
						onClick={() => setShareModalOpen(true)}
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
			{_renderShareModal()}
			<h3 className={classes.title}>Referral</h3>
			<div className={classes.content}>
				<div className={classes.contentLeft}>
					{_renderMyTotalRef()}
					<ReferralTabPanel
						loading={loading}
						loadingLeaderBoard={loadingLeaderBoard}
						loadingHistory={loadingHistory}
						leaderBoard={leaderBoard}
						topInvitees={topInvitees}
						myPosition={myPosition}
						myTotalPoints={myTotalPoints}
						userData={userData}
						period={period}
						onChangePeriod={onChangePeriod}
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
