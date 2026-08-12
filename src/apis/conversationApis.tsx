import { convertParams } from '@/ultis/object'
import axios from '../axios'

import { CONVERSATION_ROUTES } from '@/routes'
import { AdminDeleteMessageParams } from '@/interface/Conversation/Conversation.interface'

export const sendMessageById = async (payload: any) => {
	const url = CONVERSATION_ROUTES.sendById

	return await axios.post(url, payload)
}
export const getCategoryList = async ({
	params = {},
}: {
	params?: { [key: string]: any }
}) => {
	const url = CONVERSATION_ROUTES.categoryFav

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
export const updateConversation = async ({ id, payload }) => {
	const url = `${CONVERSATION_ROUTES.name}/${id}`

	return await axios.put(url, payload)
}

export const getConvStranger = async (params: { [key: string]: any } = {}) => {
	const url = CONVERSATION_ROUTES.stranger

	return await axios.get(url, {
		params: convertParams(params),
	})
}
export const getCateFav = async (params: { [key: string]: any } = {}) => {
	const url = CONVERSATION_ROUTES.categoryFav

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

export const getPublicConvInfoById = async (params: { id: string }) => {
	const { id } = params || {}
	const url = `${CONVERSATION_ROUTES.publicDetail}/${id}`

	return await axios.get(url)
}
export const getConvMembersById = async (params: {
	id: string
	[key: string]: any
}) => {
	const { id, name, ..._params } = params
	const url = CONVERSATION_ROUTES.name + '/' + id + '/members'

	return await axios.get(url, {
		params: { ...convertParams(_params), name },
	})
}

export const getConvMembersNotAdmById = async (params: {
	id: string
	[key: string]: any
}) => {
	const { id, name, ..._params } = params
	const url = CONVERSATION_ROUTES.name + '/' + id + '/members_not_admin'

	return await axios.get(url, {
		params: { ...convertParams(_params), name },
	})
}
export const sendMessage = async (payload: any) => {
	const url = CONVERSATION_ROUTES.sendMess

	return await axios.post(url, payload)
}
export const getMessageById = async (params: {
	id: string
	[key: string]: any
}) => {
	const { id, name, ..._params } = params
	const url = CONVERSATION_ROUTES.message + `/${id}`
	return await axios.get(url, {
		params: { ...convertParams(_params), name },
	})
}
export const deleteMessageById = async ({ id }: { id: string }) => {
	const url = CONVERSATION_ROUTES.message + `/${id}`
	return await axios.delete(url)
}

export const editMessageById = async ({
	id,
	payload,
}: {
	id: string
	payload: any
}) => {
	const url = CONVERSATION_ROUTES.message + `/${id}`
	return await axios.put(url, payload)
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

export const getConvClubList = async (params?: { [key: string]: any }) => {
	const url = CONVERSATION_ROUTES.convClub
	const { keyword, ..._params } = params || {}
	return await axios.get(url, {
		params: { ...convertParams(_params), keyword },
	})
}
export const getConvClubListSuggest = async (params?: {
	[key: string]: any
}) => {
	const url = CONVERSATION_ROUTES.convSuggest
	const { keyword, ..._params } = params || {}
	return await axios.get(url, {
		params: { ...convertParams(_params), keyword },
	})
}

export const deleteConvById = async ({ id }: { id: string }) => {
	const url = `${CONVERSATION_ROUTES.name}/${id}/delete`
	return await axios.delete(url)
}
export const leaveConvById = async ({ id }: { id: string }) => {
	const url = `${CONVERSATION_ROUTES.name}/${id}/leave`
	return await axios.post(url)
}
export const joinConversation = async (_payload: any) => {
	const { id, ...payload } = _payload || {}
	const url = `${CONVERSATION_ROUTES.name}/${id}/${CONVERSATION_ROUTES.joinConversation}`

	return await axios.post(url, payload)
}
export const leaveConversation = async (_payload: any) => {
	const { id, ...payload } = _payload || {}
	const url = `${CONVERSATION_ROUTES.name}/${id}/${CONVERSATION_ROUTES.leave}`

	return await axios.post(url, payload)
}

export const getAnnouListById = async ({
	params = {},
}: {
	params?: { [key: string]: any }
}) => {
	const url = CONVERSATION_ROUTES.anouncement
	const { keyword, ..._params } = params || {}
	return await axios.get(url, {
		params: { ...convertParams(_params), keyword },
	})
}

export const getPublicAnnouListById = async ({
	params = {},
}: {
	params?: { [key: string]: any }
}) => {
	const url = CONVERSATION_ROUTES.anouncementPublic
	const { keyword, ..._params } = params || {}
	return await axios.get(url, {
		params: { ...convertParams(_params), keyword },
	})
}

export const likeAnnoun = async ({ id }) => {
	const url = CONVERSATION_ROUTES.anouncementLike + `/${id}`

	return await axios.post(url)
}

export const createAnnoun = async (payload) => {
	const url = CONVERSATION_ROUTES.anouncement
	return await axios.post(url, payload)
}

export const updateRoleUser = async ({ id, payload }) => {
	const url = CONVERSATION_ROUTES.name + '/' + id + '/add_role'
	return await axios.post(url, payload)
}

export const deleteMember = async ({ id, payload }) => {
	const url = CONVERSATION_ROUTES.name + '/' + id + '/delete_member'
	return await axios.post(url, payload)
}

export const inviteJoinConv = async ({ id, payload }) => {
	const url = `${CONVERSATION_ROUTES.name}/${id}/${CONVERSATION_ROUTES.invite}`
	return await axios.post(url, payload)
}
export const inviteAllJoinConv = async ({ id, payload, params = {} }) => {
	const url = `${CONVERSATION_ROUTES.name}/${id}/${CONVERSATION_ROUTES.inviteAll}`
	return await axios.post(url, payload, {
		params: convertParams(params),
	})
}
export const getChatRoomList = async (params) => {
	const url = CONVERSATION_ROUTES.convChatRoom

	return await axios.get(url, {
		params: convertParams(params),
	})
}

export const getMemberInConv = async (params: {
	id: string
	[key: string]: any
}) => {
	const { id, ..._params } = params || {}
	const url = CONVERSATION_ROUTES.name + '/' + id + '/members'

	return await axios.get(url, {
		params: convertParams(_params),
	})
}

export const textToSpeech = async ({ payload }) => {
	const url = `${CONVERSATION_ROUTES.textToSpeech}`
	return await axios.post(url, payload, {})
}
export const translate = async ({ payload }) => {
	const url = `${CONVERSATION_ROUTES.translate}`
	return await axios.post(url, payload, {})
}

export const getMemberAroundMe = async (params: {
	id: string
	[key: string]: any
}) => {
	const { id, ..._params } = params
	const url = `${CONVERSATION_ROUTES.name}/${id}/${CONVERSATION_ROUTES.membersAroundMe}`

	return await axios.get(url, {
		params: convertParams(_params),
	})
}
export const getMember = async (params: { id: string; [key: string]: any }) => {
	const { id, ..._params } = params

	const url = `${CONVERSATION_ROUTES.name}/${id}/${CONVERSATION_ROUTES.member}`

	return await axios.get(url, {
		params: convertParams(_params),
	})
}

export const getReact = async (params = {}) => {
	const url = `${CONVERSATION_ROUTES.reactLs}`

	return await axios.get(url, {
		params: convertParams(params),
	})
}

export const reactMessageById = async ({
	id,
	payload,
}: {
	id: string
	payload: any
}) => {
	const url = CONVERSATION_ROUTES.messReaction + '/' + id

	return await axios.post(url, payload)
}

export const getLanguageList = async (params) => {
	const url = CONVERSATION_ROUTES.language

	return await axios.get(url, {
		params: convertParams(params),
	})
}

export const getMessageReadMessage = async (id: string) => {
	const url = `${CONVERSATION_ROUTES.readMessage}/${id}`

	return await axios.get(url, {})
}

export interface QuickMessageMedia {
	url: string
	width?: number
	height?: number
	ratio?: number
	type?: string
	duration?: number
}

export interface QuickMessagePayload {
	shortcut: string
	content: string
	media?: string
	medias?: QuickMessageMedia[]
}

export const getQuickMessage = async ({
	params = {},
}: {
	params?: Record<string, any>
} = {}) => {
	const url = CONVERSATION_ROUTES.quickMessage

	return await axios.get(url, {
		params: convertParams(params),
	})
}

export const createQuickMessage = async (payload: QuickMessagePayload) => {
	const url = CONVERSATION_ROUTES.quickMessage

	return await axios.post(url, payload)
}

export const updateQuickMessage = async (
	id: string,
	payload: QuickMessagePayload,
) => {
	const url = `${CONVERSATION_ROUTES.quickMessage}/${id}`

	return await axios.put(url, payload)
}

export const deleteQuickMessage = async (id: string) => {
	const url = `${CONVERSATION_ROUTES.quickMessage}/${id}`

	return await axios.delete(url)
}

export const adminDeleteMessage = async ({
	id,
	is_report_spam,
	is_delete_all_from_user,
	is_ban_user,
	type_block,
	title,
	content,
}: AdminDeleteMessageParams) => {
	const url = `${CONVERSATION_ROUTES.message}/${id}`
	const query = Object.fromEntries(
		Object.entries({
			is_report_spam,
			is_delete_all_from_user,
			is_ban_user,
			type_block,
			title,
			content,
		}).filter(([, value]) => value !== undefined && value !== ''),
	)
	return await axios.delete(url, {
		params: convertParams(query),
		data: {},
	})
}

// API Chat location
export const getListChatlocationOverview = async ({
	page,
	limit,
}: {
	page: number
	limit: number
}) => {
	const url = `${CONVERSATION_ROUTES.listChatlocationOverview}`
	return await axios.get(url, {
		params: convertParams({ page, limit }),
	})
}
