import axios from '../axios'

import { USER_ROUTES } from '@/routes'

export const getUserProfile = async ({ id }: { id?: string }) => {
	let url = USER_ROUTES.profile
	if (id) {
		url += `/${id}`
	}
	return await axios.get(url)
}
