import { memo } from 'react'

import CAvatar from '@/Components/Custom/CAvatar'
import BgIcon1 from '@/svg/Talkroom/BgIcon1'
import BgIcon2 from '@/svg/Talkroom/BgIcon2'
import BgIcon3 from '@/svg/Talkroom/BgIcon3'
import {
	getSpeakerAvatar,
	getSpeakerCount,
	getTalkRoomAvatarLayout,
	getVisibleSpeakers,
	TalkRoomRoom,
} from '@/ultis/talkRoom'

import classes from './TalkRoomAvatarGroup.module.scss'

type TalkRoomAvatarGroupProps = {
	room: TalkRoomRoom
}

function TalkRoomAvatarGroup({ room }: TalkRoomAvatarGroupProps) {
	const count = getSpeakerCount(room)
	const layout = getTalkRoomAvatarLayout(count)
	const visibleSpeakers = getVisibleSpeakers(room, layout)

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
						<div
							className={`${classes.avatarSlot} ${classes.avatarBottomLeft}`}
						>
							<CAvatar
								src={getSpeakerAvatar(visibleSpeakers[0])}
								size={36}
								className={classes.avatar}
							/>
						</div>
						<div className={`${classes.avatarSlot} ${classes.avatarTopRight}`}>
							<CAvatar
								src={getSpeakerAvatar(visibleSpeakers[1])}
								size={36}
								className={classes.avatar}
							/>
						</div>
					</>
				)
			case 'triple':
				return (
					<>
						<div className={`${classes.avatarSlot} ${classes.avatarTripleTop}`}>
							<CAvatar
								src={getSpeakerAvatar(visibleSpeakers[0])}
								size={32}
								className={classes.avatar}
							/>
						</div>
						<div
							className={`${classes.avatarSlot} ${classes.avatarTripleBottomLeft}`}
						>
							<CAvatar
								src={getSpeakerAvatar(visibleSpeakers[1])}
								size={32}
								className={classes.avatar}
							/>
						</div>
						<div
							className={`${classes.avatarSlot} ${classes.avatarTripleBottomRight}`}
						>
							<CAvatar
								src={getSpeakerAvatar(visibleSpeakers[2])}
								size={32}
								className={classes.avatar}
							/>
						</div>
					</>
				)
			default: {
				const speaker = visibleSpeakers[0]
				return (
					<div className={`${classes.avatarSlot} ${classes.avatarSingle}`}>
						{speaker && (
							<CAvatar
								src={getSpeakerAvatar(speaker)}
								size={40}
								className={classes.avatar}
							/>
						)}
					</div>
				)
			}
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
