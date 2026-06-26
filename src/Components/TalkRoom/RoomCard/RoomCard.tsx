'use client'

import { memo } from 'react'
import clsx from 'clsx'
import classes from './RoomCard.module.scss'

import TalkRoomAvatarGroup from '@/Components/TalkRoom/TalkRoomAvatarGroup/TalkRoomAvatarGroup'

import { IconCircleMinus, IconCrown, IconDots } from '@tabler/icons-react'
import CalenderIcon from '@/svg/CalenderIcon'
import People from '@/svg/People'
import ShareIconSvg from '@/svg/ShareIconSvg'
import StarIcon2 from '@/svg/StarIcon2'
import BellIcon from '@/svg/BellIcon'
import MoreIcon from '@/svg/MoreIcon'
import HostIcon from '@/svg/HostIcon'

import {
	formatTalkRoomCategoriesText,
	formatTalkRoomCmiText,
	formatTalkRoomLevelLabel,
	formatTalkRoomLiveParticipantsText,
	formatTalkRoomSchedule,
	isTalkRoomLive,
	TalkRoomRoom,
} from '@/ultis/talkRoom'
import MinusCircleFill from '@/svg/Talkroom/MinusCircleFill'

export type RoomCardProps = {
	room: TalkRoomRoom
	onShare?: (room: TalkRoomRoom) => void
	onCountMeIn?: (room: TalkRoomRoom) => void
	onNotJoining?: (room: TalkRoomRoom) => void
	onNotifyMe?: (room: TalkRoomRoom) => void
	onJoin?: (room: TalkRoomRoom) => void
	onMore?: (room: TalkRoomRoom) => void
	onClick?: (room: TalkRoomRoom) => void
}

