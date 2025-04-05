import { convertParams } from '@/ultis/object.ults'
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
