'use client'

import { useCallback, useEffect, useMemo, useRef } from 'react'
import { Flex } from 'antd'
import { IconChevronLeft } from '@tabler/icons-react'

import DetailTalkroomListenerPanel from '@/Components/TalkRoom/DetailTalkroom/DetailTalkroomListenerPanel'
import HostMicButton from '@/Components/TalkRoom/DetailTalkroom/DetailTalkroomListenerPanel/HostMicButton'
import DetailTalkroomSpeakerStage from '@/Components/TalkRoom/DetailTalkroom/DetailTalkroomSpeakerStage'
import DetailTalkroomTiming from '@/Components/TalkRoom/DetailTalkroom/DetailTalkroomTiming'
import useDetailTalkroom from '@/hooks/TalkRoom/useDetailTalkroom'
import useHostMicToggle from '@/hooks/TalkRoom/useHostMicToggle'
import useTalkRoomAgora from '@/hooks/TalkRoom/useTalkRoomAgora'
import useTalkRoomWhep from '@/hooks/TalkRoom/useTalkRoomWhep'
import ShareIcon from '@/svg/FriendSvg/ShareIcon'
import { useLocalePath } from '@/ultis/route'
import {
	formatTalkRoomLevelLabel,
	getListenerBeSpeakerState,
	getTalkRoomListenerCount,
	isTalkRoomLive,
} from '@/ultis/talkRoom'

import classes from './DetailTalkroom.module.scss'

function DetailTalkroom({ id }: { id: string }) {
	const onRoomSocketEventRef = useRef<
		((event: string, data?: unknown) => void) | undefined
	>()

	const {
		talkRoomDetail,
		listenersInRoom,
		joinTalkRoomResult,
		totalListenersInRoom,
		loadingListenersInRoom,
		onGetDetailTalkRoom,
		onLeaveRoom,
	} = useDetailTalkroom(id, {
		onRoomSocketEvent: (event, data) =>
			onRoomSocketEventRef.current?.(event, data),
	})
	const { onChangeRoute } = useLocalePath()
	const agoraIntegration = joinTalkRoomResult?.data?.agora
	const isHost =
		talkRoomDetail?.is_your_room === true ||
		(talkRoomDetail as any)?.yourAreHost === true
	const isListener =
		joinTalkRoomResult?.data?.role === 'listener' ||
		agoraIntegration?.connection_type === 'media_server' ||
		agoraIntegration?.user_role === 'listener'
	const streamUrl =
		agoraIntegration?.stream_wss_url ||
		(talkRoomDetail as { stream_wss_url?: string } | null)?.stream_wss_url
	const isRoomLive =
		isTalkRoomLive(talkRoomDetail?.status) ||
		joinTalkRoomResult?.data?.room_info?.status === 'live'

	const { connect, setMic, disconnect, isAgoraJoined } = useTalkRoomAgora({
		agoraIntegration,
		enabled: isHost && !isListener,
	})

	const {
		audioRef: whepAudioRef,
		connect: connectWhep,
		disconnect: disconnectWhep,
		canUseWhep,
	} = useTalkRoomWhep({
		streamWssUrl: streamUrl,
		enabled: isListener,
	})

	const isAgoraJoinedRef = useRef(isAgoraJoined)
	useEffect(() => {
		isAgoraJoinedRef.current = isAgoraJoined
	}, [isAgoraJoined])

	const handleConnectAgora = useCallback(
		() => connect({ micOn: true }),
		[connect],
	)

	const handleReconnectWhep = useCallback(async () => {
		await disconnectWhep()
		await connectWhep()
	}, [connectWhep, disconnectWhep])

	const handleRoomSocketEvent = useCallback(
		(event: string) => {
			if (
				event === 'room_start_countdown' &&
				isHost &&
				!isAgoraJoinedRef.current
			) {
				handleConnectAgora()
			}

			if (event === 'room_start_countdown' && isListener && canUseWhep) {
				handleReconnectWhep()
			}
		},
		[isHost, isListener, canUseWhep, handleConnectAgora, handleReconnectWhep],
	)

	useEffect(() => {
		onRoomSocketEventRef.current = handleRoomSocketEvent
	}, [handleRoomSocketEvent])

	useEffect(() => {
		if (!isListener || !canUseWhep) return
		if (!isRoomLive) return

		connectWhep()

		return () => {
			disconnectWhep()
		}
	}, [
		isListener,
		canUseWhep,
		isRoomLive,
		connectWhep,
		disconnectWhep,
	])

	const handleLeaveRoomWithMedia = useCallback(async () => {
		if (isHost) await disconnect()
		if (isListener) await disconnectWhep()
		await onLeaveRoom()
	}, [disconnect, disconnectWhep, isHost, isListener, onLeaveRoom])

	const { micState, onToggleMic, onInvite, onLeave } = useHostMicToggle({
		roomId: id,
		talkRoomDetail,
		isHost,
		onGetDetailTalkRoom,
		onLeaveRoom: handleLeaveRoomWithMedia,
		onChangeRoute,
		onMicOn: handleConnectAgora,
		onMicOff: () => setMic(false),
	})

	const beSpeakerState = useMemo(
		() =>
			getListenerBeSpeakerState(talkRoomDetail ?? undefined, {
				isListener,
			}),
		[talkRoomDetail, isListener],
	)

	const handleBeSpeaker = useCallback(() => {
		if (beSpeakerState === 'disabled') return
		// TODO: POST /talkroom/{id}/action/raise_hand
	}, [beSpeakerState])

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
					isHost={isHost}
					isListener={isListener}
					listenerCount={listenerCount}
					listeners={listenersInRoom}
					loadingListeners={loadingListenersInRoom}
					micState={micState}
					beSpeakerState={beSpeakerState}
					onToggleMic={onToggleMic}
					onBeSpeaker={handleBeSpeaker}
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
			{isListener ? (
				<audio
					ref={whepAudioRef}
					autoPlay
					playsInline
					style={{ display: 'none' }}
				/>
			) : null}
			<Flex className={classes.header}>
				<IconChevronLeft className={classes.iconBack} onClick={onLeave} />
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
