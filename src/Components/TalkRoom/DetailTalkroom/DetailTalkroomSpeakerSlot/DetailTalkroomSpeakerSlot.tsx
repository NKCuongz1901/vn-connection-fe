'use client'

import { IconCrown, IconPlus } from '@tabler/icons-react'
import clsx from 'clsx'
import { memo } from 'react'

import CAvatar from '@/Components/Custom/CAvatar'
import HandIcon from '@/svg/Talkroom/HandIcon'
import UserMicOffIcon from '@/svg/Talkroom/UserMicOffIcon'
import UserMicOnIcon from '@/svg/Talkroom/UserMicOnIcon'
import WaveSoundIcon from '@/svg/Talkroom/WaveSoundIcon'
import { getSpeakerMicStatusIcon, TalkRoomSpeakerSlot } from '@/ultis/talkRoom'
import { mappingFlag } from '@/Variable/countryVariable'

import classes from './DetailTalkroomSpeakerSlot.module.scss'

type DetailTalkroomSpeakerSlotProps = {
	slot: TalkRoomSpeakerSlot
	totalRaiseHand?: number
	onClick?: () => void
}

function DetailTalkroomSpeakerSlot({
	slot,
	totalRaiseHand = 0,
	onClick,
}: DetailTalkroomSpeakerSlotProps) {
	if (slot.type === 'empty') {
		const showWaiting = totalRaiseHand > 0

		return (
			<div
				className={clsx(classes.slot, {
					[classes.emptySlotClickable]: Boolean(onClick),
				})}
				onClick={onClick}
				role={onClick ? 'button' : undefined}
				tabIndex={onClick ? 0 : undefined}
				onKeyDown={
					onClick
						? (event) => {
								if (event.key === 'Enter' || event.key === ' ') {
									event.preventDefault()
									onClick()
								}
							}
						: undefined
				}
			>
				<div
					className={clsx(classes.emptyAvatar, {
						[classes.emptyAvatarWaiting]: showWaiting,
					})}
				>
					{showWaiting ? (
						<>
							<HandIcon width={20} height={20} fill="#E55A0F" />
							<span className={classes.emptyWaitingCount}>
								{totalRaiseHand}
							</span>
							<span className={classes.emptyWaitingLabel}>Waiting</span>
						</>
					) : (
						<IconPlus size={24} stroke={1.5} color="#fff" />
					)}
				</div>
				<span className={classes.label}>{slot.label}</span>
			</div>
		)
	}

	const { speaker, isHost, label } = slot
	const displayName = speaker?.name || label
	const countryCode = speaker?.i_am_from
	const statusIcon = getSpeakerMicStatusIcon(speaker)

	return (
		<div
			className={clsx(classes.slot, {
				[classes.slotClickable]: Boolean(onClick),
			})}
			onClick={onClick}
			role={onClick ? 'button' : undefined}
			tabIndex={onClick ? 0 : undefined}
			onKeyDown={
				onClick
					? (event) => {
							if (event.key === 'Enter' || event.key === ' ') {
								event.preventDefault()
								onClick()
							}
						}
					: undefined
			}
		>
			<div className={classes.avatarWrap}>
				<CAvatar
					src={speaker?.avatar}
					size={80}
					className={classes.filledAvatar}
				/>
				{countryCode && (
					<div className={classes.flagWrapper}>
						<div
							className={clsx(
								`flag:${mappingFlag[countryCode] || countryCode}`,
								classes.flag,
							)}
						/>
					</div>
				)}
				{isHost && (
					<div className={classes.crownBadge}>
						<IconCrown size={12} stroke={2} color="#fff" fill="#fff" />
					</div>
				)}
			</div>
			<div className={classes.userInfo}>
				{statusIcon && (
					<div
						className={clsx(classes.micPill, {
							[classes.micPillTalking]: statusIcon === 'talking',
						})}
					>
						{statusIcon === 'mic-off' ? (
							<UserMicOffIcon width={16} height={16} />
						) : null}
						{statusIcon === 'mic-on' ? (
							<UserMicOnIcon width={16} height={16} />
						) : null}
						{statusIcon === 'talking' ? (
							<WaveSoundIcon width={16} height={16} />
						) : null}
					</div>
				)}
				<span className={classes.userName}>{displayName}</span>
			</div>
		</div>
	)
}

export default memo(DetailTalkroomSpeakerSlot)
