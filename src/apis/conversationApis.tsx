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
