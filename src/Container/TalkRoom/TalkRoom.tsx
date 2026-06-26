'use client'

import { IconChevronLeft } from '@tabler/icons-react'
import { Flex, Skeleton } from 'antd'
import { useState } from 'react'

import ModalNotiChatRoom from '@/Components/ChatRoom/ModalNotiChatRoom'
import RoomCard from '@/Components/TalkRoom/RoomCard'
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

	const { loading, myTalkRoomAnalysis, listTalkRooms, loadingListTalkRooms } =
		useTalkRoom()
	const { userData } = useProfile({})
	console.log(listTalkRooms)

	const _renderProfile = () => {
		return (
			<div className={classes.profileContainer}>
				<TalkRoomProfileInfo user={userData} />
				<TalkRoomStats data={myTalkRoomAnalysis} loading={loading} />
			</div>
		)
	}

	const handleShareRoom = (room: { dynamic_link?: string }) => {
		if (!room?.dynamic_link) return
		if (navigator.share) {
			navigator.share({ url: room.dynamic_link }).catch(() => undefined)
			return
		}
		navigator.clipboard?.writeText(room.dynamic_link)
	}

	const _renderListTalkRoom = () => {
		return (
			<div className={classes.listTalkroomContainer}>
				<Flex vertical gap={12} className={classes.listTalkroomInner}>
					{loadingListTalkRooms && !listTalkRooms.length
						? Array.from({ length: 3 }).map((_, index) => (
								<Skeleton.Input
									key={index}
									active
									block
									style={{ height: 180, borderRadius: 16 }}
								/>
							))
						: listTalkRooms.map((room) => (
								<RoomCard key={room.id} room={room} onShare={handleShareRoom} />
							))}
				</Flex>
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
				<div className={classes.rightContent}>
					{_renderProfile()}
					{_renderListTalkRoom()}
				</div>
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
