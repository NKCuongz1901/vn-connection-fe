import { convertParams } from '@/ultis/object.ults'
import axios from '../axios'

import { HANGOUT_ROUTES, POST_ROUTES } from '@/routes'

export const getUserOpenHangoutNow = async (params) => {
	const url = HANGOUT_ROUTES.userOpenHangoutNow // myprofile

	return await axios.get(url, {
		params: convertParams(params),
	})
}
export const getHangoutSearch = async (params) => {
	const url = HANGOUT_ROUTES.search // myprofile

	return await axios.get(url, {
		params: convertParams(params),
	})
}

export const getMyPastHangout = async (params) => {
	const url = HANGOUT_ROUTES.myPast // myprofile

	return await axios.get(url, {
		params: convertParams(params),
	})
}
export const getMyHangoutWaitting = async (params) => {
	const url = HANGOUT_ROUTES.hangoutWaiting // myprofile

	return await axios.get(url, {
		params: convertParams(params),
	})
}
export const getMyCurrentHangout = async (params) => {
	const url = HANGOUT_ROUTES.myCurrent // myprofile

	return await axios.get(url, {
		params: convertParams(params),
	})
}

export const actionParticipant = async (_payload: any) => {
	const { id, ...payload } = _payload || {}
	const url = POST_ROUTES.participant + `/${id}`
	return await axios.put(url, payload)
}
// export const updateUserProfile = async (payload: any) => {
// 	const url = USER_ROUTES.profile // myprofile
// 	return await axios.put(url, payload)
// }

export const sendHangout = async (payload: any) => {
	const url = HANGOUT_ROUTES.name
	return await axios.post(url, payload)
}

// export const reportUser = async (payload) => {
// 	const url = USER_ROUTES.report
// 	return await axios.post(url, payload)
// }
