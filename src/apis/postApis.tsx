import axios from '../axios'

import { POST_ROUTES } from '@/routes'

export const createPost = async (payload: any) => {
	const url = POST_ROUTES.name // myprofile
	return await axios.post(url, payload)
}
