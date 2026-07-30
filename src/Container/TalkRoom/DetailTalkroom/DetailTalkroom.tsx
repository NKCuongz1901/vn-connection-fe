'use client'

import { Flex } from 'antd'
import { IconChevronLeft } from '@tabler/icons-react'

import DetailTalkroomListenerPanel from '@/Components/TalkRoom/DetailTalkroom/DetailTalkroomListenerPanel'
import HostMicButton from '@/Components/TalkRoom/DetailTalkroom/DetailTalkroomListenerPanel/HostMicButton'
import DetailTalkroomSpeakerStage from '@/Components/TalkRoom/DetailTalkroom/DetailTalkroomSpeakerStage'
import DetailTalkroomTiming from '@/Components/TalkRoom/DetailTalkroom/DetailTalkroomTiming'
import useDetailTalkroom from '@/hooks/TalkRoom/useDetailTalkroom'
import useHostMicToggle from '@/hooks/TalkRoom/useHostMicToggle'
import { mainRoutes } from '@/routes/MainRoutes'
import ShareIcon from '@/svg/FriendSvg/ShareIcon'
import { useLocalePath } from '@/ultis/route'
import {
	formatTalkRoomLevelLabel,
	getTalkRoomListenerCount,
} from '@/ultis/talkRoom'

import classes from './DetailTalkroom.module.scss'
import useTalkRoomAgora from '@/hooks/TalkRoom/useTalkRoomAgora'

function DetailTalkroom({ id }: { id: string }) {
	const {
		talkRoomDetail,
		listenersInRoom,
		joinTalkRoomResult,
		totalListenersInRoom,
		loadingListenersInRoom,
		onGetDetailTalkRoom,
		onLeaveRoom,
	} = useDetailTalkroom(id)
	const { onChangeRoute } = useLocalePath()
	const agoraIntegration = joinTalkRoomResult?.data?.agora
	const isHost =
		talkRoomDetail?.is_your_room === true ||
		(talkRoomDetail as any)?.yourAreHost === true
	const { connect, setMic, disconnect, isAgoraJoined } = useTalkRoomAgora({
		agoraIntegration,
		enabled: isHost,
	})

	const { micState, onToggleMic, onInvite, onLeave } = useHostMicToggle({
		roomId: id,
		talkRoomDetail,
		isHost,
		onGetDetailTalkRoom,
		onLeaveRoom,
		onChangeRoute,
	})

	const listenerCount =
		totalListenersInRoom > 0
			? totalListenersInRoom
			: getTalkRoomListenerCount(talkRoomDetail ?? undefined)

	const _renderHostContent = () => {
		return (
			<div className={classes.hostContent}>
				<div className={classes.talkroomInfoContainer}>
					<div className={classes.talkroomInfo}>
						<div className={classes.talkroomMetaData}>
							<div className={classes.textNormal}>
								{talkRoomDetail?.language?.name} |{' '}
								{(talkRoomDetail?.level || [])
									.map(formatTalkRoomLevelLabel)
									.join(', ')}
							</div>
						</div>
						<div className={classes.talkroomTitle}>{talkRoomDetail?.name}</div>
					</div>
					<div className={classes.ctaButtons}>
						{isHost ? (
							<HostMicButton state={micState} size="sm" onClick={onToggleMic} />
						) : null}
						<div className={classes.ctaButtonWrapper}>
							<ShareIcon />
						</div>
					</div>
				</div>
				<DetailTalkroomSpeakerStage talkRoomDetail={talkRoomDetail} />
			</div>
		)
	}

	const _renderListenerContent = () => {
		return (
			<div className={classes.listenerContent}>
				<DetailTalkroomListenerPanel
					listenerCount={listenerCount}
					listeners={listenersInRoom}
					loadingListeners={loadingListenersInRoom}
					micState={micState}
					onToggleMic={onToggleMic}
					onLeaveRoom={onLeave}
					onInvite={onInvite}
				/>
			</div>
		)
	}

	const _renderTimerContent = () => {
		return (
			<div className={classes.timerContent}>
				<DetailTalkroomTiming talkRoomDetail={talkRoomDetail} />
			</div>
		)
	}

	const _renderChatContent = () => {
		return <div className={classes.chatContent}></div>
	}

	return (
		<div className={classes.wrapper}>
			<Flex className={classes.header}>
				<IconChevronLeft
					className={classes.iconBack}
					onClick={() => onChangeRoute(mainRoutes.talkroom)}
				/>
				<div className={classes.title}>Live room</div>
			</Flex>
			<Flex className={classes.content}>
				<div className={classes.leftContent}>
					{_renderHostContent()}
					{_renderListenerContent()}
				</div>
				<div className={classes.rightContent}>
					{_renderTimerContent()}
					{_renderChatContent()}
				</div>
			</Flex>
		</div>
	)
}

export default DetailTalkroom
