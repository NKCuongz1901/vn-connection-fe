import { Flex } from 'antd'
import { memo } from 'react'

import TalkRoomAvatarGroup from '@/Components/TalkRoom/TalkRoomAvatarGroup/TalkRoomAvatarGroup'
import LiveIcon from '@/svg/GroupIcon'
import {
	formatTalkRoomSchedule,
	isTalkRoomLive,
	TalkRoomRoom,
} from '@/ultis/talkRoom'

import classes from './TalkRoomCard.module.scss'

type TalkRoomCardProps = {
	room: TalkRoomRoom
	onClick?: () => void
}

function TalkRoomCard({ room, onClick }: TalkRoomCardProps) {
	const isLive = isTalkRoomLive(room?.status)
	const { language, total_participants, max_participants, next_schedule_at } =
		room || {}

	return (
		<Flex vertical className={classes.card} onClick={onClick}>
			<TalkRoomAvatarGroup room={room} />

			<Flex className={classes.tag} align="center">
				{isLive && (
					<div className={classes.liveIcon}>
						<LiveIcon fill="#E55A0F" width={16} height={16} />
					</div>
				)}
				{language?.flag && (
					<div className={classes.flagWrap}>
						<img
							src={language.flag}
							alt={language.name || ''}
							className={classes.flag}
						/>
					</div>
				)}
				{language?.name && (
					<span className={classes.languageName}>{language.name}</span>
				)}
			</Flex>

			{isLive ? (
				<span className={classes.statusLive}>
					Live {total_participants ?? 0}/{max_participants ?? 0}
				</span>
			) : (
				<span className={classes.statusScheduled}>
					{formatTalkRoomSchedule(next_schedule_at)}
				</span>
			)}
		</Flex>
	)
}

export default memo(TalkRoomCard)
