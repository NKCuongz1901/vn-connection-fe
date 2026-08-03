'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Flex } from 'antd'
import { IconChevronLeft } from '@tabler/icons-react'

import { toogleMic } from '@/apis/talkRoomApis'
import DetailTalkroomListenerPanel from '@/Components/TalkRoom/DetailTalkroom/DetailTalkroomListenerPanel'
import DetailTalkroomSpeakerStage from '@/Components/TalkRoom/DetailTalkroom/DetailTalkroomSpeakerStage'
import TalkRoomHeaderActionButton from '@/Components/TalkRoom/DetailTalkroom/TalkRoomHeaderActionButton'
import DetailTalkroomTiming from '@/Components/TalkRoom/DetailTalkroom/DetailTalkroomTiming'
import DetailTalkroomChatPanel from '@/Components/TalkRoom/DetailTalkroom/DetailTalkroomChatPanel'
import TalkRoomListenerLeaveRoom from '@/Components/Modal/TalkRoomListenerLeaveRoom'
import TalkRoomSessionEndModal from '@/Components/Modal/TalkRoomSessionEndModal'
import TalkRoomTimeUpModal from '@/Components/Modal/TalkRoomTimeUpModal'
import TalkRoomTransferHostRoleModal from '@/Components/Modal/TalkRoomTransferHostRoleModal'
import { showTalkRoomSpeakerPromoteToast } from '@/Components/Toast/SocketToastContent'
import useDetailTalkroom from '@/hooks/TalkRoom/useDetailTalkroom'
import useHostMicToggle from '@/hooks/TalkRoom/useHostMicToggle'
import useTalkRoomAgora from '@/hooks/TalkRoom/useTalkRoomAgora'
import useTalkRoomLocalTalking from '@/hooks/TalkRoom/useTalkRoomLocalTalking'
import useTalkRoomWhep from '@/hooks/TalkRoom/useTalkRoomWhep'
import { TALK_ROOM_ROLE } from '@/Variable/talkRoom.variable'
import ShareIcon from '@/svg/FriendSvg/ShareIcon'
import VolumeHighIcon from '@/svg/Talkroom/VolumeHighIcon'
import VolumeMuteIcon from '@/svg/Talkroom/VolumeMuteIcon'
import { useLocalePath } from '@/ultis/route'
import { mainRoutes } from '@/routes/MainRoutes'
import { getUserInfo } from '@/ultis/storage'
import {
	formatTalkRoomLevelLabel,
	ForceRoomCloseOptions,
	getListenerBeSpeakerState,
	getTalkRoomConversationId,
	getTalkRoomListenerCount,
	getTalkRoomSessionEndSecondsLeft,
	getTalkRoomTransferHostSpeakerOptions,
	isCurrentUserGuestSpeaker,
	isTalkRoomLive,
	isTalkRoomSocketEventForCurrentUser,
	parseTalkRoomSocketRoomTimeUp,
	resolveRaiseHandSlotId,
	RoomEndStatus,
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
	const onRoomTimeUpRef = useRef<((data?: unknown) => void) | undefined>()
	const sessionEndTriggeredRef = useRef(false)
	const timeUpTriggeredRef = useRef(false)
	const isPromotingRef = useRef(false)
	const autoPromoteAttemptedRef = useRef(false)
	const lastEmittedTalkingRef = useRef<boolean | null>(null)
	const [speakerMicOptimisticOn, setSpeakerMicOptimisticOn] = useState(false)
	const [isMuteRoom, setIsMuteRoom] = useState(false)
	const [transferHostModalOpen, setTransferHostModalOpen] = useState(false)
	const [listenerLeaveModalOpen, setListenerLeaveModalOpen] = useState(false)
	const [sessionEndModalOpen, setSessionEndModalOpen] = useState(false)
	const [timeUpModalOpen, setTimeUpModalOpen] = useState(false)
	const [roomEndStatus, setRoomEndStatus] = useState<RoomEndStatus>('none')
	const [isRoomLiving, setIsRoomLiving] = useState(true)
	const [sessionEndStartedAtMs, setSessionEndStartedAtMs] = useState<
		number | null
	>(null)
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
		speakerStatusMap,
		onUpdateSpeakerLiveStatus,
		emitRoomEvent,
	} = useDetailTalkroom(id, {
		onRoomSocketEvent: (event, data) =>
			onRoomSocketEventRef.current?.(event, data),
		onRoomTimeUp: (data) => onRoomTimeUpRef.current?.(data),
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

	const conversationId = useMemo(
		() => getTalkRoomConversationId(talkRoomDetail ?? undefined),
		[talkRoomDetail],
	)

	const showVolumeButton = isListener && isRoomLive && isRoomLiving

	const { connect, setMic, disconnect, isAgoraJoined, micEnabled } = useTalkRoomAgora({
		agoraIntegration,
		enabled: isHost || isSpeaker || isListener,
	})

	const isLocalTalking = useTalkRoomLocalTalking({
		enabled: (isHost || isSpeaker) && isAgoraJoined,
		micEnabled,
		agoraUid: agoraIntegration?.agora_uid,
	})

	const {
		audioRef: whepAudioRef,
		connect: connectWhep,
		disconnect: disconnectWhep,
		canUseWhep,
		isConnected: isWhepConnected,
	} = useTalkRoomWhep({
		streamWssUrl: streamUrl,
		enabled: isListener,
	})

	const handleToggleRoomVolume = useCallback(() => {
		if (!showVolumeButton) return

		setIsMuteRoom((prev) => !prev)
	}, [showVolumeButton])

	useEffect(() => {
		if (!isListener) return

		const audio = whepAudioRef.current
		if (!audio) return

		const stream = audio.srcObject
		if (stream instanceof MediaStream) {
			stream.getAudioTracks().forEach((track) => {
				track.enabled = !isMuteRoom
			})
		}
	}, [isListener, isMuteRoom, whepAudioRef, isWhepConnected])

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
			if (currentUserId) {
				onUpdateSpeakerLiveStatus(currentUserId, {
					is_open_mic: true,
					is_talking: false,
				})
			}
			await onGetDetailTalkRoom(id)
			showTalkRoomSpeakerPromoteToast()
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
		currentUserId,
		onUpdateSpeakerLiveStatus,
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
				(isHost || isSpeaker) &&
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
			isSpeaker,
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
		if (!currentUserId || !(isHost || isSpeaker) || !isRoomLiving) return

		if (!micEnabled) {
			onUpdateSpeakerLiveStatus(currentUserId, { is_talking: false })
			lastEmittedTalkingRef.current = false
			return
		}

		onUpdateSpeakerLiveStatus(currentUserId, { is_talking: isLocalTalking })

		if (lastEmittedTalkingRef.current === isLocalTalking) return

		lastEmittedTalkingRef.current = isLocalTalking
		emitRoomEvent(currentUserId, 'on_talking', {
			is_talking: isLocalTalking,
		})
	}, [
		currentUserId,
		isHost,
		isSpeaker,
		isRoomLiving,
		micEnabled,
		isLocalTalking,
		emitRoomEvent,
		onUpdateSpeakerLiveStatus,
	])

	useEffect(() => {
		if (!isListener || !canUseWhep) return
		if (!isRoomLive || !isRoomLiving) return

		connectWhep()

		return () => {
			disconnectWhep()
		}
	}, [
		isListener,
		canUseWhep,
		isRoomLive,
		isRoomLiving,
		connectWhep,
		disconnectWhep,
	])

	const handleLeaveRoomWithMedia = useCallback(async () => {
		if (isHost || isSpeaker) await disconnect()
		if (isListener) await disconnectWhep()
		await onLeaveRoom()
	}, [disconnect, disconnectWhep, isHost, isSpeaker, isListener, onLeaveRoom])

	const forceRoomClose = useCallback(
		async ({ roomEndStatus: nextStatus, callLeaveRoom }: ForceRoomCloseOptions) => {
			if (nextStatus === 'sessionEnd' && sessionEndTriggeredRef.current) {
				return
			}

			if (nextStatus === 'sessionEnd') {
				sessionEndTriggeredRef.current = true
			}

			if (isHost || isSpeaker) await disconnect()
			if (isListener) await disconnectWhep()

			setRoomEndStatus(nextStatus)
			setIsRoomLiving(false)

			if (callLeaveRoom) {
				await onLeaveRoom()
				onChangeRoute(mainRoutes.talkroom)
				return
			}

			if (nextStatus === 'sessionEnd') {
				setSessionEndStartedAtMs(Date.now())
				setSessionEndModalOpen(true)
			}
		},
		[
			disconnect,
			disconnectWhep,
			isHost,
			isSpeaker,
			isListener,
			onLeaveRoom,
			onChangeRoute,
		],
	)

	const handleRoomTimeUp = useCallback(
		(data?: unknown) => {
			const parsed = parseTalkRoomSocketRoomTimeUp(data)
			if (!parsed) return

			if (parsed.reason === 'INACTIVITY_TIMEOUT') {
				forceRoomClose({
					roomEndStatus: 'notActive',
					callLeaveRoom: true,
				})
				return
			}

			forceRoomClose({
				roomEndStatus: 'sessionEnd',
				callLeaveRoom: false,
			})
		},
		[forceRoomClose],
	)

	const handleLiveTimeUp = useCallback(() => {
		forceRoomClose({
			roomEndStatus: 'sessionEnd',
			callLeaveRoom: false,
		})
	}, [forceRoomClose])

	const handleSessionEndTimeUp = useCallback(() => {
		if (timeUpTriggeredRef.current) return

		timeUpTriggeredRef.current = true
		setRoomEndStatus('timeUp')
		setTimeUpModalOpen(true)
	}, [])

	useEffect(() => {
		if (roomEndStatus !== 'sessionEnd' || !sessionEndStartedAtMs) return

		const secondsLeft = getTalkRoomSessionEndSecondsLeft(sessionEndStartedAtMs)
		if (secondsLeft <= 0) {
			handleSessionEndTimeUp()
			return
		}

		const timeoutId = window.setTimeout(
			handleSessionEndTimeUp,
			secondsLeft * 1000,
		)

		return () => window.clearTimeout(timeoutId)
	}, [roomEndStatus, sessionEndStartedAtMs, handleSessionEndTimeUp])

	const handleForceLeaveRoom = useCallback(async () => {
		setLeavingRoom(true)
		try {
			await handleLeaveRoomWithMedia()
			setTimeUpModalOpen(false)
			onChangeRoute(mainRoutes.talkroom)
		} finally {
			setLeavingRoom(false)
		}
	}, [handleLeaveRoomWithMedia, onChangeRoute])

	useEffect(() => {
		onRoomTimeUpRef.current = handleRoomTimeUp
	}, [handleRoomTimeUp])

	const handleConfirmLeaveRoom = useCallback(async () => {
		setLeavingRoom(true)
		try {
			await handleLeaveRoomWithMedia()
			setTransferHostModalOpen(false)
			setListenerLeaveModalOpen(false)
			onChangeRoute(mainRoutes.talkroom)
		} finally {
			setLeavingRoom(false)
		}
	}, [handleLeaveRoomWithMedia, onChangeRoute])

	const handleHostLeaveClick = useCallback(() => {
		if (!isHost) return
		setTransferHostModalOpen(true)
	}, [isHost])

	const handleListenerLeaveClick = useCallback(() => {
		if (!isListener || isHost || isSpeaker) return
		setListenerLeaveModalOpen(true)
	}, [isListener, isHost, isSpeaker])

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
		onLeaveClick: isHost
			? handleHostLeaveClick
			: isListener && !isSpeaker
				? handleListenerLeaveClick
				: undefined,
		onMicOn: () => {
			handleConnectAgora()
			if (currentUserId) {
				onUpdateSpeakerLiveStatus(currentUserId, {
					is_open_mic: true,
					is_talking: false,
				})
			}
		},
		onMicOff: () => {
			setMic(false)
			if (currentUserId) {
				onUpdateSpeakerLiveStatus(currentUserId, {
					is_open_mic: false,
					is_talking: false,
				})
			}
		},
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
						{showVolumeButton ? (
							<TalkRoomHeaderActionButton
								ariaLabel={
									isMuteRoom ? 'Unmute room audio' : 'Mute room audio'
								}
								onClick={handleToggleRoomVolume}
							>
								{isMuteRoom ? (
									<VolumeMuteIcon width={20} height={20} />
								) : (
									<VolumeHighIcon width={20} height={20} />
								)}
							</TalkRoomHeaderActionButton>
						) : null}
						<TalkRoomHeaderActionButton ariaLabel="Share room" onClick={onInvite}>
							<ShareIcon fill="#FFFFFF" />
						</TalkRoomHeaderActionButton>
					</div>
				</div>
				<DetailTalkroomSpeakerStage
					talkRoomDetail={talkRoomDetail}
					speakerStatusMap={speakerStatusMap}
				/>
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
					isRoomLiving={isRoomLiving}
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
				<DetailTalkroomTiming
					talkRoomDetail={talkRoomDetail}
					roomEndStatus={roomEndStatus}
					sessionEndStartedAtMs={sessionEndStartedAtMs}
					onLiveTimeUp={handleLiveTimeUp}
					onSessionEndTimeUp={handleSessionEndTimeUp}
				/>
			</div>
		)
	}

	const _renderChatContent = () => {
		if (!conversationId) {
			return (
				<div className={classes.chatContent}>
					<div className={classes.chatEmpty}>Chat is not available for this room.</div>
				</div>
			)
		}

		return (
			<div className={classes.chatContent}>
				<DetailTalkroomChatPanel convId={conversationId} />
			</div>
		)
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
			<TalkRoomListenerLeaveRoom
				open={listenerLeaveModalOpen}
				loading={leavingRoom}
				onClose={() => setListenerLeaveModalOpen(false)}
				onLeave={handleConfirmLeaveRoom}
			/>
			<TalkRoomSessionEndModal
				open={sessionEndModalOpen}
				onClose={() => setSessionEndModalOpen(false)}
			/>
			<TalkRoomTimeUpModal
				open={timeUpModalOpen}
				loading={leavingRoom}
				onConfirm={handleForceLeaveRoom}
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
