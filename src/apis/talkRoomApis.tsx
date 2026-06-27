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
	categories?: CreateTalkRoomCategory[]
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

export type TalkRoomDetail = TalkRoomListItem & {
	schedule_at?: string | null
	started_at?: string | null
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
