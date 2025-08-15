import { convertParams } from '@/ultis/object.ults'
import axios from '../axios'

import { CONVERSATION_ROUTES } from '@/routes'

export const sendMessageById = async (payload: any) => {
	const url = CONVERSATION_ROUTES.sendById

	return await axios.post(url, payload)
}
export const getCategoryList = async ({
	params = {},
}: {
	params?: { [key: string]: any }
}) => {
	const url = CONVERSATION_ROUTES.categoryList

	return await axios.get(url, {
		params: convertParams(params),
	})
}
export const getNetworkGroup = async ({
	params = {},
}: {
	params?: { [key: string]: any }
}) => {
	const url = CONVERSATION_ROUTES.networkGroup

	return await axios.get(url, {
		params: convertParams(params),
	})
}
export const createConversation = async (payload: any) => {
	const url = CONVERSATION_ROUTES.createConversation

	return await axios.post(url, payload)
}

export const getConvStranger = async (params: { [key: string]: any } = {}) => {
	const url = CONVERSATION_ROUTES.stranger

	return await axios.get(url, {
		params: convertParams(params),
	})
}
export const getConvPersonal = async (params: { [key: string]: any } = {}) => {
	const url = CONVERSATION_ROUTES.personal

	return await axios.get(url, {
		params: convertParams(params),
	})
}

export const getConvMessById = async (params: {
	id: string
	[key: string]: any
}) => {
	const { id, ..._params } = params || {}
	const url = CONVERSATION_ROUTES.name + '/' + id + '/messages'

	return await axios.get(url, {
		params: convertParams(params),
	})
}

export const getConvInfoById = async (params: {
	id: string
	[key: string]: any
}) => {
	const { id, ..._params } = params || {}
	const url = CONVERSATION_ROUTES.name + '/' + id

	return await axios.get(url, {
		params: convertParams(_params),
	})
}
export const getConvMembersById = async (params: {
	id: string
	[key: string]: any
}) => {
	const { id, ..._params } = params || {}
	const url = CONVERSATION_ROUTES.name + '/' + id + '/members'

	return await axios.get(url, {
		params: convertParams(params),
	})
}

export const sendMessage = async (payload: any) => {
	const url = CONVERSATION_ROUTES.sendMess

	return await axios.post(url, payload)
}

export const deleteMessageById = async ({ id }: { id: string }) => {
	const url = CONVERSATION_ROUTES.message + `/${id}`
	return await axios.delete(url)
}
export const pinMessageById = async ({
	id,
	payload,
}: {
	id: string
	payload: any
}) => {
	const url = CONVERSATION_ROUTES.messagePin + `/${id}`
	return await axios.post(url, payload || {})
}
export const getPinMessageById = async ({
	id,
	params = {},
}: {
	id: string
	params?: { [key: string]: any }
}) => {
	const url = `${CONVERSATION_ROUTES.name}/${id}/messages-pin`

	return await axios.get(url, {
		params: convertParams(params),
	})
}

export const updateConvMember = async ({
	payload,
	id,
	memberId,
}: {
	id: string
	memberId: string
	payload?: any
}) => {
	const url = `${CONVERSATION_ROUTES.name}/${id}/members/${memberId}`
	return await axios.put(url, payload)
}

export const getConvMediasById = async ({
	id,
	params = {},
}: {
	id: string
	params?: { [key: string]: any }
}) => {
	const url = `${CONVERSATION_ROUTES.name}/${id}/media`

	return await axios.get(url, {
		params: convertParams(params),
	})
}

export const getConvList = async ({
	params = {},
}: {
	params?: { [key: string]: any }
}) => {
	const url = CONVERSATION_ROUTES.convSearch
	const { keyword, ..._params } = params || {}
	return await axios.get(url, {
		params: { ...convertParams(_params), keyword },
	})
}

export const createConv = async (payload: any) => {
	const url = CONVERSATION_ROUTES.createConv

	return await axios.post(url, payload)
}
