'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Flex } from 'antd'
import { IconChevronLeft } from '@tabler/icons-react'

import { toogleMic } from '@/apis/talkRoomApis'
import DetailTalkroomListenerPanel from '@/Components/TalkRoom/DetailTalkroom/DetailTalkroomListenerPanel'
import HostMicButton from '@/Components/TalkRoom/DetailTalkroom/DetailTalkroomListenerPanel/HostMicButton'
import DetailTalkroomSpeakerStage from '@/Components/TalkRoom/DetailTalkroom/DetailTalkroomSpeakerStage'
import DetailTalkroomTiming from '@/Components/TalkRoom/DetailTalkroom/DetailTalkroomTiming'
import TalkRoomTransferHostRoleModal from '@/Components/Modal/TalkRoomTransferHostRoleModal'
import useDetailTalkroom from '@/hooks/TalkRoom/useDetailTalkroom'
import useHostMicToggle from '@/hooks/TalkRoom/useHostMicToggle'
import useTalkRoomAgora from '@/hooks/TalkRoom/useTalkRoomAgora'
import useTalkRoomWhep from '@/hooks/TalkRoom/useTalkRoomWhep'
import { TALK_ROOM_ROLE } from '@/Variable/talkRoom.variable'
import ShareIcon from '@/svg/FriendSvg/ShareIcon'
import { useLocalePath } from '@/ultis/route'
import { mainRoutes } from '@/routes/MainRoutes'
import { getUserInfo } from '@/ultis/storage'
import {
	formatTalkRoomLevelLabel,
	getListenerBeSpeakerState,
	getTalkRoomListenerCount,
	getTalkRoomTransferHostSpeakerOptions,
	isCurrentUserGuestSpeaker,
	isTalkRoomLive,
	isTalkRoomSocketEventForCurrentUser,
	resolveRaiseHandSlotId,
} from '@/ultis/talkRoom'

import classes from './DetailTalkroom.module.scss'

const SPEAKER_PROMOTE_EVENTS = [
	'raise_hand_accepted',
	'promote_to_speaker',
	'listener_accept_to_speaker_success',
] as const

