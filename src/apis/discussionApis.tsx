import { convertParams } from '@/ultis/object'
import axios from '../axios'

import { CATEGORY_ROUTES, DISCUSS_ROUTES } from '@/routes'

export const getDiscuss = async (params) => {
	const url = DISCUSS_ROUTES.name

	return await axios.get(url, {
		params: convertParams(params),
	})
}
export const getDiscussDetail = async (params: {
	id: string
	[key: string]: any
}) => {
	const { id, ..._params } = params || {}
	const url = DISCUSS_ROUTES.name + '/' + id

	return await axios.get(url, {
		params: convertParams(_params),
	})
}

export const getPublicDiscussDetail = async (params: {
	id: string
	[key: string]: any
}) => {
	const { id, ..._params } = params || {}
	const url = `${DISCUSS_ROUTES.publicDetail}/${id}`

	return await axios.get(url, {
		params: convertParams(_params),
	})
}
export const getMyCategory = async (params) => {
	const url = CATEGORY_ROUTES.myCategory

	return await axios.get(url, {
		params: convertParams(params),
	})
}
export const getRecommendCategory = async (params) => {
	const url = CATEGORY_ROUTES.categoryRecommend

	return await axios.get(url, {
		params: convertParams(params),
	})
}
export const getCategoryExplore = async (params) => {
	const url = CATEGORY_ROUTES.categoryExplore

	return await axios.get(url, {
		params: convertParams(params),
	})
}
export const likeCategory = async ({ id }) => {
	const url = CATEGORY_ROUTES.likeCategory + `/${id}`
	return await axios.post(url, {})
}
export const likeDiscuss = async ({ id }) => {
	const url = DISCUSS_ROUTES.likeDiscuss + `/${id}`
	return await axios.post(url, {})
}

export const deleteDiscussion = async ({ id }: { id: string }) => {
	const url = DISCUSS_ROUTES.name + `/${id}`
	return await axios.delete(url)
}
export const createDiscussion = async (payload) => {
	const url = DISCUSS_ROUTES.name
	return await axios.post(url, payload)
}

export const editDiscussion = async ({
	id,
	payload,
}: {
	id: string
	payload: any
}) => {
	const url = `${DISCUSS_ROUTES.name}/${id}`
	return await axios.put(url, payload)
}
// export const getHangoutSearch = async (params) => {
// 	const url = HANGOUT_ROUTES.search // myprofile

// 	return await axios.get(url, {
// 		params: convertParams(params),
// 	})
// }

// export const getMyPastHangout = async (params) => {
// 	const url = HANGOUT_ROUTES.myPast // myprofile

// 	return await axios.get(url, {
// 		params: convertParams(params),
// 	})
// }
// export const getMyHangoutWaitting = async (params) => {
// 	const url = HANGOUT_ROUTES.hangoutWaiting // myprofile

// 	return await axios.get(url, {
// 		params: convertParams(params),
// 	})
// }
// export const getMyCurrentHangout = async (params) => {
// 	const url = HANGOUT_ROUTES.myCurrent // myprofile

// 	return await axios.get(url, {
// 		params: convertParams(params),
// 	})
// }

// export const actionParticipant = async (_payload: any) => {
// 	const { id, ...payload } = _payload || {}
// 	const url = POST_ROUTES.participant + `/${id}`
// 	return await axios.put(url, payload)
// }
// // export const updateUserProfile = async (payload: any) => {
// // 	const url = USER_ROUTES.profile // myprofile
// // 	return await axios.put(url, payload)
// // }

// // export const reportUser = async (payload) => {
// // 	const url = USER_ROUTES.report
// // 	return await axios.post(url, payload)
// // }
// export const getHangoutById = async ({
// 	id,
// 	params,
// }: {
// 	id: string
// 	params: { [key: string]: any }
// }) => {
// 	const url = HANGOUT_ROUTES.name + `/${id}` // myprofile

// 	return await axios.get(url, {
// 		params: convertParams(params),
// 	})
// }

// export const updateHangoutById = async (_payload: any) => {
// 	const { id, ...payload } = _payload || {}
// 	const url = HANGOUT_ROUTES.name + `/${id}`
// 	return await axios.put(url, payload)
// }

// export const deleteHangoutParticipantId = async ({ id }: { id: string }) => {
// 	const url = POST_ROUTES.participant + `/${id}`
// 	return await axios.delete(url)
// }
// export const deleteMutiHangoutParticipantId = async (payload: any) => {
// 	const url = POST_ROUTES.actionMultiWaiting
// 	return await axios.post(url, payload)
// }
// export const getUserOpenHangout = async (params) => {
// 	const url = HANGOUT_ROUTES.userOpenHangout

// 	return await axios.get(url, {
// 		params: convertParams(params),
// 	})
// }
