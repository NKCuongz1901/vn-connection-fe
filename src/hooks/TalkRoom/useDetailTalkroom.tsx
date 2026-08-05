'use client'

import { useCallback, useEffect, useState } from 'react'

import {
	getDetailTalkRoom,
	getListenerInRoom,
	getTalkRoomUserProfile,
	inviteToSpeaker,
	joinTalkroom,
	JoinTalkroomAgora,
	JoinTalkroomModel,
	kickUserFromTalkRoom,
	leaveTalkroom,
	postRaiseHand,
	RaiseHandPayload,
	stepDownToListener,
	stopHosting,
	TalkRoomDetail,
	TalkRoomListenerInRoom,
	TalkRoomUserProfileStats,
	transitionRole,
	validatePreTalkroom,
	ValidatePreTalkroomModel,
} from '@/apis/talkRoomApis'
import {
	joinConversation,
	leaveConversation,
} from '@/apis/conversationApis'
import { addFriend } from '@/apis/friendApis'
import { blockUser, getUserProfile } from '@/apis/userApis'
import type {
	TalkRoomParticipantProfileAction,
	TalkRoomParticipantProfileRole,
} from '@/Components/Modal/TalkRoomParticipantProfileModal'
import { useModal } from '@/context/ModalContext'
import { UserProps } from '@/interface/User/User.interface'
import { TALK_ROOM_JOIN_REASON, TALK_ROOM_ROLE } from '@/Variable/talkRoom.variable'
import { useLocalePath } from '@/ultis/route'
import { mainRoutes } from '@/routes/MainRoutes'
import {
	consumeTalkRoomAutoJoinFlag,
	getTalkRoomConversationId,
	getTalkRoomSocketTalkingStatus,
	getTalkRoomSocketTargetUserId,
	TalkRoomSpeakerStatusMap,
} from '@/ultis/talkRoom'
import useTalkRoomSocket from './useTalkRoomSocket'

export type ValidatePreJoinRoomResult = ValidatePreTalkroomModel & {
	isRejoin: boolean
}

type UseDetailTalkroomOptions = {
	onRoomSocketEvent?: (event: string, data?: unknown) => void
	onRoomTimeUp?: (data?: unknown) => void
	onAssignAsHost?: (userId: string) => void
}

export type TalkRoomParticipantProfileModalState = {
	open: boolean
	userId?: string
	role?: TalkRoomParticipantProfileRole
}