function DetailTalkroom({ id }: { id: string }) {
	const onRoomSocketEventRef = useRef<
		((event: string, data?: unknown) => void) | undefined
	>()
	const isPromotingRef = useRef(false)
	const autoPromoteAttemptedRef = useRef(false)
	const [speakerMicOptimisticOn, setSpeakerMicOptimisticOn] = useState(false)
	const [transferHostModalOpen, setTransferHostModalOpen] = useState(false)
	const [leavingRoom, setLeavingRoom] = useState(false)
	const currentUserId = getUserInfo('id') as string | undefined

	const {
		talkRoomDetail,
		listenersInRoom,
		joinTalkRoomResult,
		roomUserRole,
		roleIntegration,
		totalListenersInRoom,
		loadingListenersInRoom,
		onGetDetailTalkRoom,
		onLeaveRoom,
		onPostRaiseHand,
		onTransitionToSpeaker,
	} = useDetailTalkroom(id, {
		onRoomSocketEvent: (event, data) =>
			onRoomSocketEventRef.current?.(event, data),
	})
	const { onChangeRoute } = useLocalePath()
	const agoraIntegration =
		roleIntegration ?? joinTalkRoomResult?.data?.agora ?? null
	const isHost =
		talkRoomDetail?.is_your_room === true ||
		(talkRoomDetail as any)?.yourAreHost === true
	const hasSpeakerRole =
		roomUserRole === TALK_ROOM_ROLE.SPEAKER ||
		joinTalkRoomResult?.data?.role === TALK_ROOM_ROLE.SPEAKER
	const isGuestSpeakerOnStage = useMemo(
		() => isCurrentUserGuestSpeaker(talkRoomDetail ?? undefined, currentUserId),
		[talkRoomDetail, currentUserId],
	)
	const isSpeaker = hasSpeakerRole || isGuestSpeakerOnStage
	const isListener =
		!isSpeaker &&
		(roomUserRole === TALK_ROOM_ROLE.LISTENER ||
			joinTalkRoomResult?.data?.role === TALK_ROOM_ROLE.LISTENER ||
			agoraIntegration?.connection_type === 'media_server' ||
			agoraIntegration?.user_role === 'listener')
	const streamUrl =
		agoraIntegration?.stream_wss_url ||
		(talkRoomDetail as { stream_wss_url?: string } | null)?.stream_wss_url
	const isRoomLive =
		isTalkRoomLive(talkRoomDetail?.status) ||
		joinTalkRoomResult?.data?.room_info?.status === 'live'

	const { connect, setMic, disconnect, isAgoraJoined } = useTalkRoomAgora({
		agoraIntegration,
		enabled: isHost || isSpeaker || isListener,
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

	const handlePromoteToSpeaker = useCallback(async () => {
		if (isPromotingRef.current || isHost) return
		if (hasSpeakerRole && isAgoraJoinedRef.current) return

		isPromotingRef.current = true

		try {
			await disconnectWhep()

			const result = await onTransitionToSpeaker()
			const newConnection = result?.newConnection

			if (!newConnection) return

			await connect({ micOn: true, integration: newConnection })

			await toogleMic({
				id,
				payload: { is_on: true },
			})

			setSpeakerMicOptimisticOn(true)
			await onGetDetailTalkRoom(id)
		} catch (error) {
			console.error('Failed to promote to speaker', error)
		} finally {
			isPromotingRef.current = false
		}
	}, [
		disconnectWhep,
		onTransitionToSpeaker,
		connect,
		id,
		onGetDetailTalkRoom,
		hasSpeakerRole,
		isHost,
	])

	const handleRoomSocketEvent = useCallback(
		(event: string, data?: unknown) => {
			if (SPEAKER_PROMOTE_EVENTS.includes(event as (typeof SPEAKER_PROMOTE_EVENTS)[number])) {
				if (!isTalkRoomSocketEventForCurrentUser(data, currentUserId)) return

				handlePromoteToSpeaker()
				return
			}

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
		[
			currentUserId,
			handlePromoteToSpeaker,
			isHost,
			isListener,
			canUseWhep,
			handleConnectAgora,
			handleReconnectWhep,
		],
	)

	useEffect(() => {
		onRoomSocketEventRef.current = handleRoomSocketEvent
	}, [handleRoomSocketEvent])

	useEffect(() => {
		if (!isGuestSpeakerOnStage) {
			autoPromoteAttemptedRef.current = false
			return
		}

		if (isHost || (hasSpeakerRole && isAgoraJoined)) return
		if (autoPromoteAttemptedRef.current || isPromotingRef.current) return

		autoPromoteAttemptedRef.current = true
		handlePromoteToSpeaker()
	}, [
		isHost,
		isGuestSpeakerOnStage,
		hasSpeakerRole,
		isAgoraJoined,
		handlePromoteToSpeaker,
	])

	useEffect(() => {
		if (!isSpeaker || !currentUserId) return

		const mySpeaker = talkRoomDetail?.speakers?.find(
			(speaker) =>
				speaker?.id === currentUserId ||
				(speaker as { user_id?: string })?.user_id === currentUserId,
		)

		if (mySpeaker?.is_open_mic === true) {
			setSpeakerMicOptimisticOn(false)
		}
	}, [talkRoomDetail, isSpeaker, currentUserId])

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
		if (isHost || isSpeaker) await disconnect()
		if (isListener) await disconnectWhep()
		await onLeaveRoom()
	}, [disconnect, disconnectWhep, isHost, isSpeaker, isListener, onLeaveRoom])

	const handleConfirmLeaveRoom = useCallback(async () => {
		setLeavingRoom(true)
		try {
			await handleLeaveRoomWithMedia()
			setTransferHostModalOpen(false)
			onChangeRoute(mainRoutes.talkroom)
		} finally {
			setLeavingRoom(false)
		}
	}, [handleLeaveRoomWithMedia, onChangeRoute])

	const handleHostLeaveClick = useCallback(() => {
		if (!isHost) return
		setTransferHostModalOpen(true)
	}, [isHost])

	const transferHostSpeakerOptions = useMemo(
		() => getTalkRoomTransferHostSpeakerOptions(talkRoomDetail ?? undefined),
		[talkRoomDetail],
	)

	const handleAssignSpeakerAndLeave = useCallback(
		async (_slotId: 1 | 2) => {
			// TODO: call stopHosting / transfer host API with slotId
			await handleConfirmLeaveRoom()
		},
		[handleConfirmLeaveRoom],
	)

	const { micState, onToggleMic, onInvite, onLeave } = useHostMicToggle({
		roomId: id,
		talkRoomDetail,
		isHost,
		isSpeaker,
		userId: currentUserId,
		speakerMicOptimisticOn,
		onGetDetailTalkRoom,
		onLeaveRoom: handleLeaveRoomWithMedia,
		onChangeRoute,
		onLeaveClick: isHost ? handleHostLeaveClick : undefined,
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

	const handleBeSpeaker = useCallback(async () => {
		if (beSpeakerState === 'disabled') return

		const slotId = resolveRaiseHandSlotId(talkRoomDetail ?? undefined, 1)

		await onPostRaiseHand({
			isRaiseHand: true,
			slotId,
		})
	}, [beSpeakerState, talkRoomDetail, onPostRaiseHand])

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
						{isHost || isSpeaker ? (
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
					isSpeaker={isSpeaker}
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
			<TalkRoomTransferHostRoleModal
				open={transferHostModalOpen}
				loading={leavingRoom}
				speakerOptions={transferHostSpeakerOptions}
				onClose={() => setTransferHostModalOpen(false)}
				onAssignSpeaker={handleAssignSpeakerAndLeave}
				onSkipAssigning={handleConfirmLeaveRoom}
			/>
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
