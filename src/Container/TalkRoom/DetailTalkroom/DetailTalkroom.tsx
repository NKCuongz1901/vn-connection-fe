'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Flex } from 'antd'
import { IconChevronLeft } from '@tabler/icons-react'

import { stopHosting, toogleMic } from '@/apis/talkRoomApis'
import DetailTalkroomListenerPanel from '@/Components/TalkRoom/DetailTalkroom/DetailTalkroomListenerPanel'
import DetailTalkroomSpeakerStage from '@/Components/TalkRoom/DetailTalkroom/DetailTalkroomSpeakerStage'
import TalkRoomParticipantProfileModal from '@/Components/Modal/TalkRoomParticipantProfileModal'
import type { TalkRoomParticipantProfileRole } from '@/Components/Modal/TalkRoomParticipantProfileModal'
import TalkRoomConnectedCountryModal from '@/Components/Modal/TalkRoomConnectedCountryModal'
import TalkRoomConnectedUserModal from '@/Components/Modal/TalkRoomConnectedUserModal'
import TalkRoomHeaderActionButton from '@/Components/TalkRoom/DetailTalkroom/TalkRoomHeaderActionButton'
import DetailTalkroomTiming from '@/Components/TalkRoom/DetailTalkroom/DetailTalkroomTiming'
import DetailTalkroomChatPanel from '@/Components/TalkRoom/DetailTalkroom/DetailTalkroomChatPanel'
import TalkRoomForceClosedModal from '@/Components/Modal/TalkRoomForceClosedModal'
import TalkRoomListenerLeaveRoom from '@/Components/Modal/TalkRoomListenerLeaveRoom'
import TalkRoomSessionEndModal from '@/Components/Modal/TalkRoomSessionEndModal'
import TalkRoomTimeUpModal from '@/Components/Modal/TalkRoomTimeUpModal'
import TalkRoomSpeakerInvitationModal from '@/Components/Modal/TalkRoomSpeakerInvitationModal'
import TalkRoomTransferHostRoleModal from '@/Components/Modal/TalkRoomTransferHostRoleModal'
import {
	showTalkRoomAutoCloseToast,
	showTalkRoomListenerRejectInviteToast,
	showTalkRoomSpeakerPromoteToast,
	showTalkRoomUserKickedToast,
} from '@/Components/Toast/SocketToastContent'
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
import { playTalkRoomSound } from '@/ultis/talkRoomSound'
import {
	excludeTalkRoomStageUsersFromListeners,
	formatTalkRoomLevelLabel,
	ForceRoomCloseOptions,
	getListenerBeSpeakerState,
	getTalkRoomConversationId,
	getTalkRoomListenerCount,
	getTalkRoomSessionEndSecondsLeft,
	getTalkRoomTransferHostSpeakerOptions,
	hasTalkRoomAnotherSpeaker,
	hasTalkRoomEmptyGuestSpeakerSlot,
	getTalkRoomFilterRaiseHandIds,
	getTalkRoomTotalRaiseHand,
	isCurrentUserGuestSpeaker,
	isCurrentUserTalkRoomHost,
	isCurrentUserTalkRoomListener,
	isTalkRoomCountSessionEndVisible,
	isTalkRoomLive,
	isTalkRoomSocketEventForCurrentUser,
	parseTalkRoomSocketRoomTimeUp,
	resolveRaiseHandSlotId,
	sortTalkRoomListenersByRaiseHand,
	RoomEndStatus,
} from '@/ultis/talkRoom'

import classes from './DetailTalkroom.module.scss'

const SPEAKER_PROMOTE_MIC_ON_EVENTS = [
	'raise_hand_accepted',
	'promote_to_speaker',
] as const

const SPEAKER_PROMOTE_MIC_OFF_EVENTS = [
	'listener_accept_to_speaker_success',
] as const

type TransferHostModalMode = 'leave' | 'stopHosting'

