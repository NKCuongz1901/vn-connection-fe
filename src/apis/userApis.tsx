import { convertParams } from '@/ultis/object'
import md5 from 'md5'
import axios from '../axios'
import { getStorageCookie } from '@/ultis/storage'

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

export const changeUserPassword = async (payload: {
	old_password: string
	new_password: string
}) => {
	const fcm_token = getStorageCookie('last_token_web')
	return await axios.post(`${USER_ROUTES.user}/change_password`, {
		old_password: md5(payload.old_password),
		new_password: md5(payload.new_password),
		...(fcm_token ? { fcm_token } : {}),
	})
}

export const deleteMySelfAccount = async () => {
	const url = USER_ROUTES.user + '/delete'
	return await axios.delete(url)
}

export const blockUser = async (id: string) => {
	const url = USER_ROUTES.block + '/' + id
	return await axios.post(url)
}

export const reportUser = async (payload) => {
	const url = USER_ROUTES.report
	return await axios.post(url, payload)
}

export const getReportIssueTypes = async (params: { type: string }) => {
	return await axios.get(`${USER_ROUTES.report}/issuse-types`, {
		params: convertParams(params),
	})
}
