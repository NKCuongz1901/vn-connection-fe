'use client'
import axios from 'axios'

import {
	getStorageCookie,
	handleRemoveAllCookie,
	handleStorageCookie,
	isPersistCookie,
} from '@/ultis/storage.ults'

axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL
let isRefreshing = false
let refreshSubscribers = [] as any
let refreshTokenPromise = null as any
axios.interceptors.request.use(
	(config) => {
		config.headers['platform'] = 'WEB'
		const accessToken = getStorageCookie('token')
		if (accessToken && !config.headers['Authorization']) {
			config.headers['Authorization'] = 'Bearer ' + (accessToken ?? '')
		}
		return config
	},
	(error) => Promise.reject(error),
)
const onRefreshed = (token: any) => {
	refreshSubscribers.map((callback: any) => callback(token))
	refreshSubscribers = []
}

const addRefreshSubscriber = (callback: any) => {
	refreshSubscribers.push(callback)
}

const refreshToken = async () => {
	if (!isRefreshing) {
		isRefreshing = true
		try {
			const refreshToken = getStorageCookie('refresh_token')
			const response: any = await axios.post('/auth/refresh', {
				refresh_token: refreshToken,
			})
			if (response?.code === 200) {
				const newAccessToken = response.results?.object?.access_token
				const newRefreshToken = response.results?.object?.refresh_token
				if (isPersistCookie()) {
					handleStorageCookie({
						key: 'token',
						data: newAccessToken,
						expireInDays: 300,
					})
					handleStorageCookie({
						key: 'refresh_token',
						data: newRefreshToken,
						expireInDays: 300,
					})
				} else {
					handleStorageCookie({
						key: 'token',
						data: newAccessToken,
					})
					handleStorageCookie({
						key: 'refresh_token',
						data: newRefreshToken,
					})
				}
				onRefreshed(newAccessToken)
				return newAccessToken
			}
		} catch (error: any) {
			console.error('Unable to refresh token', error)
			if (error?.response?.data?.code === 434) {
				handleRemoveAllCookie()
			}
			throw error
		} finally {
			isRefreshing = false
			refreshTokenPromise = null // Reset the promise after refreshing
		}
	}

	if (!refreshTokenPromise) {
		refreshTokenPromise = new Promise((resolve, _reject) => {
			addRefreshSubscriber(resolve)
		})
	}

	return refreshTokenPromise
}

axios.interceptors.response.use(
	(response) => {
		return response.data
	},
	async (error) => {
		const originalConfig = error.config
		if (error?.response?.data?.code === 403) {
			try {
				const newAccessToken = await refreshToken()
				if (newAccessToken) {
					originalConfig.headers['Authorization'] = 'Bearer ' + newAccessToken
					return axios(originalConfig)
				}
			} catch (refreshError: any) {
				console.log('Failed to refresh token', refreshError)
				if (refreshError?.response?.data?.code === 409) {
					handleRemoveAllCookie()
				}
				return Promise.reject(refreshError)
			}
		}
		if (error?.response?.data?.code === 409) {
			handleRemoveAllCookie()
		}

		return Promise.reject(error?.response?.data)
	},
)

export default axios
