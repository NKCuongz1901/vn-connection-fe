import axios from '../axios'
import { AUTH_ROUTES } from '@/routes'

export const loginByPhone = async (payload: {
	phone: string
	password: string
	[key: string]: any
}) => {
	return await axios.post(AUTH_ROUTES.loginPhone, payload)
}
// export const changePassWord = async (payload) => {
// 	return await axios.put(AUTHROUTES.change_password, payload)
// }
// export const logout = async (payload) => {
// 	return await axios.post(AUTHROUTES.logout, payload)
// }
// export const createDynamicLink = async (payload) => {
// 	return await axios.post(AUTHROUTES.dynamicLink, payload)
// }
