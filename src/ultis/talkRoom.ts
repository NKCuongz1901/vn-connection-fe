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

	const names = friends.map((friend) => friend?.name).filter(Boolean) as string[]

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

	return (
		remainSeconds >= 0 && remainSeconds <= TALK_ROOM_EARLY_ACCESS_SECONDS
	)
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

	return (
		remainSeconds >= 0 && remainSeconds <= TALK_ROOM_EARLY_ACCESS_SECONDS
	)
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

const talkRoomCountryNameByCode = CountriesOptions.reduce<Record<string, string>>(
	(acc, country) => {
		acc[country.code] = country.name
		return acc
	},
	{},
)

export const getTalkRoomCountryName = (code?: string) => {
	if (!code) return ''
	return talkRoomCountryNameByCode[code] || code
}

export type TalkRoomSpeakerSlotType = 'empty' | 'filled'

export type TalkRoomSpeakerSlot = {
	key: string
	type: TalkRoomSpeakerSlotType
	isHost: boolean
	label: string
}

export const buildEmptyTalkRoomSpeakerSlots = (
	maxSpeakers = 2,
): TalkRoomSpeakerSlot[] => {
	const slots: TalkRoomSpeakerSlot[] = [
		{ key: 'host', type: 'empty', isHost: true, label: 'Host' },
	]

	for (let i = 0; i < maxSpeakers; i++) {
		slots.push({
			key: `speaker-${i + 1}`,
			type: 'empty',
			isHost: false,
			label: `Speaker ${i + 1}`,
		})
	}

	return slots
}
