import { convertParams } from '@/ultis/object.ults'
import axios from '../axios'

import { POST_ROUTES } from '@/routes'

export const createPost = async (payload: any) => {
	const url = POST_ROUTES.name // myprofile
	return await axios.post(url, payload)
}

export const getListPost = async (_params: any) => {
	const { type, ...params } = _params || {}
	let url = '' // myprofile
	switch (type) {
		default:
			url = POST_ROUTES.myPost
			break
	}
	return await axios.get(url, {
		params: convertParams(params),
	})
}
