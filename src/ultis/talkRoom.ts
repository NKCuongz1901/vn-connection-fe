import dayjs from 'dayjs'

import type { ValidatePreTalkroomModel } from '@/apis/talkRoomApis'
import { TALK_ROOM_JOIN_REASON } from '@/Variable/talkRoom.variable'
import { CountriesOptions } from '@/Variable/countryVariable'

export type TalkRoomAvatarLayout = 'single' | 'double' | 'triple'

export type TalkRoomSpeaker = {
	id?: string
	name?: string
	avatar?: string
	role?: string
	talking_time?: number
	i_am_from?: string
	is_open_mic?: boolean
	is_talking?: boolean
}

export type TalkRoomSpeakerLiveStatus = {
	is_open_mic?: boolean
	is_talking?: boolean
}

export type TalkRoomSpeakerStatusMap = Record<string, TalkRoomSpeakerLiveStatus>

export type TalkRoomSpeakerMicStatusIcon = 'mic-off' | 'mic-on' | 'talking'

export type TalkRoomJoinedFriend = {
	id?: string
	name?: string
	avatar?: string
}

export type TalkRoomLanguage = {
	id?: string
	name?: string
	code?: string
	flag?: string
}

export type TalkRoomCategory = {
	slug?: string
	category_details?: {
		slug?: string
		name?: string
	}
}

export type TalkRoomSchedule = {
	id?: string
	schedule_at?: string
	enabled?: boolean
	status?: string
	index?: number
	estimated_end_at?: string | null
	ended_at?: string | null
	conversation_id?: string | null
}

export type TalkRoomRoom = {
	id?: string
	name?: string
	status?: string
	type?: string
	speakers?: TalkRoomSpeaker[]
	created_by_user?: TalkRoomSpeaker
	total_participants?: number
	max_participants?: number
	max_speakers?: number
	next_schedule_at?: string | null
	started_at?: string | null
	schedules?: TalkRoomSchedule[]
	host_joined?: boolean
	language?: TalkRoomLanguage
	level?: string[]
	categories?: TalkRoomCategory[]
	cmi_users?: TalkRoomSpeaker[]
	total_cmi?: number
	is_cmi?: boolean
	user_notified?: boolean
	host_user?: {
		id?: string
		name?: string
		avatar?: string
		i_am_from?: string
	}
	time_left_in_seconds?: number
	max_duration_seconds?: number
	count_down_at?: string | null
	created_at?: string
	is_joined?: boolean
	is_your_room?: boolean
	yourAreHost?: boolean
	youAreListener?: boolean
	isUserSpeaker?: boolean
	dynamic_link?: string
	joined_friends?: TalkRoomJoinedFriend[]
	total_friends_joined?: number
}

export type TalkRoomFriendBannerDisplay = {
	names: string[]
	suffix: string
}

export const formatTalkRoomFriendBanner = (
	joinedFriends?: TalkRoomJoinedFriend[],
	totalFriendsJoined?: number,
): TalkRoomFriendBannerDisplay | null => {
	const friends = joinedFriends ?? []
	const total = totalFriendsJoined ?? friends.length

	if (total <= 0 || !friends.length) return null

	const names = friends
		.map((friend) => friend?.name)
		.filter(Boolean) as string[]

	if (!names.length) return null

	if (total === 1) {
		return {
			names: [names[0]],
			suffix: ' is here, waiting for you in this room',
		}
	}

	const displayNames = names.slice(0, 2)
	const othersCount = Math.max(total - displayNames.length, 0)

	if (othersCount <= 0) {
		return {
			names: displayNames,
			suffix:
				displayNames.length === 1
					? ' is staying in this room!'
					: ' are staying in this room!',
		}
	}

	const othersLabel = othersCount === 1 ? '1 other' : `${othersCount} others`

	return {
		names: displayNames,
		suffix: ` and ${othersLabel} is staying in this room!`,
	}
}

export const formatTalkRoomInRoomParticipantsText = (
	room?: TalkRoomRoom,
): TalkRoomLiveParticipantsDisplay => {
	const total = room?.total_participants ?? 0
	const max = room?.max_participants ?? 0

	return {
		highlight: `${total}/${max}`,
		regular: ' people in room',
	}
}

/** @deprecated Use formatTalkRoomInRoomParticipantsText */
export const formatTalkRoomFriendParticipantsText =
	formatTalkRoomInRoomParticipantsText

export const getSpeakerAvatar = (speaker?: TalkRoomSpeaker) => speaker?.avatar

const getSpeakersForDisplay = (room?: TalkRoomRoom) => {
	const speakers = room?.speakers ?? []
	if (speakers.length > 0) return speakers
	if (isTalkRoomLive(room?.status)) return []
	if (!shouldShowHostAvatarWhenEmpty(room)) return []

	const host = room?.host_user ?? room?.created_by_user
	return host ? [host] : []
}

export const getSpeakerCount = (room?: TalkRoomRoom) => {
	return getSpeakersForDisplay(room).length
}

export const getTalkRoomAvatarLayout = (
	count: number,
): TalkRoomAvatarLayout => {
	const effectiveCount = count <= 0 ? 1 : count
	if (effectiveCount >= 3) return 'triple'
	if (effectiveCount === 2) return 'double'
	return 'single'
}

export const getVisibleSpeakers = (
	room: TalkRoomRoom,
	layout: TalkRoomAvatarLayout,
) => {
	const maxVisible = layout === 'triple' ? 3 : layout === 'double' ? 2 : 1
	return getSpeakersForDisplay(room).slice(0, maxVisible)
}

