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

export const getBookingSlots = async (payload: { schedule_at: string }) => {
	const url = TALKROOM_ROUTES.checkBookingSlots

	return await axios.get(url, {
		params: payload,
	})
}