export default function useDetailTalkroom(
	id: string,
	options?: UseDetailTalkroomOptions,
) {
	const { openError, openConfirm, openSuccess } = useModal()
	const { onChangeRoute } = useLocalePath()
	const [talkRoomDetail, setTalkRoomDetail] = useState<TalkRoomDetail | null>(
		null,
	)
	const [loadingTalkRoomDetail, setLoadingTalkRoomDetail] = useState(false)
	const [validatePreJoin, setValidatePreJoin] =
		useState<ValidatePreTalkroomModel | null>(null)
	const [loadingValidatePreJoin, setLoadingValidatePreJoin] = useState(false)
	const [joinTalkRoomResult, setJoinTalkRoomResult] =
		useState<JoinTalkroomModel | null>(null)
	const isJoined = joinTalkRoomResult?.success === true
	const [loadingJoinTalkRoom, setLoadingJoinTalkRoom] = useState(false)
	const [listenersInRoom, setListenersInRoom] = useState<
		TalkRoomListenerInRoom[]
	>([])
	const [totalListenersInRoom, setTotalListenersInRoom] = useState(0)
	const [loadingListenersInRoom, setLoadingListenersInRoom] = useState(false)
	const [roomUserRole, setRoomUserRole] = useState<string | null>(null)
	const [roleIntegration, setRoleIntegration] =
		useState<JoinTalkroomAgora | null>(null)
	const [speakerStatusMap, setSpeakerStatusMap] =
		useState<TalkRoomSpeakerStatusMap>({})
	const [participantProfileModal, setParticipantProfileModal] =
		useState<TalkRoomParticipantProfileModalState>({ open: false })
	const [participantUserProfile, setParticipantUserProfile] =
		useState<UserProps | null>(null)
	const [participantTalkRoomStats, setParticipantTalkRoomStats] =
		useState<TalkRoomUserProfileStats | null>(null)
	const [loadingParticipantProfile, setLoadingParticipantProfile] =
		useState(false)
	const [participantActionLoading, setParticipantActionLoading] =
		useState(false)
	const [participantReportOpen, setParticipantReportOpen] = useState(false)

	const handleUpdateSpeakerLiveStatus = useCallback(
		(
			userId: string,
			patch: { is_open_mic?: boolean; is_talking?: boolean },
		) => {
			if (!userId) return

			setSpeakerStatusMap((prev) => ({
				...prev,
				[userId]: {
					...prev[userId],
					...patch,
				},
			}))
		},
		[],
	)

	const handleGetDetailTalkRoom = useCallback(
		async (
			roomId: string = id,
			params: { [key: string]: any } = { fields: ['$all'] },
		) => {
			if (!roomId) return null

			setLoadingTalkRoomDetail(true)
			try {
				const res: any = await getDetailTalkRoom({ id: roomId, params })
				const { code, results } = res || {}

				if (code === 200) {
					const room: TalkRoomDetail = results?.object ?? null
					setTalkRoomDetail(room)
					return room
				}
			} catch (error) {
				openError(error)
			} finally {
				setLoadingTalkRoomDetail(false)
			}

			return null
		},
		[id, openError],
	)

	const handleValidatePreJoinRoom = useCallback(
		async (
			roomId: string = id,
			params: { [key: string]: any } = { fields: ['$all'] },
		): Promise<ValidatePreJoinRoomResult | null> => {
			if (!roomId) return null

			setLoadingValidatePreJoin(true)
			try {
				const res: any = await validatePreTalkroom({ id: roomId, params })
				const { code, results } = res || {}

				if (code === 200) {
					const data: ValidatePreTalkroomModel = results?.object ?? null
					setValidatePreJoin(data)

					if (!data) return null

					return {
						...data,
						isRejoin: data.reason === TALK_ROOM_JOIN_REASON.USER_ALREADY_JOINED,
					}
				}
			} catch (error) {
				openError(error)
			} finally {
				setLoadingValidatePreJoin(false)
			}

			return null
		},
		[id, openError],
	)

	const handlePostRaiseHand = useCallback(
		async ({
			roomId = id,
			isRaiseHand,
			slotId,
		}: {
			roomId?: string
			isRaiseHand: boolean
			slotId?: number
		}) => {
			if (!roomId) return null

			const payload: RaiseHandPayload = { isRaiseHand }
			if (isRaiseHand && slotId != null) {
				payload.slotId = slotId
			}

			try {
				const res: any = await postRaiseHand({ id: roomId, payload })
				const { code } = res || {}

				if (code === 200) {
					return res
				}
			} catch (error) {
				openError(error)
			}

			return null
		},
		[id, openError],
	)

	const handleJoinTalkRoom = useCallback(
		async (
			roomId: string = id,
			payload: { [key: string]: any } = { fields: ['$all'] },
		): Promise<JoinTalkroomModel | null> => {
			if (!roomId) return null

			setLoadingJoinTalkRoom(true)
			try {
				const res: any = await joinTalkroom({ id: roomId, payload })
				const { code, results } = res || {}

				if (code === 200) {
					const data: JoinTalkroomModel = results?.object ?? null

					if (data?.success) {
						setJoinTalkRoomResult(data)
						setRoomUserRole(data.data?.role ?? null)
						setRoleIntegration(data.data?.agora ?? null)
						return data
					}
				}
			} catch (error) {
				openError(error)
			} finally {
				setLoadingJoinTalkRoom(false)
			}

			return null
		},
		[id, openError],
	)

	const applySpeakerRole = useCallback(
		(newConnection?: JoinTalkroomAgora | null) => {
			if (!newConnection) return

			setRoomUserRole(TALK_ROOM_ROLE.SPEAKER)
			setRoleIntegration(newConnection)
			setJoinTalkRoomResult((prev) => {
				if (!prev?.data) return prev

				return {
					...prev,
					data: {
						...prev.data,
						role: TALK_ROOM_ROLE.SPEAKER,
						agora: newConnection,
					},
				}
			})
		},
		[],
	)

	const handleTransitionToSpeaker = useCallback(async () => {
		if (!id) return null

		try {
			const res: any = await transitionRole({
				id,
				payload: {
					from_role: TALK_ROOM_ROLE.LISTENER,
					to_role: TALK_ROOM_ROLE.SPEAKER,
				},
			})
			const { code, results } = res || {}

			if (code !== 200) return null

			const transitionData =
				results?.object?.data ?? results?.object ?? results ?? null
			const newConnection = transitionData?.new_connection ?? null

			if (!newConnection) return null

			applySpeakerRole(newConnection)

			return { newConnection }
		} catch (error) {
			openError(error)
		}

		return null
	}, [id, applySpeakerRole, openError])

	const handleGetListenerInRoom = useCallback(
		async (
			roomId: string = id,
			params: { [key: string]: any } = {
				fields: ['$all'],
				page: 1,
				limit: 30,
			},
		) => {
			if (!roomId) return null

			setLoadingListenersInRoom(true)
			try {
				const res: any = await getListenerInRoom({ id: roomId, params })
				const { code, results, pagination } = res || {}

				if (code === 200) {
					const rows: TalkRoomListenerInRoom[] = results?.objects?.rows ?? []
					const count =
						results?.objects?.count ?? pagination?.total ?? rows.length

					setListenersInRoom(rows)
					setTotalListenersInRoom(count)

					return { rows, count, pagination }
				}
			} catch (error) {
				openError(error)
			} finally {
				setLoadingListenersInRoom(false)
			}

			return null
		},
		[id, openError],
	)

	const handleCloseParticipantProfile = useCallback(() => {
		setParticipantProfileModal({ open: false })
		setParticipantUserProfile(null)
		setParticipantTalkRoomStats(null)
		setParticipantReportOpen(false)
	}, [])

	const handleFetchParticipantProfile = useCallback(
		async (userId: string) => {
			if (!userId) return

			setLoadingParticipantProfile(true)
			try {
				const [userRes, statsRes]: any[] = await Promise.all([
					getUserProfile({ id: userId, params: { fields: ['$all'] } }),
					getTalkRoomUserProfile({
						userId,
						params: { fields: ['$all'] },
					}),
				])

				if (userRes?.code === 200) {
					setParticipantUserProfile(userRes?.results?.object ?? null)
				}
				if (statsRes?.code === 200) {
					setParticipantTalkRoomStats(statsRes?.results?.object ?? null)
				}
			} catch (error) {
				openError(error)
			} finally {
				setLoadingParticipantProfile(false)
			}
		},
		[openError],
	)

	const handleOpenParticipantProfile = useCallback(
		(userId: string, role: TalkRoomParticipantProfileRole) => {
			if (!userId) return

			setParticipantProfileModal({ open: true, userId, role })
			setParticipantUserProfile(null)
			setParticipantTalkRoomStats(null)
			setParticipantReportOpen(false)
			handleFetchParticipantProfile(userId)
		},
		[handleFetchParticipantProfile],
	)

	const refreshRoomAfterParticipantAction = useCallback(async () => {
		await Promise.all([
			handleGetDetailTalkRoom(id),
			handleGetListenerInRoom(id),
		])
	}, [id, handleGetDetailTalkRoom, handleGetListenerInRoom])

	const runParticipantRoomAction = useCallback(
		async (action: () => Promise<unknown>, successMessage?: string) => {
			setParticipantActionLoading(true)
			try {
				const res: any = await action()
				if (res?.code === 200) {
					if (successMessage) {
						openSuccess({ message: successMessage })
					}
					handleCloseParticipantProfile()
					await refreshRoomAfterParticipantAction()
					return true
				}
			} catch (error) {
				openError(error)
			} finally {
				setParticipantActionLoading(false)
			}
			return false
		},
		[
			handleCloseParticipantProfile,
			openError,
			openSuccess,
			refreshRoomAfterParticipantAction,
		],
	)

	const handleParticipantProfileAction = useCallback(
		(action: TalkRoomParticipantProfileAction) => {
			const targetUserId = participantProfileModal.userId
			if (!id || !targetUserId) return

			switch (action) {
				case 'stop_hosting':
					openConfirm({
						message: 'Do you want to stop hosting this room?',
						onAccept: () =>
							runParticipantRoomAction(
								() => stopHosting({ id }),
								'You stopped hosting successfully',
							),
					})
					break
				case 'invite_to_speaker':
					runParticipantRoomAction(
						() =>
							inviteToSpeaker({
								id,
								payload: { user_id: targetUserId },
							}),
						'Invite sent successfully',
					)
					break
				case 'remove_from_room':
					openConfirm({
						message: 'Remove this user from the room?',
						onAccept: () =>
							runParticipantRoomAction(
								() =>
									kickUserFromTalkRoom({
										id,
										payload: { user_id: targetUserId },
									}),
								'User removed from room',
							),
					})
					break
				case 'stepdown_to_listener':
					const isSpeakerSelf =
						participantProfileModal.role === 'speaker-self'
					openConfirm({
						message: isSpeakerSelf
							? 'Do you want to stop speaking?'
							: 'Make this speaker become a listener?',
						onAccept: () =>
							runParticipantRoomAction(
								() =>
									stepDownToListener({
										id,
										payload: { user_id: targetUserId },
									}),
								isSpeakerSelf
									? 'You stopped speaking'
									: 'Speaker moved to listener',
							),
					})
					break
				case 'assign_as_host':
					handleCloseParticipantProfile()
					options?.onAssignAsHost?.(targetUserId)
					break
				case 'add_friend':
					setParticipantActionLoading(true)
					addFriend({ friend_id: targetUserId })
						.then((res: any) => {
							if (res?.code === 200) {
								openSuccess({ message: 'Friend request sent successfully' })
								handleFetchParticipantProfile(targetUserId)
							}
						})
						.catch(openError)
						.finally(() => setParticipantActionLoading(false))
					break
				case 'report':
					setParticipantReportOpen(true)
					break
				case 'block':
					openConfirm({
						message: 'Do you want to block this user?',
						onAccept: () => {
							setParticipantActionLoading(true)
							blockUser(targetUserId)
								.then((res) => {
									if (res) {
										openSuccess({
											message: 'You have successfully blocked this user',
										})
										handleCloseParticipantProfile()
									}
								})
								.catch(openError)
								.finally(() => setParticipantActionLoading(false))
						},
					})
					break
				default:
					break
			}
		},
		[
			id,
			participantProfileModal.userId,
			participantProfileModal.role,
			openConfirm,
			runParticipantRoomAction,
			handleCloseParticipantProfile,
			options?.onAssignAsHost,
			openSuccess,
			handleFetchParticipantProfile,
			openError,
		],
	)

	const handleCloseParticipantReport = useCallback(() => {
		setParticipantReportOpen(false)
	}, [])

	const handleLeaveRoom = useCallback(async () => {
		if (!id) return

		const conversationId = getTalkRoomConversationId(talkRoomDetail)

		try {
			if (conversationId) {
				await leaveConversation({ id: conversationId, status: false }).catch(
					() => undefined,
				)
			}

			await leaveTalkroom({ id })
		} catch (error) {
			openError(error)
		}
	}, [id, talkRoomDetail, openError])

	const handleRoomSocketEvent = useCallback(
		(event: string, data?: unknown) => {
			switch (event) {
				case 'user_joined_room':
				case 'user_left_room':
					handleGetDetailTalkRoom(id)
					handleGetListenerInRoom(id)
					break
				case 'room_went_live':
					handleGetDetailTalkRoom(id)
					break
				case 'speaker_on_mic': {
					const userId = getTalkRoomSocketTargetUserId(data)
					if (userId) {
						handleUpdateSpeakerLiveStatus(userId, {
							is_open_mic: true,
							is_talking: false,
						})
					} else {
						handleGetDetailTalkRoom(id)
					}
					break
				}
				case 'speaker_off_mic': {
					const userId = getTalkRoomSocketTargetUserId(data)
					if (userId) {
						handleUpdateSpeakerLiveStatus(userId, {
							is_open_mic: false,
							is_talking: false,
						})
					} else {
						handleGetDetailTalkRoom(id)
					}
					break
				}
				case 'on_talking': {
					const userId = getTalkRoomSocketTargetUserId(data)
					const isTalking = getTalkRoomSocketTalkingStatus(data)
					if (userId && typeof isTalking === 'boolean') {
						handleUpdateSpeakerLiveStatus(userId, { is_talking: isTalking })
					}
					break
				}
				case 'room_start_countdown':
				case 'raise_hand_accepted':
				case 'promote_to_speaker':
				case 'listener_accept_to_speaker_success':
					handleGetDetailTalkRoom(id)
					if (
						event === 'raise_hand_accepted' ||
						event === 'promote_to_speaker' ||
						event === 'listener_accept_to_speaker_success'
					) {
						handleGetListenerInRoom(id)
					}
					break
				case 'room_inactive_warning':
					// openSuccess({ message: '...' }) hoặc toast sau
					break
				case 'room_time_up':
					options?.onRoomTimeUp?.(data)
					break
				case 'room_force_closed':
				case 'room_inactive_force_closed':
					handleLeaveRoom().finally(() => {
						onChangeRoute(mainRoutes.talkroom)
					})
					break
				default:
					break
			}

			options?.onRoomSocketEvent?.(event, data)
		},
		[
			id,
			handleGetDetailTalkRoom,
			handleGetListenerInRoom,
			handleLeaveRoom,
			handleUpdateSpeakerLiveStatus,
			onChangeRoute,
			options?.onRoomSocketEvent,
			options?.onRoomTimeUp,
		],
	)

	const { isConnected, emitRoomEvent } = useTalkRoomSocket({
		roomId: id,
		enabled: isJoined,
		onRoomEvent: handleRoomSocketEvent,
	})

	const handleEnterRoom = useCallback(async () => {
		if (!id) return

		const shouldSkipValidate = consumeTalkRoomAutoJoinFlag(id)

		if (!shouldSkipValidate) {
			const validation = await handleValidatePreJoinRoom(id)
			if (!validation) return

			const canProceed =
				validation.canJoin === true ||
				validation.isRejoin === true ||
				validation.reason === TALK_ROOM_JOIN_REASON.HOST_NOT_JOINED

			if (!canProceed) return
		}

		const joinResult = await handleJoinTalkRoom(id)
		if (!joinResult?.success) return

		const [room] = await Promise.all([
			handleGetDetailTalkRoom(id),
			handleGetListenerInRoom(id),
		])

		const conversationId = getTalkRoomConversationId(room)
		if (conversationId) {
			await joinConversation({ id: conversationId, status: true }).catch(
				() => undefined,
			)
		}
	}, [
		id,
		handleValidatePreJoinRoom,
		handleJoinTalkRoom,
		handleGetDetailTalkRoom,
		handleGetListenerInRoom,
	])

	useEffect(() => {
		if (!id) return
		handleEnterRoom()
	}, [id, handleEnterRoom])

	return {
		talkRoomDetail,
		loadingTalkRoomDetail,
		validatePreJoin,
		loadingValidatePreJoin,
		joinTalkRoomResult,
		loadingJoinTalkRoom,
		roomUserRole,
		roleIntegration,
		listenersInRoom,
		totalListenersInRoom,
		loadingListenersInRoom,
		speakerStatusMap,
		participantProfileModal,
		participantUserProfile,
		participantTalkRoomStats,
		loadingParticipantProfile,
		participantActionLoading,
		participantReportOpen,

		onGetDetailTalkRoom: handleGetDetailTalkRoom,
		onGetListenerInRoom: handleGetListenerInRoom,
		onValidatePreJoinRoom: handleValidatePreJoinRoom,
		onJoinTalkRoom: handleJoinTalkRoom,
		onLeaveRoom: handleLeaveRoom,
		onPostRaiseHand: handlePostRaiseHand,
		onTransitionToSpeaker: handleTransitionToSpeaker,
		onUpdateSpeakerLiveStatus: handleUpdateSpeakerLiveStatus,
		onOpenParticipantProfile: handleOpenParticipantProfile,
		onCloseParticipantProfile: handleCloseParticipantProfile,
		onParticipantProfileAction: handleParticipantProfileAction,
		onCloseParticipantReport: handleCloseParticipantReport,
		emitRoomEvent,
	}
}