export const formatTalkRoomSchedule = (date?: string | null) => {
	if (!date) return ''
	const d = dayjs(date)
	if (!d.isValid()) return ''
	return `${d.format('hh:mmA')} ${d.format('DD/MM')}`
}

/** Scheduled start time for in-room timing banner (e.g. "07:15 PM"). */
export const formatTalkRoomStartTime = (date?: string | null) => {
	if (!date) return ''
	const d = dayjs(date)
	if (!d.isValid()) return ''
	return d.format('hh:mm A')
}

/** In-room pre-start timing: within 10 min early window, before scheduled start. */
export const isTalkRoomPreStartTimingVisible = (room?: TalkRoomRoom) => {
	if (!room || isTalkRoomLive(room.status)) return false

	const scheduledAt = getTalkRoomScheduledStartAt(room)
	const remainSeconds = getTalkRoomScheduleRemainSeconds(scheduledAt)
	if (remainSeconds === null) return false

	return (
		remainSeconds > 0 && remainSeconds <= TALK_ROOM_EARLY_ACCESS_MINUTES * 60
	)
}

export const getTalkRoomPreStartTimingDescription = (
	scheduledAt?: string | null,
) => {
	const startTime = formatTalkRoomStartTime(scheduledAt)
	if (!startTime) return ''

	return `The Talk Room opens at ${startTime} and starts when both a host and a listener join`
}

