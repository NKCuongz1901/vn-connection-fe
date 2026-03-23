import { convertParams } from '@/ultis/object'
import axios from '../axios'

import { USER_ROUTES } from '@/routes'

export const getUserProfile = async ({
	id,
	params,
}: {
	id?: string
	params?: any
}) => {
	let url = USER_ROUTES.profile // myprofile
	if (id) {
		url = `${USER_ROUTES.user}/${id}` // profile by id
	}
	return await axios.get(url, {
		params: convertParams(params),
	})
}
export const updateUserProfile = async (payload: any) => {
	const url = USER_ROUTES.profile // myprofile
	return await axios.put(url, payload)
}

export const blockUser = async (id: string) => {
	const url = USER_ROUTES.block + '/' + id
	return await axios.post(url)
}

export const reportUser = async (payload) => {
	const url = USER_ROUTES.report
	return await axios.post(url, payload)
}
