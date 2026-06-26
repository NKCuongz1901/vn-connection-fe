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

export type TalkRoomRoom = {
	id?: string
	status?: string
	speakers?: TalkRoomSpeaker[]
	created_by_user?: TalkRoomSpeaker
	total_participants?: number
	max_participants?: number
	next_schedule_at?: string | null
	language?: TalkRoomLanguage
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
