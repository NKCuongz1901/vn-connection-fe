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
