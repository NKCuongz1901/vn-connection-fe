import { convertParams } from '@/ultis/object'
import axios from '../axios'
import { CONFIG_BOOTSTRAP, TALKROOM_ROUTES } from '@/routes'

export type CreateTalkRoomCategory = {
	slug: string
}

export type CreateTalkRoomSchedule = {
	schedule_at: string
	enabled: boolean
}

export type CreateTalkRoomPayload = {
	name: string
	level: string[]
	language_id: string
	categories: CreateTalkRoomCategory[]
	idempotency_key: string
	schedules?: CreateTalkRoomSchedule[]
}

export type CreateTalkRoomInput = {
	name: string
	level: string[]
	language_id: string
	categorySlugs: string[]
	schedules?: CreateTalkRoomSchedule[]
	idempotency_key?: string
}

export type TalkRoomDetail = TalkRoomListItem & {
	schedule_at?: string | null
	started_at?: string | null
	time_left_in_seconds?: number
	max_duration_seconds?: number
	count_down_at?: string | null
	created_at?: string
	host_joined?: boolean
	host_user?: {
		id?: string
		name?: string
		avatar?: string
		i_am_from?: string
	}
	schedules?: {
		id?: string
		schedule_at?: string
		enabled?: boolean
		status?: string
		index?: number
		estimated_end_at?: string | null
		ended_at?: string | null
		conversation_id?: string | null
	}[]
	categories?: {
		slug?: string
		category_details?: {
			slug?: string
			name?: string
		}
	}[]
}

export type TalkRoomListFilters = {
	levels?: string[]
	languageIds?: string[]
}

export type TalkRoomListItem = {
	id: string
	name: string
	language_id?: string
	level?: string[]
	status?: string
	total_participants?: number
	max_participants?: number
	next_schedule_at?: string | null
	speakers?: {
		id?: string
		name?: string
		avatar?: string
		role?: string
		talking_time?: number
		i_am_from?: string
	}[]
	created_by_user?: {
		id?: string
		name?: string
		avatar?: string
	}
	language?: {
		id?: string
		name?: string
		code?: string
		flag?: string
	}
	[key: string]: any
}

export type CountMeInTalkRoomPayload = {
	isEnabled: boolean
}

export const getTalkRoomOverview = async ({
	params = {},
}: {
	params?: { [key: string]: any }
}) => {
	const url = TALKROOM_ROUTES.talkRoomOverview

	return await axios.get(url, {
		params: convertParams(params),
	})
}

export const getMyTalkRoomAnalysis = async ({
	params = {},
}: {
	params?: { [key: string]: any }
}) => {
	const url = TALKROOM_ROUTES.myTalkRoomAnalysis

	return await axios.get(url, {
		params: convertParams(params),
	})
}

export const createTalkRoom = async (payload: CreateTalkRoomPayload) => {
	const url = TALKROOM_ROUTES.createTalkRoom

	return await axios.post(url, payload)
}

export const canCreateTalkRoom = async () => {
	const url = TALKROOM_ROUTES.checkCanCreateTalkRoom

	return await axios.get(url)
}

export type TalkRoomLanguageItem = {
	id: string
	name: string
	code: string
	flag?: string
	native_name?: string | null
	native_code?: string | null
	order?: number
}

export type TalkRoomCategoryItem = {
	slug: string
	name: string
	description?: string | null
}

export const getTalkRoomCategories = async () => {
	const url = CONFIG_BOOTSTRAP.getTalkRoomCategories

	return await axios.get(url)
}

export const getTalkRoomLanguages = async ({
	params = {},
}: {
	params?: { [key: string]: any }
} = {}) => {
	const url = CONFIG_BOOTSTRAP.getListLanguage

	return await axios.get(url, {
		params: convertParams(params),
	})
}

/** @deprecated Use getTalkRoomCategories */
export const getListCategories = getTalkRoomCategories

/** @deprecated Use getTalkRoomLanguages */
export const getListLanguage = getTalkRoomLanguages

export type BookingSlotItem = {
	date: string
	available_spots: number
	max_spots: number
	is_fully_booked: boolean
}

export type BookingSlotsResponseObject = {
	slots: BookingSlotItem[]
	cached_at?: string
	ttl_seconds?: number
	your_timezone_offset?: number
}

export type BookingSlotsData = {
	availableCount: number
	totalCount: number
	usedCount: number
	isFull: boolean
	availabilityText: string
	timeSlots: string[]
}

export const parseBookingSlotItem = (
	item: BookingSlotItem,
): BookingSlotsData => {
	const available = item.available_spots ?? 0
	const total = item.max_spots ?? 0
	const used = Math.max(total - available, 0)
	const isFull = item.is_fully_booked ?? available <= 0

	return {
		availableCount: available,
		totalCount: total,
		usedCount: used,
		isFull,
		availabilityText: isFull
			? `Full (${used}/${total}). Create live instead`
			: `${available} spots available`,
		timeSlots: [],
	}
}

