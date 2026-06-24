'use client'

import { Flex } from 'antd'

import TalkRoomProfileInfo from '@/Components/TalkRoom/TalkRoomProfileInfo/TalkRoomProfileInfo'
import TalkRoomStats from '@/Components/TalkRoom/TalkRoomStats/TalkRoomStats'
import useTalkRoom from '@/hooks/TalkRoom/useTalkRoom'
import useProfile from '@/hooks/Profile/useProfile'
import BookIcon from '@/svg/BookIcon'

import classes from './TalkRoom.module.scss'

function TalkRoom() {
	const { loading, myTalkRoomAnalysis } = useTalkRoom()
	const { userData } = useProfile({})

	const _renderProfile = () => {
		return (
			<div className={classes.profileContainer}>
				<TalkRoomProfileInfo user={userData} />
				<TalkRoomStats data={myTalkRoomAnalysis} loading={loading} />
			</div>
		)
	}
	return (
		<div className={classes.wrapper}>
			<Flex className={classes.header}>
				<div className={classes.title}>Talk room</div>
				<div className={classes.iconBook}>
					<BookIcon fill="#fff" width={14} height={14} />
				</div>
			</Flex>
			<Flex className={classes.content}>
				<div className={classes.rightContent}>{_renderProfile()}</div>
				<div className={classes.leftContent}></div>
			</Flex>
		</div>
	)
}

export default TalkRoom
