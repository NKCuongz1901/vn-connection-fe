import axios from '../axios'

import { AUTH_ROUTES, SYSTEM } from '@/routes'
import { convertParams } from '@/ultis/object'
import { OTPType } from '@/Variable/common.variable'

export const loginByPhone = async (payload: {
	phone: string
	password: string
	[key: string]: any
}) => {
	return await axios.post(AUTH_ROUTES.loginPhone, payload)
}

export const checkPhoneExists = async (payload: {
	phone: string
	[key: string]: any
}) => {
	return await axios.post(AUTH_ROUTES.checkPhoneExists, payload)
}

export const sendOTP = async (payload: {
	phone: string
	[key: string]: any
}) => {
	return await axios.post(AUTH_ROUTES.sendOTP, payload)
}

export const verifyOTP = async (payload: {
	phone: string
	code: string
	otp_type: OTPType
	[key: string]: any
}) => {
	return await axios.post(AUTH_ROUTES.verifyOTP, payload)
}
export const checkOTP = async (payload: {
	phone: string
	prefix_phone: string
	[key: string]: any
}) => {
	return await axios.post(AUTH_ROUTES.checkOTP, payload)
}
export const forgetPasswordByPhone = async (payload: {
	uid: string
	password: string
	[key: string]: any
}) => {
	return await axios.post(AUTH_ROUTES.forgetPassword, payload)
}

export const logout = async (payload: { [key: string]: any }) => {
	return await axios.post(AUTH_ROUTES.logout, payload)
}

export const registerByPhone = async (payload: {
	uid: string
	password: string
	name: string
	email: string
	invite_code: string
	[key: string]: any
}) => {
	return await axios.post(AUTH_ROUTES.registerByPhone, payload)
}

export const getSystemSettings = async ({
	params = {},
}: {
	params?: { [key: string]: any }
}) => {
	const url = SYSTEM.systemSettings

	return await axios.get(url, {
		params: convertParams(params),
	})
}