export const parseBookingSlotsMap = (
	res: any,
	dateKeys: string[],
): Record<string, BookingSlotsData> => {
	const obj: BookingSlotsResponseObject = res?.results?.object ??
		res?.object ?? { slots: [] }
	const slots = obj.slots ?? []

	const byDate = slots.reduce<Record<string, BookingSlotItem>>((acc, item) => {
		acc[item.date] = item
		return acc
	}, {})

	return dateKeys.reduce<Record<string, BookingSlotsData>>((acc, key) => {
		const item = byDate[key]
		acc[key] = item
			? parseBookingSlotItem(item)
			: {
					availableCount: 0,
					totalCount: 0,
					usedCount: 0,
					isFull: true,
					availabilityText: 'No slots available',
					timeSlots: [],
				}
		return acc
	}, {})
}

export const getBookingSlots = async () => {
	const url = TALKROOM_ROUTES.checkBookingSlots

	return await axios.get(url)
}

export const buildTalkRoomListWhere = (filters?: TalkRoomListFilters) => {
	const where: Record<string, unknown> = {}

	if (filters?.levels?.length) {
		where.level = { $overlap: filters.levels }
	}
	if (filters?.languageIds?.length) {
		where.language_id = { $in: filters.languageIds }
	}

	return where
}

export const getListTalkRoom = async ({
	params = {},
}: {
	params?: { [key: string]: any }
}) => {
	const url = TALKROOM_ROUTES.getListTalkRoom

	return await axios.get(url, {
		params: convertParams(params || {}),
	})
}

export const getListMyFriendTalkRoom = async ({
	params = {},
}: {
	params?: { [key: string]: any }
}) => {
	const url = TALKROOM_ROUTES.getListMyFriendTalkRoom

	return await axios.get(url, {
		params: convertParams(params || {}),
	})
}

export type UpdateTalkRoomPayload = {
	name: string
	level: string[]
	language_id: string
	categories: CreateTalkRoomCategory[]
	idempotency_key: string
}

export type UpdateTalkRoomInput = {
	name: string
	level: string[]
	language_id: string
	categorySlugs: string[]
	idempotency_key?: string
}

export const updateTalkRoom = async ({
	id,
	payload,
}: {
	id: string
	payload: UpdateTalkRoomPayload
}) => {
	const url = `${TALKROOM_ROUTES.getTalkRoomDetail}/${id}`

	return await axios.put(url, payload)
}

export const getDetailTalkRoom = async ({
	id,
	params = { fields: ['$all'] },
}: {
	id: string
	params?: { [key: string]: any }
}) => {
	const url = `${TALKROOM_ROUTES.getTalkRoomDetail}/${id}/details`

	return await axios.get(url, {
		params: convertParams(params),
	})
}

export const deleteTalkRoom = async (id: string) => {
	const url = `${TALKROOM_ROUTES.getTalkRoomDetail}/${id}`

	return await axios.delete(url)
}

export const countMeInTalkRoom = async ({
	id,
	payload,
}: {
	id: string
	payload: CountMeInTalkRoomPayload
}) => {
	const url = `${TALKROOM_ROUTES.getTalkRoomDetail}/${id}/count_me_in/toggle`

	return await axios.post(url, payload)
}

export type TalkRoomCountMeInUser = {
	id: string
	name: string
	avatar?: string
	i_am_from?: string | null
	country_code?: string | null
	gender?: string | null
	languages_can_speak?: string | null
	languages_can_speak_array?: string[]
	age?: number | null
}

export type TalkRoomCountMeInListItem = {
	user_id: string
	created_at?: string
	user: TalkRoomCountMeInUser
}

export const getTalkRoomCountMeInList = async ({
	id,
	params = {},
}: {
	id: string
	params?: { [key: string]: any }
}) => {
	const url = `${TALKROOM_ROUTES.getTalkRoomDetail}/${id}/count_me_in/list`

	return await axios.get(url, {
		params: convertParams(params),
	})
}

export const notificationMeInTalkRoom = async ({
	id,
	payload,
}: {
	id: string
	payload: CountMeInTalkRoomPayload
}) => {
	const url = `${TALKROOM_ROUTES.getTalkRoomDetail}/${id}/notifications/toggle`

	return await axios.post(url, payload)
}

export type TalkRoomConnectedUser = {
	id: string
	name: string
	avatar?: string
	country_code?: string
	gender?: string
	age?: number | null
	connected_at?: string
}

export type TalkRoomLeaderBoardUser = {
	id: string
	name: string
	avatar?: string
	i_am_from?: string
}

export type TalkRoomLeaderBoardItem = {
	user_id: string
	total_speaking_seconds: number
	total_hosting_seconds: number
	user: TalkRoomLeaderBoardUser
}

