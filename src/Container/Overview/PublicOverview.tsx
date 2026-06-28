'use client'

import clsx from 'clsx'
import { Flex } from 'antd'
import { memo } from 'react'

import OverviewLockedSection from '@/Components/Overview/OverviewLockedSection'
import CAvatarBandage from '@/Components/Custom/CAvatarBandage'
import CButtonCreate from '@/Components/Custom/CButtonCreate'
import EventTitle from '@/Components/Event/EventTitle'
import useRequireLogin from '@/hooks/useRequireLogin'
import EventIcon from '@/svg/Event'
import Message2Icon from '@/svg/Message2Icon'
import MicroPhoneIcon from '@/svg/MicroPhoneIcon'
import Party from '@/svg/Party'
import People from '@/svg/People'
import UpcomingEvent from '@/svg/UpcomingEvent'

import { mappingEventTitle } from '@/Variable/event.variable'
import {
	OVERVIEW_GUEST_CHAT_ROOMS,
	OVERVIEW_GUEST_CHAT_ROOM_COUNT,
} from '@/Variable/overviewGuestChatRooms.variable'
import { LEFT_FLAG } from '@/Variable/countryVariable'
import { mainRoutes } from '@/routes/MainRoutes'

import classes from './Overview.module.scss'

const GUEST_COMMUNITY_COUNT = 3
const GUEST_ACTIVITY_COUNT = 0

function PublicOverview() {
	const { requireLogin } = useRequireLogin()

	const _renderHangout = () => (
		<Flex vertical className={classes.hangout}>
			<Flex className={classes.titleHangoutHeaderRow}>
				<Flex
					className={clsx(classes.titleHangout, classes.titleHangoutHeader)}
					onClick={requireLogin}
				>
					<Party fill="#006B35" />
					<span className={classes.title}>Available now</span>
				</Flex>
				<CButtonCreate onClick={requireLogin}>Go online</CButtonCreate>
			</Flex>
			<OverviewLockedSection
				dashedBorder
				description="See who's online and ready to meet"
				onLogin={requireLogin}
			/>
		</Flex>
	)

	const _renderChatRoom = () => (
		<Flex vertical className={classes.chatRoomWrapper}>
			<Flex className={classes.title} onClick={requireLogin}>
				<EventTitle
					hiddenAdd
					label="Chat room"
					number={OVERVIEW_GUEST_CHAT_ROOM_COUNT}
					icon={<Message2Icon />}
				/>
			</Flex>
			<Flex vertical className={classes.chatRoom}>
				<Flex className={classes.chatRoomList}>
					{OVERVIEW_GUEST_CHAT_ROOMS.map((item) => (
						<Flex
							key={item.id}
							vertical
							className={classes.chatRoomItem}
							onClick={requireLogin}
						>
							<div>
								<CAvatarBandage
									isHidden
									src={item.flag}
									className={clsx(classes.chatRoomAva, {
										[classes.leftFlag]: !!LEFT_FLAG[item.name],
									})}
									classBandage={classes.chatRoomBandage}
								/>
							</div>
							<div className={classes.chatRoomLabel}>{item.name}</div>
						</Flex>
					))}
				</Flex>
			</Flex>
		</Flex>
	)

	const _renderTalkRoom = () => (
		<Flex vertical className={classes.talkRoomWrapper}>
			<Flex className={classes.title} onClick={requireLogin}>
				<EventTitle
					label="Talk room"
					labelCreateBtn="Create talk room"
					icon={<MicroPhoneIcon />}
					onAddNew={(e) => {
						e?.stopPropagation?.()
						requireLogin()
					}}
				/>
			</Flex>
			<OverviewLockedSection
				description="Join a talk room to practice speaking"
				onLogin={requireLogin}
			/>
		</Flex>
	)

	const _renderMyCommunity = () => (
		<Flex vertical className={classes.myCommunityWrapper}>
			<Flex className={classes.title} onClick={requireLogin}>
				<EventTitle
					label="My community"
					number={GUEST_COMMUNITY_COUNT}
					labelCreateBtn="Create community"
					icon={<People />}
					onAddNew={(e) => {
						e?.stopPropagation?.()
						requireLogin()
					}}
				/>
			</Flex>
			<OverviewLockedSection
				description="Find your community"
				onLogin={requireLogin}
			/>
		</Flex>
	)

	const _renderMyEvent = () => (
		<Flex vertical className={classes.myEventWrapper}>
			<Flex className={classes.title} onClick={requireLogin}>
				<EventTitle
					label={mappingEventTitle[mainRoutes.event] || 'My activities'}
					number={GUEST_ACTIVITY_COUNT}
					labelCreateBtn="Create activity"
					icon={<EventIcon />}
					onAddNew={(e) => {
						e?.stopPropagation?.()
						requireLogin()
					}}
				/>
			</Flex>
			<OverviewLockedSection
				description="Discover and join activities near you"
				onLogin={requireLogin}
			/>
		</Flex>
	)

	const _renderUpcomingEvent = () => (
		<Flex className={classes.wrapperUp} vertical>
			<Flex className={classes.title} onClick={requireLogin}>
				<EventTitle
					hiddenAdd
					label={mappingEventTitle[mainRoutes.upcomingEvent]}
					icon={<UpcomingEvent />}
					hiddenNumber
				/>
			</Flex>
			<OverviewLockedSection
				description="Explore upcoming activities in your area"
				onLogin={requireLogin}
			/>
		</Flex>
	)

	return (
		<div className={classes.wrapper}>
			<Flex className={classes.container} vertical>
				{_renderHangout()}
				{_renderChatRoom()}
				{_renderTalkRoom()}
				{_renderMyCommunity()}
				{_renderMyEvent()}
				{_renderUpcomingEvent()}
			</Flex>
		</div>
	)
}

export default memo(PublicOverview)
