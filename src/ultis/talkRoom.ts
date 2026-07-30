import dayjs from 'dayjs'

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
}

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
	role?: string
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

	const slots: TalkRoomSpeakerSlot[] = [
		{
			key: 'host',
			type: hostSpeaker ? 'filled' : 'empty',
			isHost: true,
			label: 'Host',
			speaker: hostSpeaker,
		},
	]

	for (let i = 0; i < maxSpeakers; i++) {
		const speaker = guestSpeakers[i]

		slots.push({
			key: `speaker-${i + 1}`,
			type: speaker ? 'filled' : 'empty',
			isHost: false,
			label: `Speaker ${i + 1}`,
			speaker,
		})
	}

	return slots
}

export const buildEmptyTalkRoomSpeakerSlots = (
	maxSpeakers = 2,
): TalkRoomSpeakerSlot[] => buildTalkRoomSpeakerSlots(undefined, maxSpeakers)
