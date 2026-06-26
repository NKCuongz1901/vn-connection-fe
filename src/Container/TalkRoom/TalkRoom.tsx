'use client'

import { IconChevronLeft } from '@tabler/icons-react'
import { Flex } from 'antd'
import { useState } from 'react'

import ModalNotiChatRoom from '@/Components/ChatRoom/ModalNotiChatRoom'
import TalkRoomProfileInfo from '@/Components/TalkRoom/TalkRoomProfileInfo/TalkRoomProfileInfo'
import TalkRoomStats from '@/Components/TalkRoom/TalkRoomStats/TalkRoomStats'
import useTalkRoom from '@/hooks/TalkRoom/useTalkRoom'
import useProfile from '@/hooks/Profile/useProfile'
import { mainRoutes } from '@/routes/MainRoutes'
import BookIcon from '@/svg/BookIcon'
import { useLocalePath } from '@/ultis/route'

import classes from './TalkRoom.module.scss'

function TalkRoom() {
	const [ruleModalOpen, setRuleModalOpen] = useState(false)
	const { onChangeRoute } = useLocalePath()

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
				<IconChevronLeft
					className={classes.iconBack}
					onClick={() => onChangeRoute(mainRoutes.overview)}
				/>
				<div className={classes.title}>Talk room</div>
				<div
					className={classes.iconBook}
					onClick={() => setRuleModalOpen(true)}
				>
					<BookIcon fill="#fff" width={14} height={14} />
				</div>
			</Flex>
			<Flex className={classes.content}>
				<div className={classes.rightContent}>{_renderProfile()}</div>
				<div className={classes.leftContent}></div>
			</Flex>

			{ruleModalOpen && (
				<ModalNotiChatRoom
					open
					onClose={() => setRuleModalOpen(false)}
					onSubmit={() => setRuleModalOpen(false)}
				/>
			)}
		</div>
	)
}

export default TalkRoom