/** Formats countdown seconds as MM:SS for the in-room waiting banner. */
export const formatTalkRoomCountdownMmSs = (totalSeconds: number) => {
	const safeSeconds = Math.max(0, Math.floor(totalSeconds))
	const minutes = Math.floor(safeSeconds / 60)
	const seconds = safeSeconds % 60

	return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export const TALK_ROOM_DEFAULT_MAX_DURATION_SECONDS = 300
export const TALK_ROOM_COUNT_WAITING_MIN_SECONDS = 10
export const TALK_ROOM_SESSION_END_DURATION_SECONDS = 600

export const TALK_ROOM_AUTO_JOIN_STORAGE_KEY = 'talkroom_auto_join_room_id'

/** Marks a room for host auto-join after instant create (skips can-join validate). */
export const setTalkRoomAutoJoinFlag = (roomId: string) => {
	if (typeof window === 'undefined' || !roomId) return
	sessionStorage.setItem(TALK_ROOM_AUTO_JOIN_STORAGE_KEY, roomId)
}

/** Returns true once when auto-join flag matches the current room id. */
export const consumeTalkRoomAutoJoinFlag = (roomId: string) => {
	if (typeof window === 'undefined' || !roomId) return false

	const flaggedRoomId = sessionStorage.getItem(TALK_ROOM_AUTO_JOIN_STORAGE_KEY)
	if (flaggedRoomId !== roomId) return false

	sessionStorage.removeItem(TALK_ROOM_AUTO_JOIN_STORAGE_KEY)
	return true
}

export type RoomEndStatus =
	| 'none'
	| 'sessionEnd'
	| 'timeUp'
	| 'notActive'
	| 'forceClosed'

export type ForceRoomCloseOptions = {
	roomEndStatus: Exclude<RoomEndStatus, 'none'>
	callLeaveRoom: boolean
}

/** Parses room_time_up socket payload when the room status is ended. */
export const parseTalkRoomSocketRoomTimeUp = (
	data?: unknown,
): { reason: string } | null => {
	if (!data || typeof data !== 'object') return null

	const payload = data as Record<string, unknown>
	const actionDetails = payload.action_details as
		| Record<string, unknown>
		| undefined
	const roomInfo = actionDetails?.room_info as
		| Record<string, unknown>
		| undefined

	const status = String(
		payload.status ?? roomInfo?.status ?? actionDetails?.status ?? '',
	).toLowerCase()

	if (status !== 'ended') return null

	const reason = String(
		payload.reason ?? actionDetails?.reason ?? 'NONE',
	).toUpperCase()

	return { reason }
}

/** Returns remaining seconds in the post-live chat window. */
export const getTalkRoomSessionEndSecondsLeft = (
	sessionEndStartedAtMs: number | null,
) => {
	if (!sessionEndStartedAtMs) {
		return TALK_ROOM_SESSION_END_DURATION_SECONDS
	}

	const elapsed = Math.floor((Date.now() - sessionEndStartedAtMs) / 1000)

	return Math.max(0, TALK_ROOM_SESSION_END_DURATION_SECONDS - elapsed)
}

export const isTalkRoomCountSessionEndVisible = (
	roomEndStatus: RoomEndStatus,
) => roomEndStatus === 'sessionEnd'

/** Resolves the talk room chat conversation id (mirrors mobile currentConversationId). */
export const getTalkRoomConversationId = (
	detail?:
		| (Pick<TalkRoomRoom, 'schedules'> & {
				conversation_id?: string | null
		  })
		| null,
): string => {
	if (!detail) return ''

	if (detail.conversation_id) return detail.conversation_id

	const scheduleConversationId = detail.schedules?.find(
		(schedule) => schedule.conversation_id,
	)?.conversation_id

	return scheduleConversationId ?? ''
}

export const TALK_ROOM_EARLY_ACCESS_MINUTES = 10

const TALK_ROOM_EARLY_ACCESS_SECONDS = TALK_ROOM_EARLY_ACCESS_MINUTES * 60

/** Returns the next pending schedule time (matches mobile pendingNextSchedule). */
export const getTalkRoomPendingNextSchedule = (
	room?: TalkRoomRoom,
): string | null => {
	if (!room) return null

	const pendingScheduleTimes = (room.schedules || [])
		.filter(
			(schedule) =>
				schedule.enabled !== false &&
				schedule.status === 'pending' &&
				!!schedule.schedule_at,
		)
		.map((schedule) => schedule.schedule_at as string)
		.filter((scheduleAt) => dayjs(scheduleAt).isValid())
		.sort((a, b) => dayjs(a).valueOf() - dayjs(b).valueOf())

	if (pendingScheduleTimes.length > 0) {
		const nextFuture = pendingScheduleTimes.find((scheduleAt) =>
			dayjs(scheduleAt).isAfter(dayjs()),
		)
		return nextFuture ?? pendingScheduleTimes[0]
	}

	if (room.next_schedule_at && dayjs(room.next_schedule_at).isValid()) {
		return room.next_schedule_at
	}

	return null
}

export const getTalkRoomScheduledStartAt = (room?: TalkRoomRoom) => {
	const pendingNext = getTalkRoomPendingNextSchedule(room)
	if (pendingNext) return pendingNext

	return room?.started_at ?? room?.next_schedule_at ?? null
}

/** schedule_at from the live schedule entry (when room status is already live). */
const getTalkRoomLiveScheduleAt = (room?: TalkRoomRoom) => {
	const liveSchedule = (room?.schedules || []).find(
		(schedule) =>
			schedule.status === 'live' &&
			!!schedule.schedule_at &&
			dayjs(schedule.schedule_at).isValid(),
	)

	return liveSchedule?.schedule_at ?? null
}

/** Anchor time for countWaiting (pendingNextSchedule ?? live schedule ?? startedAt ?? createdAt). */
export const getTalkRoomCountWaitingAnchorAt = (room?: TalkRoomRoom) => {
	return (
		getTalkRoomLiveScheduleAt(room) ??
		getTalkRoomPendingNextSchedule(room) ??
		room?.started_at ??
		room?.created_at ??
		null
	)
}

/**
 * countWaiting: after room_went_live, before room_start_countdown.
 * remainTime = maxDuration - |anchor - now|; if < 0 → fallback 10s.
 */
export const getTalkRoomCountWaitingSecondsLeft = (room?: TalkRoomRoom) => {
	const maxDuration =
		room?.max_duration_seconds ?? TALK_ROOM_DEFAULT_MAX_DURATION_SECONDS
	const anchorAt = getTalkRoomCountWaitingAnchorAt(room)

	if (!anchorAt) return maxDuration

	const elapsed = Math.abs(dayjs(anchorAt).diff(dayjs(), 'second'))
	let remainTime = maxDuration - elapsed

	if (remainTime < 0) {
		remainTime = TALK_ROOM_COUNT_WAITING_MIN_SECONDS
	}

	return Math.max(0, Math.floor(remainTime))
}

/** countWaiting phase: live room waiting for session countdown to start. */
export const isTalkRoomCountWaitingVisible = (room?: TalkRoomRoom) => {
	if (!room || !isTalkRoomLive(room.status)) return false
	if (room.count_down_at) return false

	return getTalkRoomCountWaitingSecondsLeft(room) > 0
}

/**
 * countRoomLive: after room_start_countdown (host toggles mic on).
 * Prefer server time_left_in_seconds; fallback to count_down_at + max_duration.
 */
export const getTalkRoomCountRoomLiveSecondsLeft = (room?: TalkRoomRoom) => {
	if (!room?.count_down_at) return 0

	if (room.time_left_in_seconds != null && room.time_left_in_seconds >= 0) {
		return Math.floor(room.time_left_in_seconds)
	}

	const maxDuration =
		room.max_duration_seconds ?? TALK_ROOM_DEFAULT_MAX_DURATION_SECONDS
	const elapsed = Math.max(0, dayjs().diff(dayjs(room.count_down_at), 'second'))

	return Math.max(0, Math.floor(maxDuration - elapsed))
}

/** countRoomLive phase: live session countdown after host starts mic. */
export const isTalkRoomCountRoomLiveVisible = (room?: TalkRoomRoom) => {
	if (!room || !isTalkRoomLive(room.status)) return false
	if (!room.count_down_at) return false

	return getTalkRoomCountRoomLiveSecondsLeft(room) > 0
}

export type HostMicState = 'disabled' | 'off' | 'on'

export const getTalkRoomListenerCount = (room?: TalkRoomRoom) => {
	const total = room?.total_participants ?? 0
	const speakerCount = room?.speakers?.length ?? 0

	return Math.max(0, total - speakerCount)
}

export const isTalkRoomListenerEmpty = (room?: TalkRoomRoom) => {
	return getTalkRoomListenerCount(room) === 0
}

export const getHostSpeaker = (room?: TalkRoomRoom) => {
	return (
		room?.speakers?.find((speaker) => speaker?.role === 'host') ??
		(room?.host_user
			? {
					id: room.host_user.id,
					name: room.host_user.name,
					avatar: room.host_user.avatar,
					i_am_from: room.host_user.i_am_from,
					role: 'host',
				}
			: undefined)
	)
}

/** Active in-room host (stage host slot), not merely the room creator. */
export const isCurrentUserTalkRoomHost = (
	room?: TalkRoomRoom,
	userId?: string,
): boolean => {
	if (!userId) return false

	if (room?.yourAreHost === true) return true
	if (room?.youAreListener === true || room?.isUserSpeaker === true) {
		return false
	}

	const hostUserId = resolveSpeakerUserId(getHostSpeaker(room))

	return hostUserId != null && hostUserId === userId
}

/** Whether the current user is a listener per room detail flags. */
export const isCurrentUserTalkRoomListener = (room?: TalkRoomRoom): boolean => {
	return room?.youAreListener === true
}

/** Whether the room has at least one guest speaker on stage (role === speaker). */
export const hasTalkRoomAnotherSpeaker = (room?: TalkRoomRoom) => {
	return (room?.speakers ?? []).some((speaker) => speaker?.role === 'speaker')
}

/** Parses host_transferred / speaker_auto_pushed_to_host socket payloads. */
export const parseTalkRoomSocketHostTransferred = (
	data?: unknown,
): { previousUserId?: string; newHostId?: string } | null => {
	if (!data || typeof data !== 'object') return null

	const payload = data as Record<string, unknown>
	const actionDetails = (payload.action_details ??
		payload.actionDetail ??
		payload.action_detail) as Record<string, unknown> | undefined

	if (!actionDetails) return null

	const previousUserId =
		(actionDetails.previous_user_id as string | undefined) ??
		(actionDetails.previousUserId as string | undefined)
	const newHostId =
		(actionDetails.new_host_id as string | undefined) ??
		(actionDetails.newHostId as string | undefined)

	if (!previousUserId && !newHostId) return null

	return { previousUserId, newHostId }
}

export const getHostMicState = (
	room?: TalkRoomRoom,
	options?: { isHost?: boolean },
): HostMicState => {
	if (!options?.isHost) return 'disabled'

	if (!isTalkRoomLive(room?.status)) return 'disabled'

	if ((room?.total_participants ?? 0) < 2) return 'disabled'

	const hostSpeaker = getHostSpeaker(room)
	if (hostSpeaker?.is_open_mic === true) return 'on'

	return 'off'
}

/** Be speaker button state for listeners — listeners may raise hand even when slots are full. */
export const getListenerBeSpeakerState = (
	room?: TalkRoomRoom,
	options?: { isListener?: boolean },
): HostMicState => {
	if (!options?.isListener) return 'disabled'

	if (isTalkRoomCountWaitingVisible(room)) return 'off'

	if (!isTalkRoomLive(room?.status)) return 'disabled'

	if ((room?.total_participants ?? 0) < 2) return 'disabled'

	return 'off'
}

/** Whether current user is a guest speaker on the stage (from room detail). */
export const isCurrentUserGuestSpeaker = (
	room?: TalkRoomRoom,
	userId?: string,
): boolean => {
	if (!userId) return false

	return (room?.speakers ?? []).some(
		(speaker) =>
			speaker?.role === 'speaker' &&
			(speaker?.id === userId ||
				(speaker as { user_id?: string })?.user_id === userId),
	)
}

/** Mic state for guest speaker — same enable rules as host mic. */
export const getSpeakerMicState = (
	room?: TalkRoomRoom,
	options?: { isSpeaker?: boolean; userId?: string },
): HostMicState => {
	if (!options?.isSpeaker) return 'disabled'

	if (!isTalkRoomLive(room?.status)) return 'disabled'

	if ((room?.total_participants ?? 0) < 2) return 'disabled'

	const mySpeaker = room?.speakers?.find(
		(speaker) =>
			speaker?.id === options.userId ||
			(speaker as { user_id?: string })?.user_id === options.userId,
	)
	if (mySpeaker?.is_open_mic === true) return 'on'

	return 'off'
}

/**
 * Resolves guest speaker slot for raise_hand — mirrors mobile Be speaker logic.
 * Default slot 1; if taken and another slot is free, use slot 2 (or vice versa).
 */
export const resolveRaiseHandSlotId = (
	room?: TalkRoomRoom,
	preferredSlot = 1,
): number => {
	const maxSpeakers = room?.max_speakers ?? 2
	const slots = buildTalkRoomSpeakerSlots(room, maxSpeakers)
	const guestSlots = slots.filter((slot) => !slot.isHost)

	const hasEmptySlot = guestSlots.some((slot) => slot.type === 'empty')
	if (!hasEmptySlot) return preferredSlot

	const preferredGuestSlot = guestSlots[preferredSlot - 1]
	if (preferredGuestSlot?.type === 'filled') {
		return preferredSlot === 2 ? 1 : 2
	}

	return preferredSlot
}

export const getTalkRoomSocketTargetUserId = (
	data?: unknown,
): string | undefined => {
	if (!data || typeof data !== 'object') return undefined

	const payload = data as Record<string, unknown>
	const actionDetails = payload.action_details as
		| Record<string, unknown>
		| undefined
	const userInfo = payload.user_info as Record<string, unknown> | undefined

	return (
		(payload.user_id as string | undefined) ??
		(payload.target_id as string | undefined) ??
		(actionDetails?.user_id as string | undefined) ??
		(userInfo?.id as string | undefined)
	)
}

/** Parses leave reason from `user_left_room` socket payload. */
export const getTalkRoomSocketLeaveReason = (
	data?: unknown,
): string | undefined => {
	if (!data || typeof data !== 'object') return undefined

	const payload = data as Record<string, unknown>
	const actionDetails = payload.action_details as
		| Record<string, unknown>
		| undefined

	return (
		(actionDetails?.leave_reason as string | undefined) ??
		(actionDetails?.leaveReason as string | undefined) ??
		(payload.leave_reason as string | undefined) ??
		(payload.leaveReason as string | undefined)
	)
}

/** Whether socket leave reason indicates the user was kicked from the room. */
export const isTalkRoomSocketLeaveReasonKicked = (
	leaveReason?: string,
): boolean => {
	if (!leaveReason) return false

	return leaveReason.toUpperCase() === 'KICKED'
}

export type TalkRoomPreJoinValidation = ValidatePreTalkroomModel & {
	isRejoin: boolean
}

/** Whether pre-join validation blocked the user because they were kicked. */
export const isTalkRoomPreJoinBlockedByKick = (
	data?: ValidatePreTalkroomModel | null,
): boolean => data?.reason === TALK_ROOM_JOIN_REASON.USER_KICKED

/** Parses can-join API payload into a join decision model (null when blocked/kicked). */
export const parseTalkRoomValidatePreJoin = (
	data?: ValidatePreTalkroomModel | null,
): TalkRoomPreJoinValidation | null => {
	if (!data || isTalkRoomPreJoinBlockedByKick(data)) return null

	return {
		...data,
		isRejoin: data.reason === TALK_ROOM_JOIN_REASON.USER_ALREADY_JOINED,
	}
}

/** Whether the client may proceed to join after pre-join validation. */
export const canProceedTalkRoomJoin = (
	validation: TalkRoomPreJoinValidation,
): boolean =>
	validation.canJoin === true ||
	validation.isRejoin === true ||
	validation.reason === TALK_ROOM_JOIN_REASON.HOST_NOT_JOINED

export const isTalkRoomSocketEventForCurrentUser = (
	data?: unknown,
	currentUserId?: string,
): boolean => {
	if (!currentUserId) return true

	const targetUserId = getTalkRoomSocketTargetUserId(data)
	if (!targetUserId) return true

	return targetUserId === currentUserId
}

export const getTalkRoomScheduleRemainSeconds = (
	scheduledAt?: string | null,
) => {
	if (!scheduledAt) return null
	const scheduled = dayjs(scheduledAt)
	if (!scheduled.isValid()) return null
	return scheduled.diff(dayjs(), 'second')
}

export const isTalkRoomScheduledStartTimePassed = (
	scheduledAt?: string | null,
) => {
	if (!scheduledAt) return false
	const scheduled = dayjs(scheduledAt)
	if (!scheduled.isValid()) return false
	return !dayjs().isBefore(scheduled)
}

export const isTalkRoomWithinEarlyAccessWindow = (
	scheduledAt?: string | null,
) => {
	if (!scheduledAt) return false
	const scheduled = dayjs(scheduledAt)
	if (!scheduled.isValid()) return false
	const windowStart = scheduled.subtract(
		TALK_ROOM_EARLY_ACCESS_MINUTES,
		'minute',
	)
	return !dayjs().isBefore(windowStart)
}

export const isTalkRoomLive = (status?: string) => status === 'live'

export const isTalkRoomLiveWithHostJoined = (room?: TalkRoomRoom) => {
	return isTalkRoomLive(room?.status) && room?.host_joined === true
}

/** Live room created but host has not entered yet (matches mobile _buildJoinStatus). */
export const isTalkRoomLiveWaitingForHostToJoin = (room?: TalkRoomRoom) => {
	return isTalkRoomLive(room?.status) && room?.host_joined === false
}

export const isTalkRoomNoScheduleRoom = (room?: TalkRoomRoom) =>
	room?.type === 'NO_SCHEDULE'

/** Scheduled room within 10 minutes before start (mobile isRoomScheduleJoinBeforeLive). */
export const isTalkRoomScheduleJoinBeforeLive = (room?: TalkRoomRoom) => {
	if (isTalkRoomLive(room?.status)) return false

	const scheduledAt =
		getTalkRoomPendingNextSchedule(room) ?? getTalkRoomScheduledStartAt(room)
	const remainSeconds = getTalkRoomScheduleRemainSeconds(scheduledAt)
	if (remainSeconds === null) return false

	return remainSeconds >= 0 && remainSeconds <= TALK_ROOM_EARLY_ACCESS_SECONDS
}

/** Show host avatar fallback when speakers list is empty (mobile isShowHostWhenEmpty). */
export const shouldShowHostAvatarWhenEmpty = (room?: TalkRoomRoom) => {
	return (
		!isTalkRoomLive(room?.status) && !isTalkRoomScheduleJoinBeforeLive(room)
	)
}

/** @deprecated Use isTalkRoomScheduledStartTimePassed */
export const isTalkRoomStartTimeReached = isTalkRoomScheduledStartTimePassed

export const isTalkRoomHostCanStart = (room?: TalkRoomRoom) => {
	const scheduledAt = getTalkRoomScheduledStartAt(room)
	const remainSeconds = getTalkRoomScheduleRemainSeconds(scheduledAt)

	if (
		room?.is_your_room !== true ||
		room?.host_joined === true ||
		remainSeconds === null ||
		isTalkRoomLive(room?.status)
	) {
		return false
	}

	if (remainSeconds < 0) return true

	return remainSeconds >= 0 && remainSeconds <= TALK_ROOM_EARLY_ACCESS_SECONDS
}

export const isTalkRoomHostWaiting = (room?: TalkRoomRoom) => {
	const scheduledAt = getTalkRoomScheduledStartAt(room)
	const remainSeconds = getTalkRoomScheduleRemainSeconds(scheduledAt)

	return (
		room?.is_your_room === true &&
		room?.host_joined === false &&
		!isTalkRoomLive(room?.status) &&
		remainSeconds !== null &&
		remainSeconds > TALK_ROOM_EARLY_ACCESS_SECONDS
	)
}

export const isTalkRoomGuestCanJoinEarly = (room?: TalkRoomRoom) => {
	const scheduledAt = getTalkRoomScheduledStartAt(room)
	const remainSeconds = getTalkRoomScheduleRemainSeconds(scheduledAt)

	return (
		room?.is_your_room !== true &&
		room?.host_joined === false &&
		remainSeconds !== null &&
		remainSeconds > 0 &&
		remainSeconds <= TALK_ROOM_EARLY_ACCESS_SECONDS
	)
}

export const isTalkRoomWaitingForHost = (room?: TalkRoomRoom) => {
	const scheduledAt = getTalkRoomScheduledStartAt(room)
	const remainSeconds = getTalkRoomScheduleRemainSeconds(scheduledAt)

	return (
		room?.is_your_room !== true &&
		room?.host_joined === false &&
		remainSeconds !== null &&
		remainSeconds <= 0
	)
}

export const formatTalkRoomWaitingCount = (room?: TalkRoomRoom) => {
	const total = room?.total_participants ?? 0
	const max = room?.max_participants ?? 0
	return `${total}/${max}`
}

export const isTalkRoomUserNotified = (room?: TalkRoomRoom | null) =>
	room?.user_notified === true

export const getTalkRoomNotifyButtonLabel = (room?: TalkRoomRoom | null) =>
	isTalkRoomUserNotified(room) ? 'Notify on' : 'Notify me'

export const getTalkRoomStartTimeDisplay = (room?: TalkRoomRoom) => {
	return formatTalkRoomSchedule(getTalkRoomScheduledStartAt(room))
}

export const formatTalkRoomLevelLabel = (level?: string) => {
	if (!level) return ''
	return level.charAt(0).toUpperCase() + level.slice(1)
}

export const getTalkRoomPrimaryTopic = (categories?: TalkRoomCategory[]) => {
	return categories?.[0]?.category_details?.name || ''
}

export const getTalkRoomCategoryLabels = (categories?: TalkRoomCategory[]) => {
	return (categories || [])
		.map((category) => category?.category_details?.name)
		.filter(Boolean) as string[]
}

export const formatTalkRoomCategoriesText = (
	categories?: TalkRoomCategory[],
) => {
	return getTalkRoomCategoryLabels(categories).join(', ')
}

/** Format hosting seconds for leaderboard display (e.g. 98K min). */
export const formatHostMinutes = (seconds?: number) => {
	if (!seconds || seconds <= 0) return '0 min'

	const mins = Math.floor(seconds / 60)
	if (mins >= 1000) return `${Math.round(mins / 1000)}K min`

	return `${mins} min`
}

export const filterTalkRoomsByKeyword = (
	rooms: TalkRoomRoom[],
	keyword?: string,
) => {
	const search = keyword?.trim().toLowerCase()
	if (!search) return rooms

	return rooms.filter((room) => {
		const name = room?.name?.toLowerCase() || ''
		const hostName =
			room?.host_user?.name?.toLowerCase() ||
			room?.created_by_user?.name?.toLowerCase() ||
			''
		const topics = formatTalkRoomCategoriesText(room?.categories).toLowerCase()

		return (
			name.includes(search) ||
			hostName.includes(search) ||
			topics.includes(search)
		)
	})
}

export const formatTalkRoomCmiText = (
	cmiUsers?: TalkRoomSpeaker[],
	totalCmi?: number,
) => {
	const total = totalCmi ?? 0
	if (total <= 0) return ''

	const names = (cmiUsers || [])
		.map((user) => user?.name)
		.filter(Boolean) as string[]

	if (!names.length) {
		return total === 1
			? '1 person plans to join'
			: `${total} people plan to join`
	}

	if (total > 3) {
		const namesText = names.slice(0, 3).join(', ')
		const othersCount = total - 3
		const othersLabel = othersCount === 1 ? '1 other' : `${othersCount} others`
		return `${namesText} and ${othersLabel} plan to join`
	}

	const displayNames = names.slice(0, total)
	const namesText = displayNames.join(', ')
	return displayNames.length === 1
		? `${namesText} plans to join`
		: `${namesText} plan to join`
}

export type TalkRoomLiveParticipantsDisplay = {
	highlight: string
	regular: string
}

export const formatTalkRoomLiveParticipantsText = (
	room?: TalkRoomRoom,
): TalkRoomLiveParticipantsDisplay => {
	const speakers = room?.speakers ?? []
	const names = speakers
		.map((speaker) => speaker?.name)
		.filter(Boolean)
		.slice(0, 3) as string[]
	const total = room?.total_participants ?? names.length
	const othersCount = Math.max(total - names.length, 0)

	if (!names.length) {
		return {
			highlight: 'Live',
			regular: ` ${total}/${room?.max_participants ?? 0}`,
		}
	}

	const namesText = names.join(', ')
	if (othersCount <= 0) {
		return {
			highlight: namesText,
			regular: names.length === 1 ? ' is in the room' : ' are in the room',
		}
	}

	const othersLabel = othersCount === 1 ? '1 other' : `${othersCount} others`
	return {
		highlight: namesText,
		regular: ` and ${othersLabel} are in the room`,
	}
}

const talkRoomCountryNameByCode = CountriesOptions.reduce<
	Record<string, string>
>((acc, country) => {
	acc[country.code] = country.name
	return acc
}, {})

export const getTalkRoomCountryName = (code?: string) => {
	if (!code) return ''
	return talkRoomCountryNameByCode[code] || code
}

export type TalkRoomSpeakerSlotType = 'empty' | 'filled'

export type TalkRoomFilledSpeaker = {
	id?: string
	name?: string
	avatar?: string
	i_am_from?: string
	is_open_mic?: boolean
	is_talking?: boolean
	role?: string
}

/** Resolves speaker user id from room detail speaker entry. */
export const resolveSpeakerUserId = (
	speaker?: { id?: string; user_id?: string } | null,
): string | undefined => speaker?.id ?? speaker?.user_id

/** Merges realtime socket overrides into a speaker slot model. */
export const mergeSpeakerLiveStatus = (
	speaker?: TalkRoomFilledSpeaker,
	overrides?: TalkRoomSpeakerLiveStatus,
): TalkRoomFilledSpeaker | undefined => {
	if (!speaker) return speaker

	return {
		...speaker,
		...(overrides?.is_open_mic !== undefined
			? { is_open_mic: overrides.is_open_mic }
			: {}),
		...(overrides?.is_talking !== undefined
			? { is_talking: overrides.is_talking }
			: {}),
	}
}

/** Maps speaker mic/talking state to the status icon shown beside the name. */
export const getSpeakerMicStatusIcon = (
	speaker?: TalkRoomFilledSpeaker,
): TalkRoomSpeakerMicStatusIcon | null => {
	if (!speaker) return null

	if (speaker.is_open_mic !== true) return 'mic-off'
	if (speaker.is_talking) return 'talking'

	return 'mic-on'
}

/** Reads is_talking from a talk room socket payload. */
export const getTalkRoomSocketTalkingStatus = (
	data?: unknown,
): boolean | undefined => {
	if (!data || typeof data !== 'object') return undefined

	const payload = data as Record<string, unknown>
	const actionDetails = payload.action_details as
		| Record<string, unknown>
		| undefined

	if (typeof payload.is_talking === 'boolean') return payload.is_talking

	const nestedTalking = actionDetails?.is_talking
	if (typeof nestedTalking === 'boolean') return nestedTalking

	return undefined
}

export type TalkRoomSpeakerSlot = {
	key: string
	type: TalkRoomSpeakerSlotType
	isHost: boolean
	label: string
	speaker?: TalkRoomFilledSpeaker
}

/** Builds speaker stage slots with host always first, then guest speaker slots. */
export const buildTalkRoomSpeakerSlots = (
	room?: TalkRoomRoom,
	maxSpeakers = 2,
	speakerStatusMap?: TalkRoomSpeakerStatusMap,
): TalkRoomSpeakerSlot[] => {
	const speakers = room?.speakers ?? []
	const hostSpeaker =
		speakers.find((speaker) => speaker?.role === 'host') ??
		(room?.host_user
			? {
					id: room.host_user.id,
					name: room.host_user.name,
					avatar: room.host_user.avatar,
					i_am_from: room.host_user.i_am_from,
					role: 'host',
					is_open_mic: false,
				}
			: undefined)
	const guestSpeakers = speakers.filter(
		(speaker) => speaker?.role === 'speaker',
	)
	const withLiveStatus = (speaker?: TalkRoomFilledSpeaker) => {
		const userId = resolveSpeakerUserId(speaker)
		if (!speaker || !userId) return speaker

		return mergeSpeakerLiveStatus(speaker, speakerStatusMap?.[userId])
	}

	const slots: TalkRoomSpeakerSlot[] = [
		{
			key: 'host',
			type: hostSpeaker ? 'filled' : 'empty',
			isHost: true,
			label: 'Host',
			speaker: withLiveStatus(hostSpeaker),
		},
	]

	for (let i = 0; i < maxSpeakers; i++) {
		const speaker = guestSpeakers[i]

		slots.push({
			key: `speaker-${i + 1}`,
			type: speaker ? 'filled' : 'empty',
			isHost: false,
			label: `Speaker ${i + 1}`,
			speaker: withLiveStatus(speaker),
		})
	}

	return slots
}

/** Whether at least one guest speaker slot is empty. */
export const hasTalkRoomEmptyGuestSpeakerSlot = (
	room?: TalkRoomRoom,
): boolean => {
	const maxSpeakers = room?.max_speakers ?? 2
	const slots = buildTalkRoomSpeakerSlots(room, maxSpeakers)

	return slots.some((slot) => !slot.isHost && slot.type === 'empty')
}

/** Whether all guest speaker slots are occupied. */
export const isTalkRoomGuestSpeakerSlotsFull = (room?: TalkRoomRoom): boolean =>
	!hasTalkRoomEmptyGuestSpeakerSlot(room)

export type TalkRoomSlotRaiseHandMap = Record<number, string[]>

const TALK_ROOM_RAISE_HAND_SLOTS = [1, 2] as const

/** Flattens per-slot raise hand map into unique user ids. */
export const flattenTalkRoomSlotRaiseHand = (
	slotMap: TalkRoomSlotRaiseHandMap,
): string[] => {
	const ids = new Set<string>()

	for (const slot of TALK_ROOM_RAISE_HAND_SLOTS) {
		for (const userId of slotMap[slot] ?? []) {
			if (userId) ids.add(userId)
		}
	}

	return Array.from(ids)
}

/** Total listeners waiting with raised hand across all guest slots. */
export const getTalkRoomTotalRaiseHand = (
	slotMap: TalkRoomSlotRaiseHandMap,
): number => flattenTalkRoomSlotRaiseHand(slotMap).length

/** Builds per-slot raise hand map from raised-hands API rows. */
export const buildTalkRoomSlotRaiseHandFromRows = (
	rows: Array<{
		user_id?: string
		user?: { id?: string }
		slot_id?: number
		slotId?: number
	}>,
): TalkRoomSlotRaiseHandMap => {
	const slotMap: TalkRoomSlotRaiseHandMap = { 1: [], 2: [] }

	for (const row of rows) {
		const userId = row.user_id ?? row.user?.id
		if (!userId) continue

		const slotId = row.slot_id ?? row.slotId ?? 1
		if (slotId !== 1 && slotId !== 2) continue

		if (!slotMap[slotId].includes(userId)) {
			slotMap[slotId].push(userId)
		}
	}

	return slotMap
}

/** Adds a user to a guest speaker slot raise-hand queue. */
export const addTalkRoomSlotRaiseHand = (
	slotMap: TalkRoomSlotRaiseHandMap,
	userId: string,
	slotIndex = 1,
): TalkRoomSlotRaiseHandMap => {
	const slot = slotIndex === 2 ? 2 : 1
	const next: TalkRoomSlotRaiseHandMap = {
		1: (slotMap[1] ?? []).filter((id) => id !== userId),
		2: (slotMap[2] ?? []).filter((id) => id !== userId),
	}

	if (!next[slot].includes(userId)) {
		next[slot] = [...next[slot], userId]
	}

	return next
}

/** Removes a user from all raise-hand slot queues. */
export const removeTalkRoomSlotRaiseHand = (
	slotMap: TalkRoomSlotRaiseHandMap,
	userId: string,
): TalkRoomSlotRaiseHandMap => ({
	1: (slotMap[1] ?? []).filter((id) => id !== userId),
	2: (slotMap[2] ?? []).filter((id) => id !== userId),
})

/** Raise-hand user ids for filter mode (all slots or one slot). */
export const getTalkRoomFilterRaiseHandIds = (
	slotMap: TalkRoomSlotRaiseHandMap,
	filterSlot: number | null,
): string[] => {
	if (filterSlot === 1 || filterSlot === 2) {
		return slotMap[filterSlot] ?? []
	}

	return flattenTalkRoomSlotRaiseHand(slotMap)
}

/** Sorts listeners so raised-hand users appear first. */
export const sortTalkRoomListenersByRaiseHand = <
	T extends { user_id?: string },
>(
	listeners: T[],
	raiseHandUserIds: string[],
): T[] => {
	if (raiseHandUserIds.length === 0) return listeners

	const raisedSet = new Set(raiseHandUserIds)

	return [...listeners].sort((a, b) => {
		const aRaised = raisedSet.has(a.user_id ?? '')
		const bRaised = raisedSet.has(b.user_id ?? '')

		if (aRaised && !bRaised) return -1
		if (!aRaised && bRaised) return 1

		return 0
	})
}

/** Parses guest speaker slot index from talk room socket payloads. */
export const getTalkRoomSocketSlotId = (
	data?: unknown,
	defaultSlot = 1,
): number => {
	if (!data || typeof data !== 'object') return defaultSlot

	const payload = data as Record<string, unknown>
	const actionDetails = payload.action_details as
		| Record<string, unknown>
		| undefined
	const raw =
		actionDetails?.slot_id ??
		actionDetails?.slotId ??
		payload.slot_id ??
		payload.slotId

	const slot = Number(raw)

	return slot === 2 ? 2 : 1
}

/** Parses invite id from socket payloads (`host_invite_to_speaker`, etc.). */
export const getTalkRoomSocketInviteId = (
	data?: unknown,
): string | undefined => {
	if (!data || typeof data !== 'object') return undefined

	const payload = data as Record<string, unknown>
	const actionDetails = payload.action_details as
		| Record<string, unknown>
		| undefined

	return (
		(payload.id as string | undefined) ??
		(payload.invite_id as string | undefined) ??
		(actionDetails?.invite_id as string | undefined) ??
		(actionDetails?.id as string | undefined)
	)
}

/** Parses invited listener id from invite socket payloads (`host_invite_to_speaker`). */
export const getTalkRoomSocketInviteTargetUserId = (
	data?: unknown,
): string | undefined => {
	if (!data || typeof data !== 'object') return undefined

	const payload = data as Record<string, unknown>
	const actionDetails = payload.action_details as
		| Record<string, unknown>
		| undefined

	return (
		(payload.target_id as string | undefined) ??
		(payload.targetId as string | undefined) ??
		(actionDetails?.target_id as string | undefined) ??
		(actionDetails?.targetId as string | undefined)
	)
}

/** Parses host invite-to-speaker socket payload. */
export const parseTalkRoomSocketSpeakerInvite = (
	data?: unknown,
): { inviteId: string; targetUserId: string } | null => {
	const inviteId = getTalkRoomSocketInviteId(data)
	const targetUserId = getTalkRoomSocketInviteTargetUserId(data)

	if (!inviteId || !targetUserId) return null

	return { inviteId, targetUserId }
}

/** Parses display name from talk room socket user_info payload. */
export const getTalkRoomSocketUserName = (
	data?: unknown,
): string | undefined => {
	if (!data || typeof data !== 'object') return undefined

	const payload = data as Record<string, unknown>
	const userInfo = payload.user_info as Record<string, unknown> | undefined

	return (userInfo?.name as string | undefined) ?? undefined
}

/** Guest speaker user id for stage slot 1 or 2 (1-indexed). */
export const getTalkRoomGuestSpeakerUserIdBySlot = (
	room?: TalkRoomRoom,
	slotId: 1 | 2 = 1,
) => {
	const maxSpeakers = room?.max_speakers ?? 2
	const slots = buildTalkRoomSpeakerSlots(room, maxSpeakers)
	const guestSlots = slots.filter((slot) => !slot.isHost)

	return resolveSpeakerUserId(guestSlots[slotId - 1]?.speaker)
}

/** Guest speaker slot options for transfer-host modal. */
export const getTalkRoomTransferHostSpeakerOptions = (
	room?: TalkRoomRoom,
): {
	slotId: 1 | 2
	label: string
	disabled: boolean
	userId?: string
}[] => {
	const maxSpeakers = room?.max_speakers ?? 2
	const slots = buildTalkRoomSpeakerSlots(room, maxSpeakers)

	return slots
		.filter((slot) => !slot.isHost)
		.map((slot, index) => ({
			slotId: (index + 1) as 1 | 2,
			label: `Assign to speaker ${index + 1}`,
			disabled: slot.type === 'empty',
			userId: resolveSpeakerUserId(slot.speaker),
		}))
}

export const buildEmptyTalkRoomSpeakerSlots = (
	maxSpeakers = 2,
): TalkRoomSpeakerSlot[] => buildTalkRoomSpeakerSlots(undefined, maxSpeakers)