function DetailTalkroom({ id }: { id: string }) {
	const onRoomSocketEventRef = useRef<
		((event: string, data?: unknown) => void) | undefined
	>()
	const onRoomTimeUpRef = useRef<((data?: unknown) => void) | undefined>()
	const onRoomForceClosedRef = useRef<(() => void) | undefined>()
	const onHostTransferredRef = useRef<
		| ((payload: {
				previousUserId?: string
				newHostId?: string
		  }) => void | Promise<void>)
		| undefined
	>()
	const onRoomUserKickedRef = useRef<
		((kickedUserId: string) => void | Promise<void>) | undefined
	>()
	const onRoomSpeakerSteppedDownRef = useRef<
		((targetUserId: string) => void | Promise<void>) | undefined
	>()
	const onListenerRejectInviteRef = useRef<
		| ((payload: { targetUserId?: string; userName?: string }) => void)
		| undefined
	>()
	const sessionEndTriggeredRef = useRef(false)
	const timeUpTriggeredRef = useRef(false)
	const forceCloseTriggeredRef = useRef(false)
	const kickedTriggeredRef = useRef(false)
	const isPromotingRef = useRef(false)
	const autoPromoteAttemptedRef = useRef(false)
	const lastEmittedTalkingRef = useRef<boolean | null>(null)
	const [speakerMicOptimisticOn, setSpeakerMicOptimisticOn] = useState(false)
	const [isMuteRoom, setIsMuteRoom] = useState(false)
	const [transferHostModalOpen, setTransferHostModalOpen] = useState(false)
	const [transferHostModalMode, setTransferHostModalMode] =
		useState<TransferHostModalMode>('leave')
	const [transferHostActionLoading, setTransferHostActionLoading] =
		useState(false)
	const [listenerLeaveModalOpen, setListenerLeaveModalOpen] = useState(false)
	const [sessionEndModalOpen, setSessionEndModalOpen] = useState(false)
	const [timeUpModalOpen, setTimeUpModalOpen] = useState(false)
	const [forceClosedModalOpen, setForceClosedModalOpen] = useState(false)
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
		onGetListenerInRoom,
		onLeaveRoom,
		onPostRaiseHand,
		onTransitionToSpeaker,
		onTransitionRole,
		speakerStatusMap,
		onUpdateSpeakerLiveStatus,
		emitRoomEvent,
		participantProfileModal,
		participantUserProfile,
		participantTalkRoomStats,
		loadingParticipantProfile,
		participantActionLoading,
		participantReportOpen,
		participantConnectedModal,
		participantConnectedUsers,
		participantConnectedCountries,
		totalParticipantConnectedUsers,
		loadingParticipantConnectedPeople,
		loadingParticipantConnectedCountries,
		onOpenParticipantProfile,
		onCloseParticipantProfile,
		onParticipantProfileAction,
		onCloseParticipantReport,
		onOpenParticipantConnectedPeople,
		onLoadMoreParticipantConnectedPeople,
		onOpenParticipantConnectedCountries,
		onCloseParticipantConnectedModal,
		speakerInvitationOpen,
		speakerInvitationLoading,
		onAcceptSpeakerInvitation,
		onRejectSpeakerInvitation,
		raiseHandUserIds,
		slotUserRaiseHand,
		isFilterRaiseHand,
		filterRaiseHandSlot,
		onApproveRaiseHand,
		onSwitchToFilterRaiseHand,
		onCloseFilterRaiseHand,
	} = useDetailTalkroom(id, {
		onRoomSocketEvent: (event, data) =>
			onRoomSocketEventRef.current?.(event, data),
		onRoomTimeUp: (data) => onRoomTimeUpRef.current?.(data),
		onRoomForceClosed: () => onRoomForceClosedRef.current?.(),
		onStopHosting: () => {
			setTransferHostModalMode('stopHosting')
			setTransferHostModalOpen(true)
		},
		onHostTransferred: (payload) => onHostTransferredRef.current?.(payload),
		onRoomUserKicked: (kickedUserId) =>
			onRoomUserKickedRef.current?.(kickedUserId),
		onRoomSpeakerSteppedDown: (targetUserId) =>
			onRoomSpeakerSteppedDownRef.current?.(targetUserId),
		onListenerRejectInvite: (payload) =>
			onListenerRejectInviteRef.current?.(payload),
	})
	const { onChangeRoute } = useLocalePath()
	const agoraIntegration =
		roleIntegration ?? joinTalkRoomResult?.data?.agora ?? null
	const isHost = useMemo(
		() => isCurrentUserTalkRoomHost(talkRoomDetail ?? undefined, currentUserId),
		[talkRoomDetail, currentUserId],
	)
	const hasSpeakerRole =
		!isCurrentUserTalkRoomListener(talkRoomDetail ?? undefined) &&
		(roomUserRole === TALK_ROOM_ROLE.SPEAKER ||
			joinTalkRoomResult?.data?.role === TALK_ROOM_ROLE.SPEAKER ||
			talkRoomDetail?.isUserSpeaker === true)
	const isGuestSpeakerOnStage = useMemo(
		() => isCurrentUserGuestSpeaker(talkRoomDetail ?? undefined, currentUserId),
		[talkRoomDetail, currentUserId],
	)
	const isSpeaker = hasSpeakerRole || isGuestSpeakerOnStage
	const isListener =
		!isSpeaker &&
		(roomUserRole === TALK_ROOM_ROLE.LISTENER ||
			joinTalkRoomResult?.data?.role === TALK_ROOM_ROLE.LISTENER ||
			isCurrentUserTalkRoomListener(talkRoomDetail ?? undefined) ||
			agoraIntegration?.connection_type === 'media_server' ||
			agoraIntegration?.user_role === 'listener')
	const streamUrl =
		talkRoomDetail?.stream_wss_url_https ??
		agoraIntegration?.stream_wss_url_https
	const isRoomLive =
		isTalkRoomLive(talkRoomDetail?.status) ||
		joinTalkRoomResult?.data?.room_info?.status === 'live'

	const conversationId = useMemo(
		() => getTalkRoomConversationId(talkRoomDetail ?? undefined),
		[talkRoomDetail],
	)

	const showVolumeButton = isListener && isRoomLive && isRoomLiving

	const { connect, setMic, disconnect, isAgoraJoined, micEnabled } =
		useTalkRoomAgora({
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

	/** Broadcasts own mic state so other clients can sync the mic icon. */
	const handleEmitMicState = useCallback(
		(isOn: boolean) => {
			if (!currentUserId) return

			emitRoomEvent(
				currentUserId,
				isOn ? 'speaker_on_mic' : 'speaker_off_mic',
				{ is_on: isOn },
			)
		},
		[currentUserId, emitRoomEvent],
	)

	const handleReconnectWhep = useCallback(async () => {
		await disconnectWhep()
		await connectWhep()
	}, [connectWhep, disconnectWhep])

	const handlePromoteToSpeaker = useCallback(
		async (options?: { autoOnMic?: boolean }) => {
			const autoOnMic = options?.autoOnMic ?? true
			if (isPromotingRef.current || isHost) return
			if (hasSpeakerRole && isAgoraJoinedRef.current) return

			isPromotingRef.current = true

			try {
				await disconnectWhep()

				const result = await onTransitionToSpeaker()
				const newConnection = result?.newConnection

				if (!newConnection) return

				await connect({ micOn: autoOnMic, integration: newConnection })

				if (autoOnMic) {
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
					handleEmitMicState(true)
					showTalkRoomSpeakerPromoteToast()
				} else {
					setSpeakerMicOptimisticOn(false)
					if (currentUserId) {
						onUpdateSpeakerLiveStatus(currentUserId, {
							is_open_mic: false,
							is_talking: false,
						})
					}
					handleEmitMicState(false)
				}

				await Promise.all([onGetDetailTalkRoom(id), onGetListenerInRoom(id)])
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
		onGetListenerInRoom,
		hasSpeakerRole,
		isHost,
		currentUserId,
		onUpdateSpeakerLiveStatus,
	])

	const handleRoomSocketEvent = useCallback(
		(event: string, data?: unknown) => {
			if (!isTalkRoomSocketEventForCurrentUser(data, currentUserId)) {
				// Non-self promote events are handled via detail refetch in the hook.
			} else if (
				SPEAKER_PROMOTE_MIC_ON_EVENTS.includes(
					event as (typeof SPEAKER_PROMOTE_MIC_ON_EVENTS)[number],
				)
			) {
				handlePromoteToSpeaker({ autoOnMic: true })
				return
			} else if (
				SPEAKER_PROMOTE_MIC_OFF_EVENTS.includes(
					event as (typeof SPEAKER_PROMOTE_MIC_OFF_EVENTS)[number],
				)
			) {
				handlePromoteToSpeaker({ autoOnMic: false })
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
		async ({
			roomEndStatus: nextStatus,
			callLeaveRoom,
		}: ForceRoomCloseOptions) => {
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
				playTalkRoomSound('endRoom')
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

	const handleForceClosedRoom = useCallback(async () => {
		if (forceCloseTriggeredRef.current) return
		forceCloseTriggeredRef.current = true

		if (isHost || isSpeaker) await disconnect()
		if (isListener) await disconnectWhep()

		setRoomEndStatus('forceClosed')
		setIsRoomLiving(false)

		if (isHost) {
			showTalkRoomAutoCloseToast()
		}

		try {
			await onLeaveRoom()
		} catch {
			// Still show the force-closed dialog.
		}

		setForceClosedModalOpen(true)
	}, [disconnect, disconnectWhep, isHost, isSpeaker, isListener, onLeaveRoom])

	const handleWaitingTimeUp = useCallback(() => {
		handleForceClosedRoom()
	}, [handleForceClosedRoom])

	const handleForceClosedModalConfirm = useCallback(() => {
		setForceClosedModalOpen(false)
		onChangeRoute(mainRoutes.talkroom)
	}, [onChangeRoute])

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

	useEffect(() => {
		onRoomForceClosedRef.current = handleForceClosedRoom
	}, [handleForceClosedRoom])

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

		// Chat time: live session ended — no host transfer / assign speaker.
		if (isTalkRoomCountSessionEndVisible(roomEndStatus)) {
			setListenerLeaveModalOpen(true)
			return
		}

		setTransferHostModalMode('leave')
		setTransferHostModalOpen(true)
	}, [isHost, roomEndStatus])

	const handleListenerLeaveClick = useCallback(() => {
		if (!isListener || isHost || isSpeaker) return
		setListenerLeaveModalOpen(true)
	}, [isListener, isHost, isSpeaker])

	const transferHostSpeakerOptions = useMemo(
		() => getTalkRoomTransferHostSpeakerOptions(talkRoomDetail ?? undefined),
		[talkRoomDetail],
	)

	const showStopHostingAction = useMemo(() => {
		if (!isHost) return false
		if (isTalkRoomCountSessionEndVisible(roomEndStatus)) return false

		return hasTalkRoomAnotherSpeaker(talkRoomDetail ?? undefined)
	}, [isHost, roomEndStatus, talkRoomDetail])

	const showRemoveFromRoomAction = useMemo(() => {
		if (!isHost) return false

		return !isTalkRoomCountSessionEndVisible(roomEndStatus)
	}, [isHost, roomEndStatus])

	const showStepDownToListenerAction = useMemo(() => {
		if (!isHost && !isSpeaker) return false

		return !isTalkRoomCountSessionEndVisible(roomEndStatus)
	}, [isHost, isSpeaker, roomEndStatus])

	const showAssignAsHostAction = useMemo(() => {
		if (!isHost) return false

		return !isTalkRoomCountSessionEndVisible(roomEndStatus)
	}, [isHost, roomEndStatus])

	const showInviteToSpeakerAction = useMemo(() => {
		if (!isHost) return false
		if (isTalkRoomCountSessionEndVisible(roomEndStatus)) return false

		return hasTalkRoomEmptyGuestSpeakerSlot(talkRoomDetail ?? undefined)
	}, [isHost, roomEndStatus, talkRoomDetail])

	const handleRoomUserKicked = useCallback(
		async (kickedUserId: string) => {
			if (!currentUserId || kickedUserId !== currentUserId) return
			if (kickedTriggeredRef.current) return
			kickedTriggeredRef.current = true

			showTalkRoomUserKickedToast()

			if (isHost || isSpeaker) await disconnect()
			if (isListener) await disconnectWhep()

			setIsRoomLiving(false)

			try {
				await onLeaveRoom()
			} catch {
				// User may already be removed server-side.
			}

			window.setTimeout(() => {
				onChangeRoute(mainRoutes.talkroom)
			}, 300)
		},
		[
			currentUserId,
			disconnect,
			disconnectWhep,
			isHost,
			isSpeaker,
			isListener,
			onLeaveRoom,
			onChangeRoute,
		],
	)

	const handleRoomSpeakerSteppedDown = useCallback(
		async (targetUserId: string) => {
			if (!currentUserId || targetUserId !== currentUserId) return

			await new Promise((resolve) => window.setTimeout(resolve, 200))
			await disconnect()
			setSpeakerMicOptimisticOn(false)
		},
		[currentUserId, disconnect],
	)

	const handleHostTransferred = useCallback(
		async ({
			previousUserId,
			newHostId,
		}: {
			previousUserId?: string
			newHostId?: string
		}) => {
			if (!currentUserId) return

			try {
				if (previousUserId === currentUserId) {
					await new Promise((resolve) => window.setTimeout(resolve, 200))
					await disconnect()
					setSpeakerMicOptimisticOn(false)
				} else if (newHostId === currentUserId) {
					await disconnect()
					await new Promise((resolve) => window.setTimeout(resolve, 500))
					const result = await onTransitionRole(
						TALK_ROOM_ROLE.SPEAKER,
						TALK_ROOM_ROLE.HOST,
					)
					const newConnection = result?.newConnection
					if (newConnection) {
						await connect({ micOn: false, integration: newConnection })
					}
				}
			} catch (error) {
				console.error('Failed to handle host transfer', error)
			}
		},
		[currentUserId, disconnect, connect, onTransitionRole],
	)

	useEffect(() => {
		onHostTransferredRef.current = handleHostTransferred
	}, [handleHostTransferred])

	useEffect(() => {
		onRoomUserKickedRef.current = handleRoomUserKicked
	}, [handleRoomUserKicked])

	useEffect(() => {
		onRoomSpeakerSteppedDownRef.current = handleRoomSpeakerSteppedDown
	}, [handleRoomSpeakerSteppedDown])

	useEffect(() => {
		onListenerRejectInviteRef.current = ({ userName }) => {
			if (!isHost) return
			showTalkRoomListenerRejectInviteToast(userName)
		}
	}, [isHost])

	const handleRefreshAfterStopHosting = useCallback(async () => {
		const room = await onGetDetailTalkRoom(id)
		await onGetListenerInRoom(id)

		if (room?.youAreListener !== true) return

		await disconnect()
		setSpeakerMicOptimisticOn(false)
	}, [id, onGetDetailTalkRoom, onGetListenerInRoom, disconnect])

	const handleStopHostingAssign = useCallback(
		async (slotId: 1 | 2) => {
			const option = transferHostSpeakerOptions.find(
				(speakerOption) => speakerOption.slotId === slotId,
			)
			if (!option?.userId) return

			setTransferHostActionLoading(true)
			try {
				await stopHosting({
					id,
					payload: { newHostId: option.userId },
				})
				setTransferHostModalOpen(false)
				await handleRefreshAfterStopHosting()
			} catch (error) {
				console.error('Failed to stop hosting', error)
			} finally {
				setTransferHostActionLoading(false)
			}
		},
		[id, transferHostSpeakerOptions, handleRefreshAfterStopHosting],
	)

	const handleStopHostingSkip = useCallback(async () => {
		setTransferHostActionLoading(true)
		try {
			await stopHosting({ id })
			setTransferHostModalOpen(false)
			await handleRefreshAfterStopHosting()
		} catch (error) {
			console.error('Failed to stop hosting', error)
		} finally {
			setTransferHostActionLoading(false)
		}
	}, [id, handleRefreshAfterStopHosting])

	const handleLeaveAssignSpeaker = useCallback(
		async (slotId: 1 | 2) => {
			const option = transferHostSpeakerOptions.find(
				(speakerOption) => speakerOption.slotId === slotId,
			)
			if (!option?.userId) return

			setLeavingRoom(true)
			try {
				await stopHosting({
					id,
					payload: { newHostId: option.userId, isLeave: true },
				})
				if (isHost || isSpeaker) await disconnect()
				if (isListener) await disconnectWhep()
				await onLeaveRoom()
				setTransferHostModalOpen(false)
				onChangeRoute(mainRoutes.talkroom)
			} catch (error) {
				console.error('Failed to assign host and leave', error)
			} finally {
				setLeavingRoom(false)
			}
		},
		[
			transferHostSpeakerOptions,
			id,
			isHost,
			isSpeaker,
			isListener,
			disconnect,
			disconnectWhep,
			onLeaveRoom,
			onChangeRoute,
		],
	)

	const handleAssignSpeakerAndLeave = handleLeaveAssignSpeaker

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
		onMicOn: async () => {
			await handleConnectAgora()
			if (currentUserId) {
				onUpdateSpeakerLiveStatus(currentUserId, {
					is_open_mic: true,
					is_talking: false,
				})
			}
			handleEmitMicState(true)
		},
		onMicOff: () => {
			setMic(false)
			if (currentUserId) {
				onUpdateSpeakerLiveStatus(currentUserId, {
					is_open_mic: false,
					is_talking: false,
				})
			}
			handleEmitMicState(false)
		},
	})

	const beSpeakerState = useMemo(
		() =>
			getListenerBeSpeakerState(talkRoomDetail ?? undefined, {
				isListener,
			}),
		[talkRoomDetail, isListener],
	)

	const listenerHasRaiseHand = useMemo(
		() =>
			currentUserId != null && raiseHandUserIds.includes(currentUserId),
		[currentUserId, raiseHandUserIds],
	)

	const totalRaiseHand = useMemo(
		() => getTalkRoomTotalRaiseHand(slotUserRaiseHand),
		[slotUserRaiseHand],
	)

	// Listener rows can lag behind the stage, so stage users are always filtered out.
	const listenerRows = useMemo(
		() =>
			excludeTalkRoomStageUsersFromListeners(
				listenersInRoom,
				talkRoomDetail ?? undefined,
				isHost || isSpeaker ? [currentUserId] : [],
			),
		[listenersInRoom, talkRoomDetail, isHost, isSpeaker, currentUserId],
	)

	const displayListeners = useMemo(() => {
		const filterIds = isFilterRaiseHand
			? getTalkRoomFilterRaiseHandIds(slotUserRaiseHand, filterRaiseHandSlot)
			: raiseHandUserIds

		return sortTalkRoomListenersByRaiseHand(listenerRows, filterIds)
	}, [
		listenerRows,
		isFilterRaiseHand,
		slotUserRaiseHand,
		filterRaiseHandSlot,
		raiseHandUserIds,
	])

	/** Toggles raise hand; preferred slot falls back to the other free slot. */
	const handleToggleRaiseHand = useCallback(
		async (preferredSlot: 1 | 2) => {
			if (beSpeakerState === 'disabled') return

			const hasRaiseHand =
				currentUserId != null && raiseHandUserIds.includes(currentUserId)

			if (hasRaiseHand) {
				await onPostRaiseHand({ isRaiseHand: false })
				return
			}

			await onPostRaiseHand({
				isRaiseHand: true,
				slotId: resolveRaiseHandSlotId(
					talkRoomDetail ?? undefined,
					preferredSlot,
				),
			})
		},
		[
			beSpeakerState,
			currentUserId,
			raiseHandUserIds,
			talkRoomDetail,
			onPostRaiseHand,
		],
	)

	const handleBeSpeaker = useCallback(
		() => handleToggleRaiseHand(1),
		[handleToggleRaiseHand],
	)

	const handleEmptySpeakerSlotClick = useCallback(
		async (slotId: 1 | 2) => {
			if (isHost) {
				if (totalRaiseHand > 0) onSwitchToFilterRaiseHand(slotId)
				return
			}

			if (isSpeaker || !isListener) return

			await handleToggleRaiseHand(slotId)
		},
		[
			isHost,
			isSpeaker,
			isListener,
			totalRaiseHand,
			onSwitchToFilterRaiseHand,
			handleToggleRaiseHand,
		],
	)

	// Host opens the raise hand queue; listener raises a hand for that slot.
	const canClickEmptySpeakerSlot = isHost
		? totalRaiseHand > 0
		: isListener &&
			!isSpeaker &&
			isRoomLiving &&
			beSpeakerState !== 'disabled'

	const handleOpenParticipantProfile = useCallback(
		(userId?: string, target?: 'host' | 'speaker' | 'listener') => {
			if (!userId) return

			const isSelf = userId === currentUserId

			if (isHost) {
				const role: TalkRoomParticipantProfileRole = isSelf
					? 'host-self'
					: target === 'speaker'
						? 'speaker'
						: 'listener'
				onOpenParticipantProfile(userId, role)
				return
			}

			if (isSpeaker) {
				onOpenParticipantProfile(
					userId,
					isSelf ? 'speaker-self' : 'speaker-other',
				)
				return
			}

			if (isListener) {
				onOpenParticipantProfile(
					userId,
					isSelf ? 'listener-self' : 'listener-other',
				)
			}
		},
		[currentUserId, isHost, isSpeaker, isListener, onOpenParticipantProfile],
	)

	const canOpenParticipantProfile = isHost || isSpeaker || isListener

	const handleSpeakerSlotClick = useCallback(
		(userId?: string, isHostSlot?: boolean) => {
			handleOpenParticipantProfile(userId, isHostSlot ? 'host' : 'speaker')
		},
		[handleOpenParticipantProfile],
	)

	const handleListenerClick = useCallback(
		async (userId?: string) => {
			if (!userId) return

			if (
				isHost &&
				isFilterRaiseHand &&
				raiseHandUserIds.includes(userId)
			) {
				await onApproveRaiseHand(userId)
				return
			}

			handleOpenParticipantProfile(userId, 'listener')
		},
		[
			isHost,
			isFilterRaiseHand,
			raiseHandUserIds,
			onApproveRaiseHand,
			handleOpenParticipantProfile,
		],
	)

	const promotedListenerCount = listenersInRoom.length - listenerRows.length
	const listenerCount =
		totalListenersInRoom > 0
			? Math.max(0, totalListenersInRoom - promotedListenerCount)
			: getTalkRoomListenerCount(talkRoomDetail ?? undefined)

	const hasGuestSpeaker = useMemo(
		() => hasTalkRoomAnotherSpeaker(talkRoomDetail ?? undefined),
		[talkRoomDetail],
	)

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
								ariaLabel={isMuteRoom ? 'Unmute room audio' : 'Mute room audio'}
								onClick={handleToggleRoomVolume}
							>
								{isMuteRoom ? (
									<VolumeMuteIcon width={20} height={20} />
								) : (
									<VolumeHighIcon width={20} height={20} />
								)}
							</TalkRoomHeaderActionButton>
						) : null}
						<TalkRoomHeaderActionButton
							ariaLabel="Share room"
							onClick={onInvite}
						>
							<ShareIcon fill="#FFFFFF" />
						</TalkRoomHeaderActionButton>
					</div>
				</div>
				<DetailTalkroomSpeakerStage
					talkRoomDetail={talkRoomDetail}
					speakerStatusMap={speakerStatusMap}
					isRoomLiving={isRoomLiving}
					totalRaiseHand={totalRaiseHand}
					onSpeakerSlotClick={
						canOpenParticipantProfile ? handleSpeakerSlotClick : undefined
					}
					onEmptySlotClick={
						canClickEmptySpeakerSlot
							? handleEmptySpeakerSlotClick
							: undefined
					}
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
					listeners={displayListeners}
					raiseHandUserIds={raiseHandUserIds}
					isFilterRaiseHand={isFilterRaiseHand}
					hasGuestSpeaker={hasGuestSpeaker}
					totalParticipants={talkRoomDetail?.total_participants ?? 0}
					loadingListeners={loadingListenersInRoom}
					micState={micState}
					beSpeakerState={beSpeakerState}
					hasRaiseHand={listenerHasRaiseHand}
					onToggleMic={onToggleMic}
					onBeSpeaker={handleBeSpeaker}
					onLeaveRoom={onLeave}
					onInvite={onInvite}
					onListenerClick={
						canOpenParticipantProfile ? handleListenerClick : undefined
					}
					onCloseFilterRaiseHand={onCloseFilterRaiseHand}
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
					onWaitingTimeUp={handleWaitingTimeUp}
				/>
			</div>
		)
	}

	const _renderChatContent = () => {
		if (!conversationId) {
			return (
				<div className={classes.chatContent}>
					<div className={classes.chatEmpty}>
						Chat is not available for this room.
					</div>
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
				loading={leavingRoom || transferHostActionLoading}
				speakerOptions={transferHostSpeakerOptions}
				onClose={() => setTransferHostModalOpen(false)}
				onAssignSpeaker={
					transferHostModalMode === 'stopHosting'
						? handleStopHostingAssign
						: handleAssignSpeakerAndLeave
				}
				onSkipAssigning={
					transferHostModalMode === 'stopHosting'
						? handleStopHostingSkip
						: handleConfirmLeaveRoom
				}
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
			<TalkRoomForceClosedModal
				open={forceClosedModalOpen}
				onConfirm={handleForceClosedModalConfirm}
			/>
			<TalkRoomSpeakerInvitationModal
				open={speakerInvitationOpen}
				loading={speakerInvitationLoading}
				onAccept={onAcceptSpeakerInvitation}
				onDecline={onRejectSpeakerInvitation}
			/>
			<TalkRoomParticipantProfileModal
				open={participantProfileModal.open}
				role={participantProfileModal.role ?? 'listener'}
				userProfile={participantUserProfile}
				talkRoomStats={participantTalkRoomStats}
				loadingProfile={loadingParticipantProfile}
				actionLoading={participantActionLoading}
				reportOpen={participantReportOpen}
				showStopHosting={showStopHostingAction}
				showRemoveFromRoom={showRemoveFromRoomAction}
				showStepDownToListener={
					showStepDownToListenerAction &&
					(participantProfileModal.role === 'speaker' ||
						participantProfileModal.role === 'speaker-self')
				}
				showAssignAsHost={
					showAssignAsHostAction &&
					participantProfileModal.role === 'speaker'
				}
				showInviteToSpeaker={
					showInviteToSpeakerAction &&
					participantProfileModal.role === 'listener'
				}
				onClose={onCloseParticipantProfile}
				onCloseReport={onCloseParticipantReport}
				onClickConnectedPeople={onOpenParticipantConnectedPeople}
				onClickConnectedCountries={onOpenParticipantConnectedCountries}
				onAction={onParticipantProfileAction}
			/>
			<TalkRoomConnectedUserModal
				open={participantConnectedModal === 'people'}
				users={participantConnectedUsers}
				total={totalParticipantConnectedUsers}
				loading={loadingParticipantConnectedPeople}
				hasMore={
					participantConnectedUsers.length < totalParticipantConnectedUsers
				}
				onLoadMore={onLoadMoreParticipantConnectedPeople}
				onClose={onCloseParticipantConnectedModal}
			/>
			<TalkRoomConnectedCountryModal
				open={participantConnectedModal === 'countries'}
				countries={participantConnectedCountries}
				loading={loadingParticipantConnectedCountries}
				onClose={onCloseParticipantConnectedModal}
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