export const getTalkRoomConnectedCountry = async ({
	params = {},
}: {
	params?: { [key: string]: any }
} = {}) => {
	const url = TALKROOM_ROUTES.getTalkRoomConnectedCountry

	return await axios.get(url, {
		params: convertParams(params),
	})
}

export const getTalkRoomConnectedPeople = async ({
	params = {},
}: {
	params?: { [key: string]: any }
} = {}) => {
	const url = TALKROOM_ROUTES.getTalkRoomConnectedPeople

	return await axios.get(url, {
		params: convertParams(params),
	})
}

export const getTalkRoomLeaderBoard = async ({
	params = {},
}: {
	params?: { [key: string]: any }
} = {}) => {
	const url = TALKROOM_ROUTES.getTalkRoomLeaderBoard

	return await axios.get(url, {
		params: convertParams(params),
	})
}

export const getTalkRoomLeaderBoardMy = async ({
	params = {},
}: {
	params?: { [key: string]: any }
} = {}) => {
	const url = TALKROOM_ROUTES.getTalkRoomLeaderBoardMy

	return await axios.get(url, {
		params: convertParams(params),
	})
}

export type ValidatePreTalkroomModel = {
	canJoin: boolean
	reason: string
	message?: string
}

export const validatePreTalkroom = async ({
	id,
	params = { fields: ['$all'] },
}: {
	id: string
	params?: { [key: string]: any }
}) => {
	const url = `${TALKROOM_ROUTES.validatePreTalkroom}/${id}`

	return await axios.get(url, {
		params: convertParams(params),
	})
}

export type TalkRoomListenerInRoomUser = {
	id: string
	name: string
	avatar?: string
	i_am_from?: string
	country_code?: string
	gender?: string
	age?: number | null
}

export type TalkRoomListenerInRoom = {
	id: string
	talkroom_id: string
	user_id: string
	status: string
	role: string
	talking_time?: number
	joined_at?: string
	left_at?: string | null
	created_at?: string
	updated_at?: string
	user: TalkRoomListenerInRoomUser
}

export const getListenerInRoom = async ({
	id,
	params = { fields: ['$all'] },
}: {
	id: string
	params?: { [key: string]: any }
}) => {
	const url = `${TALKROOM_ROUTES.getTalkRoomDetail}/${id}/details/listeners`

	return await axios.get(url, {
		params: convertParams(params),
	})
}

export type JoinTalkroomRoomate = {
	id: string
	talkroom_id: string
	user_id: string
	status: string
	role: string
	talking_time?: number
	joined_at?: string
	left_at?: string | null
}

export type JoinTalkroomAgora = {
	session_id?: string
	connection_type?: string
	user_role?: string
	role?: string
	is_rejoin?: boolean
	agora_token?: string
	channel_name?: string
	agora_uid?: number
	expires_at?: number
	stream_wss_url?: string
	stream_hls_url?: string
}

export type JoinTalkroomData = {
	roomate: JoinTalkroomRoomate
	role: string
	isRejoining: boolean
	room_info?: {
		id: string
		name: string
		status: string
	}
	socket_integration?: {
		room_subscribed?: boolean
		event_broadcasted?: boolean
		participants_notified?: number
		socket_event_details?: string
	}
	agora?: JoinTalkroomAgora
}

export type JoinTalkroomModel = {
	success: boolean
	message?: string
	data?: JoinTalkroomData
}

export const joinTalkroom = async ({
	id,
	payload = { fields: ['$all'] },
}: {
	id: string
	payload?: { [key: string]: any }
}) => {
	const url = `${TALKROOM_ROUTES.getTalkRoomDetail}/${id}/join`

	return await axios.post(url, convertParams(payload))
}

export const leaveTalkroom = async ({
	id,
	payload = { fields: ['$all'] },
}: {
	id: string
	payload?: { [key: string]: any }
}) => {
	const url = `${TALKROOM_ROUTES.getTalkRoomDetail}/${id}/leave`

	return await axios.post(url, convertParams(payload))
}

// Action in room

export const getRaiseHandUser = async ({
	id,
	params = { fields: ['$all'] },
}: {
	id: string
	params?: { [key: string]: any }
}) => {
	const url = `${TALKROOM_ROUTES.getTalkRoomDetail}/${id}/raised-hands`

	return await axios.get(url, {
		params: convertParams(params),
	})
}

export type ToggleMicPayload = {
	is_on: boolean
}

export const toogleMic = async ({
	id,
	payload,
}: {
	id: string
	payload: ToggleMicPayload
}) => {
	const url = `${TALKROOM_ROUTES.baseTalkroomRoute}/socket/${id}/toggle_mic`

	return await axios.post(url, payload)
}

export const hostApproveRaiseHand = async () => {}

export const stepDownToListener = async () => {}

export const hostKickListener = async () => {}

export const transitionRole = async () => {}

export const stopHosting = async () => {}

export const getTokenSocket = async () => {
	const url = TALKROOM_ROUTES.getTokenSocket
	return await axios.post(url, {})
}
