'use client'
import axios from 'axios'

import {
	getStorageCookie,
	handleRemoveAllCookie,
	handleStorageCookie,
	isPersistCookie,
} from '@/ultis/storage'

import { getFid } from '@/config/firebase'

let cachedBuildInfo: { version: number } | null = null

const getBuildInfo = async (): Promise<{ version: number }> => {
	if (cachedBuildInfo) return cachedBuildInfo

	try {
		const jsonModule = await import('@/build-info.json')
		cachedBuildInfo = jsonModule.default
		return cachedBuildInfo
	} catch {
		console.warn('build-info.json not found, fallback to Date.now()')
		cachedBuildInfo = { version: Date.now() }
		return cachedBuildInfo
	}
}

axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL
let isRefreshing = false
let refreshSubscribers = [] as any
let refreshTokenPromise = null as any

let cachedFid: string | null = null

axios.interceptors.request.use(
	async (config) => {
		config.headers['platform'] = 'WEB'
		const info = await getBuildInfo()

		// build version
		config.headers['version'] = info.version || ''

		// FID (device ID)
		if (!cachedFid) cachedFid = await getFid()
		if (cachedFid) config.headers['firebase-device-id'] = cachedFid

		if (typeof window !== 'undefined') {
			config.headers['device-info'] = JSON.stringify({
				deviceName: navigator.userAgent,
				deviceModel: 'Web Browser',
				brand: 'Web',
			})
		}

		// Authorization token
		const accessToken = getStorageCookie('token')
		if (accessToken && !config.headers['Authorization']) {
			config.headers['Authorization'] = 'Bearer ' + accessToken
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
			const deviceId = cachedFid || (await getFid())
			const response: any = await axios.post('/auth/refresh', {
				refresh_token: refreshToken,
				...(deviceId ? { device_id: deviceId } : {}),
			})
			if (response?.code === 200) {
				const newAccessToken = response.results?.object?.access_token
				const newRefreshToken = response.results?.object?.refresh_token
				console.log('Check refresh token:', response)
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
