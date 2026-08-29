import { memo, type KeyboardEvent, type MouseEvent } from 'react'
import clsx from 'clsx'

import CAvatar from '@/Components/Custom/CAvatar'
import BgIcon1 from '@/svg/Talkroom/BgIcon1'
import BgIcon2 from '@/svg/Talkroom/BgIcon2'
import BgIcon3 from '@/svg/Talkroom/BgIcon3'
import {
	getSpeakerAvatar,
	getSpeakerCount,
	getTalkRoomAvatarLayout,
	getVisibleSpeakers,
	resolveSpeakerUserId,
	TalkRoomRoom,
	TalkRoomSpeaker,
} from '@/ultis/talkRoom'

import classes from './TalkRoomAvatarGroup.module.scss'

type TalkRoomAvatarGroupProps = {
	room: TalkRoomRoom
	onAvatarClick?: (userId: string) => void
}

function TalkRoomAvatarGroup({ room, onAvatarClick }: TalkRoomAvatarGroupProps) {
	const count = getSpeakerCount(room)
	const layout = getTalkRoomAvatarLayout(count)
	const visibleSpeakers = getVisibleSpeakers(room, layout)

	const handleAvatarClick = (
		event: MouseEvent,
		speaker?: TalkRoomSpeaker,
	) => {
		event.stopPropagation()
		const userId = resolveSpeakerUserId(speaker)
		if (!userId) return
		onAvatarClick?.(userId)
	}

	const renderAvatarSlot = (
		speaker: TalkRoomSpeaker | undefined,
		slotClassName: string,
		size: number,
	) => {
		const userId = resolveSpeakerUserId(speaker)
		const canClick = Boolean(onAvatarClick && userId)

		return (
			<div
				className={clsx(classes.avatarSlot, slotClassName, {
					[classes.avatarSlotClickable]: canClick,
				})}
				role={canClick ? 'button' : undefined}
				tabIndex={canClick ? 0 : undefined}
				onClick={
					canClick ? (event) => handleAvatarClick(event, speaker) : undefined
				}
				onKeyDown={
					canClick
						? (event: KeyboardEvent) => {
								if (event.key === 'Enter' || event.key === ' ') {
									event.preventDefault()
									event.stopPropagation()
									onAvatarClick?.(userId as string)
								}
							}
						: undefined
				}
			>
				{speaker ? (
					<CAvatar
						src={getSpeakerAvatar(speaker)}
						size={size}
						className={classes.avatar}
					/>
				) : null}
			</div>
		)
	}

	const renderBackground = () => {
		switch (layout) {
			case 'double':
				return <BgIcon3 />
			case 'triple':
				return <BgIcon2 />
			default:
				return <BgIcon1 />
		}
	}

	const renderAvatars = () => {
		switch (layout) {
			case 'double':
				return (
					<>
						{renderAvatarSlot(
							visibleSpeakers[0],
							classes.avatarBottomLeft,
							36,
						)}
						{renderAvatarSlot(
							visibleSpeakers[1],
							classes.avatarTopRight,
							36,
						)}
					</>
				)
			case 'triple':
				return (
					<>
						{renderAvatarSlot(
							visibleSpeakers[0],
							classes.avatarTripleTop,
							32,
						)}
						{renderAvatarSlot(
							visibleSpeakers[1],
							classes.avatarTripleBottomLeft,
							32,
						)}
						{renderAvatarSlot(
							visibleSpeakers[2],
							classes.avatarTripleBottomRight,
							32,
						)}
					</>
				)
			default:
				return renderAvatarSlot(
					visibleSpeakers[0],
					classes.avatarSingle,
					40,
				)
		}
	}

	return (
		<div className={classes.wrapper}>
			<div className={classes.bg}>{renderBackground()}</div>
			{renderAvatars()}
		</div>
	)
}

export default memo(TalkRoomAvatarGroup)
