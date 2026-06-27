import dayjs from 'dayjs'

export type TalkRoomAvatarLayout = 'single' | 'double' | 'triple'

export type TalkRoomSpeaker = {
	id?: string
	name?: string
	avatar?: string
	role?: string
	talking_time?: number
	i_am_from?: string
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

export type TalkRoomRoom = {
	id?: string
	name?: string
	status?: string
	speakers?: TalkRoomSpeaker[]
	created_by_user?: TalkRoomSpeaker
	total_participants?: number
	max_participants?: number
	next_schedule_at?: string | null
	started_at?: string | null
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
}

export const getSpeakerAvatar = (speaker?: TalkRoomSpeaker) => speaker?.avatar

const getSpeakersForDisplay = (room?: TalkRoomRoom) => {
	const speakers = room?.speakers ?? []
	if (speakers.length > 0) return speakers
	if (isTalkRoomLive(room?.status)) return []
	if (room?.created_by_user) return [room.created_by_user]
	return []
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

export const isTalkRoomLive = (status?: string) => status === 'live'

export const isTalkRoomStartTimeReached = (startedAt?: string | null) => {
	if (!startedAt) return false
	const started = dayjs(startedAt)
	if (!started.isValid()) return false
	return !dayjs().isBefore(started)
}

export const isTalkRoomHostCanStart = (room?: TalkRoomRoom) => {
	return (
		room?.is_your_room === true &&
		isTalkRoomStartTimeReached(room?.started_at) &&
		room?.host_joined === false
	)
}

export const getTalkRoomStartTimeDisplay = (room?: TalkRoomRoom) => {
	return formatTalkRoomSchedule(room?.started_at ?? room?.next_schedule_at)
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