function RoomCard({
	room,
	onShare,
	onCountMeIn,
	onNotJoining,
	onNotifyMe,
	onJoin,
	onMore,
	onClick,
}: RoomCardProps) {
	const isLive = isTalkRoomLive(room?.status)
	const isYourRoom = room?.is_your_room === true
	const topic = formatTalkRoomCategoriesText(room?.categories)
	const cmiText = formatTalkRoomCmiText(room?.cmi_users, room?.total_cmi)
	const liveParticipantsText = formatTalkRoomLiveParticipantsText(room)
	const scheduleText = formatTalkRoomSchedule(room?.next_schedule_at)
	const hasCmi = (room?.total_cmi ?? 0) > 0 && !!cmiText
	const showCmiSection = !isLive && (hasCmi || !isYourRoom)
	const showScheduleSection = !isLive && !!scheduleText

	const handleShare = (event: React.MouseEvent) => {
		event.stopPropagation()
		onShare?.(room)
	}

	const handleCountMeIn = (event: React.MouseEvent) => {
		event.stopPropagation()
		onCountMeIn?.(room)
	}

	const handleNotJoining = (event: React.MouseEvent) => {
		event.stopPropagation()
		onNotJoining?.(room)
	}

	const handleNotifyMe = (event: React.MouseEvent) => {
		event.stopPropagation()
		onNotifyMe?.(room)
	}

	const handleJoin = (event: React.MouseEvent) => {
		event.stopPropagation()
		onJoin?.(room)
	}

	const handleMore = (event: React.MouseEvent) => {
		event.stopPropagation()
		onMore?.(room)
	}

	return (
		<article
			className={classes.card}
			onClick={() => onClick?.(room)}
			role={onClick ? 'button' : undefined}
			tabIndex={onClick ? 0 : undefined}
		>
			<div className={classes.header}>
				<div className={classes.info}>
					<div className={classes.nameTopic}>
						{room?.name && <h3 className={classes.title}>{room.name}</h3>}
						{topic && <p className={classes.topic}>{topic}</p>}
					</div>

					<div className={classes.tags}>
						{(room?.language?.flag || room?.language?.name) && (
							<div className={classes.tag}>
								{room.language?.flag && (
									<img
										src={room.language.flag}
										alt={room.language.name || ''}
										className={classes.flag}
									/>
								)}
								{room.language?.name && (
									<span className={classes.tagText}>{room.language.name}</span>
								)}
							</div>
						)}

						{(room?.level || []).map((level) => (
							<div key={level} className={classes.tag}>
								<span className={classes.tagText}>
									{formatTalkRoomLevelLabel(level)}
								</span>
							</div>
						))}
					</div>
				</div>

				<div className={classes.avatarSection}>
					<button
						type="button"
						className={classes.shareBtn}
						aria-label="Share room"
						onClick={handleShare}
					>
						<ShareIconSvg fill="#E55A0F" />
					</button>
					<TalkRoomAvatarGroup room={room} />
				</div>
			</div>

			<div className={classes.divider} />

			<div className={classes.footer}>
				{isLive ? (
					<div className={classes.footerRow}>
						<div className={classes.metaGroup}>
							<People fill="#006B35" width={20} height={20} />
							<p className={classes.metaText}>
								<span className={classes.metaHighlight}>
									{liveParticipantsText.highlight}
								</span>
								<span className={classes.metaRegular}>
									{liveParticipantsText.regular}
								</span>
							</p>
						</div>

						{room?.is_joined ? (
							<button
								type="button"
								className={clsx(
									classes.actionBtn,
									classes.actionBtnSecondary,
									classes.actionBtnDisabled,
								)}
								disabled
							>
								Joined
							</button>
						) : isYourRoom ? (
							<div className={classes.hostActions}>
								<div className={classes.hostBadge}>
									<IconCrown size={16} stroke={2} color="#E55A0F" />
									<span>You&apos;re host</span>
								</div>
								<button
									type="button"
									className={classes.moreBtn}
									aria-label="More actions"
									onClick={handleMore}
								>
									<IconDots size={16} color="#0F1729" />
								</button>
							</div>
						) : (
							<button
								type="button"
								className={clsx(classes.actionBtn, classes.actionBtnPrimary)}
								onClick={handleJoin}
							>
								Join
							</button>
						)}
					</div>
				) : (
					<>
						{showCmiSection && (
							<div className={classes.footerRow}>
								<div className={classes.metaGroup}>
									<People fill="#006B35" width={20} height={20} />
									<p className={classes.metaText}>
										{hasCmi ? (
											renderCmiText(cmiText)
										) : (
											<span className={classes.metaHighlight}>
												Join the talk with us
											</span>
										)}
									</p>
								</div>

								{!isYourRoom &&
									(room?.is_cmi ? (
										<button
											type="button"
											className={clsx(
												classes.actionBtn,
												classes.actionBtnSecondary,
											)}
											onClick={handleNotJoining}
										>
											<MinusCircleFill />
											<span>Not joining</span>
										</button>
									) : (
										<button
											type="button"
											className={clsx(
												classes.actionBtn,
												classes.actionBtnPrimary,
											)}
											onClick={handleCountMeIn}
										>
											<StarIcon2 fill="#fff" width={16} height={16} />
											<span>Count me in</span>
										</button>
									))}
							</div>
						)}

						{showScheduleSection && (
							<div className={classes.footerRow}>
								<div className={classes.scheduleGroup}>
									<CalenderIcon fill="#006B35" width={20} height={20} />
									{isYourRoom ? (
										<span className={classes.scheduleLabel}>
											Start at: {scheduleText}
										</span>
									) : (
										<>
											<span className={classes.scheduleLabel}>Start at</span>
											<span className={classes.scheduleTime}>
												{scheduleText}
											</span>
										</>
									)}
								</div>

								{isYourRoom ? (
									<div className={classes.hostActions}>
										<div className={classes.hostBadge}>
											<HostIcon fill="#E55A0F" width={16} height={16} />
											<span>You&apos;re host</span>
										</div>
										<button
											type="button"
											className={classes.moreBtn}
											aria-label="More actions"
											onClick={handleMore}
										>
											<MoreIcon fill="#0F1729" width={16} height={16} />
										</button>
									</div>
								) : (
									<button
										type="button"
										className={clsx(
											classes.actionBtn,
											classes.actionBtnSecondary,
										)}
										onClick={handleNotifyMe}
									>
										<BellIcon fill="#0F1729" width={16} height={16} />
										<span>
											{room?.user_notified ? 'Notify on' : 'Notify me'}
										</span>
									</button>
								)}
							</div>
						)}
					</>
				)}
			</div>
		</article>
	)
}

const renderCmiText = (text: string) => {
	const andOthersMatch = text.match(/^(.*) and (\d+ others?) plan to join$/)
	if (andOthersMatch) {
		const [, namesPart, othersPart] = andOthersMatch
		return (
			<>
				<span className={classes.metaHighlight}>{namesPart}</span>
				<span className={classes.metaRegular}>
					{' '}
					and {othersPart} plan to join
				</span>
			</>
		)
	}

	const simpleMatch = text.match(/^(.*) plans? to join$/)
	if (simpleMatch) {
		return (
			<>
				<span className={classes.metaHighlight}>{simpleMatch[1]}</span>
				<span className={classes.metaRegular}>
					{text.endsWith(' plans to join') ? ' plans to join' : ' plan to join'}
				</span>
			</>
		)
	}

	return <span className={classes.metaHighlight}>{text}</span>
}

export default memo(RoomCard)
