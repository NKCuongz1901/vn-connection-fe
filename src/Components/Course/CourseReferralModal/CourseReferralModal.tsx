'use client'

import { memo, useCallback, useEffect, useState } from 'react'

import { sendMessageById } from '@/apis/conversationApis'
import CButton from '@/Components/Custom/CButton'
import CModal from '@/Components/Custom/CModal/CModal'
import ModalMyFriend from '@/Components/Friend/ModalMyFriend'
import { useModal } from '@/context/ModalContext'
import LogoSvg from '@/svg/LogoSvg'
import ShareIcon from '@/svg/FriendSvg/ShareIcon'
import { copyToClipboard } from '@/ultis/string'

import classes from './CourseReferralModal.module.scss'

type CourseReferralModalProps = {
	open: boolean
	onClose: () => void
	referralCode?: string
	shareLink?: string
}

function CourseReferralModal({
	open,
	onClose,
	referralCode = '',
	shareLink = '',
}: CourseReferralModalProps) {
	const { openSuccess, openError } = useModal()
	const [shareFriendOpen, setShareFriendOpen] = useState(false)
	const [loadingShare, setLoadingShare] = useState<Record<string, boolean>>({})
	const [shareList, setShareList] = useState<Record<string, boolean>>({})

	useEffect(() => {
		if (open) return
		setShareFriendOpen(false)
		setShareList({})
	}, [open])

	const handleCopy = useCallback(() => {
		if (!shareLink) return
		copyToClipboard(shareLink)
		openSuccess({ message: 'Copied successfully!' })
	}, [openSuccess, shareLink])

	const handleGetLink = useCallback(() => {
		if (!shareLink) return
		setShareFriendOpen(true)
	}, [shareLink])

	const handleCloseShareFriend = useCallback(() => {
		setShareFriendOpen(false)
		setShareList({})
	}, [])

	const handleShareFriend = useCallback(
		async (friendId: string) => {
			if (!shareLink) return
			setLoadingShare((prev) => ({ ...prev, [friendId]: true }))
			try {
				const res: any = await sendMessageById({
					receiver_id: friendId,
					message: {
						content: shareLink,
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
		[openError, openSuccess, shareLink],
	)

	const renderShareFriendAction = useCallback(
		(data: { friend?: { id?: string } }) => {
			const friendId = data?.friend?.id
			return (
				<div>
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

	if (!open) return null

	return (
		<>
			{shareFriendOpen ? null : (
				<CModal
					open
					centered
					closable={false}
					footer={null}
					onCancel={onClose}
					styles={{
						content: {
							width: 340,
							maxWidth: 'calc(100vw - 32px)',
							minHeight: 'auto',
							maxHeight: 'none',
							padding: 0,
							borderRadius: 24,
							overflow: 'hidden',
							border: '5px solid rgba(255, 255, 255, 0.2)',
						},
						body: {
							padding: 0,
							overflow: 'hidden',
						},
					}}
				>
					<div className={classes.wrapper}>
						<div className={classes.header}>
							<p className={classes.title}>Free UniVini Course</p>
							<p className={classes.subtitle}>
								Share & earn <span className={classes.percent}>10%</span> per
								sale
							</p>
							<p className={classes.invite}>
								Invite 10 friends for a free course
							</p>
						</div>

						<img
							src="/images/course/referalImage.png"
							alt=""
							className={classes.graphic}
							width={300}
							height={196}
						/>

						<div className={classes.bottom}>
							<div className={classes.shareBar}>
								<div className={classes.logo}>
									<LogoSvg fill="#fff" />
									<span>UniVini</span>
								</div>
								<div className={classes.codeBlock}>
									<p className={classes.codeLabel}>Your referral code</p>
									<p className={classes.codeValue}>{referralCode}</p>
								</div>
							</div>

							<button
								type="button"
								className={classes.shareBtn}
								onClick={handleGetLink}
								disabled={!shareLink}
							>
								<span className={classes.shareIcon}>
									<ShareIcon fill="#fff" />
								</span>
								<span>Get referral link</span>
							</button>
						</div>
					</div>
				</CModal>
			)}
			{shareFriendOpen ? (
				<ModalMyFriend
					title="Share friend"
					onClose={handleCloseShareFriend}
					onCopy={handleCopy}
					customComp={renderShareFriendAction}
				/>
			) : null}
		</>
	)
}

export default memo(CourseReferralModal)
