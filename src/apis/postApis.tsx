import { convertParams } from '@/ultis/object.ults'
import axios from '../axios'

import { POST_ROUTES } from '@/routes'

export const createPost = async (payload: any) => {
	const url = POST_ROUTES.name // myprofile
	return await axios.post(url, payload)
}

export const getListPost = async (params: any) => {
	const url = POST_ROUTES.myPost // myprofile
	return await axios.get(url, {
		params: convertParams(params),
	})
}
