import { convertParams } from '@/ultis/object'
import axios from '../axios'

import { POST_ROUTES } from '@/routes'
import { mainRoutes } from '@/routes/MainRoutes'

export const createPost = async (payload: any) => {
	const url = POST_ROUTES.name
	return await axios.post(url, payload)
}
export const editPost = async ({
	id,
	payload,
}: {
	id: string
	payload: any
}) => {
	const url = `${POST_ROUTES.name}/${id}`
	return await axios.put(url, payload)
}
export const editComment = async ({
	id,
	payload,
}: {
	id: string
	payload: any
}) => {
	const url = `${POST_ROUTES.comment}/${id}`
	return await axios.put(url, payload)
}

export const getListPost = async (_params: any) => {
	const { type, ...params } = _params || {}
	let url = ''
	switch (type) {
		case mainRoutes.upcomingEvent:
			url = POST_ROUTES.search
			break

		default:
			url = POST_ROUTES.myPost
			break
	}
	return await axios.get(url, {
		params: convertParams(params),
	})
}

export const getDetailPost = async ({
	id,
	params,
}: {
	id: string
	params: any
}) => {
	const url = `${POST_ROUTES.name}/${id}`

	return await axios.get(url, {
		params: convertParams(params),
	})
}

export const getPublicListPost = async (params: any) => {
	return await axios.get(POST_ROUTES.publicEventDetail, {
		params: convertParams(params),
	})
}

export const getPublicEventDetail = async ({
	id,
	params,
}: {
	id: string
	params: any
}) => {
	const url = `${POST_ROUTES.publicEventDetail}/${id}`
	return await axios.get(url, {
		params: convertParams(params),
	})
}

export const deletePost = async ({
	id,
	params,
}: {
	id: string
	params: any
}) => {
	const url = `${POST_ROUTES.name}/${id}`

	return await axios.delete(url, {
		params: params ? convertParams(params) : null,
	})
}

export const joinPost = async (payload: any) => {
	const url = POST_ROUTES.participant

	return await axios.post(url, payload)
}

export const getListParticipant = async (_params: any) => {
	const { type, ...params } = _params || {}
	let url = ''
	switch (type) {
		default:
			url = POST_ROUTES.participant
			break
	}
	return await axios.get(url, {
		params: convertParams(params),
	})
}

export const getPublicListParticipant = async (params: any) => {
	return await axios.get(POST_ROUTES.participantPublic, {
		params: convertParams(params),
	})
}

export const getListCommentById = async (params: any) => {
	const url = POST_ROUTES.comment

	return await axios.get(url, {
		params: convertParams(params),
	})
}

export const getPublicListCommentById = async (params: any) => {
	return await axios.get(POST_ROUTES.commentPublic, {
		params: convertParams(params),
	})
}

export const likeComment = async ({ id }) => {
	const url = POST_ROUTES.likeComment + `/${id}`
	return await axios.post(url, {})
}

export const sendCommentPost = async (payload: {
	post_id: string
	content?: string
	[key: string]: any
}) => {
	const url = POST_ROUTES.comment

	return await axios.post(url, payload)
}

export const deleteCommentPost = async (id: string) => {
	const url = `${POST_ROUTES.comment}/${id}`
	return await axios.delete(url)
}

export const updateMemberPost = async (payload: any) => {
	const url = POST_ROUTES.updateMember
	return await axios.post(url, payload)
}

export const getListSticket = async (params: any) => {
	const url = POST_ROUTES.sticker

	return await axios.get(url, {
		params: convertParams(params),
	})
}

export const getmyEventInHome = async (params: any = {}) => {
	const url = POST_ROUTES.myEventInHome

	return await axios.get(url, {
		params: convertParams(params),
	})
}

export const getMyEventsJoined = async (params: any = {}) => {
	const url = POST_ROUTES.myEventsJoined

	return await axios.get(url, {
		params: convertParams(params),
	})
}

export const getMyEventsPassed = async (params: any = {}) => {
	const url = POST_ROUTES.myEventsPassed

	return await axios.get(url, {
		params: convertParams(params),
	})
}
