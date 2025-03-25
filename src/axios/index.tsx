'use client'

import axios from 'axios'

axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL
let isRefreshing = false
let refreshSubscribers = [] as any
let refreshTokenPromise = null as any
axios.interceptors.request.use(
	(config) => {
		const accessToken =
			localStorage.getItem('token') || sessionStorage.getItem('token')
		if (accessToken && !config.headers['Authorization']) {
			config.headers['Authorization'] =
				'Bearer ' + JSON.parse(accessToken ?? '')
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
			const refreshToken =
				localStorage.getItem('refresh_token') ||
				sessionStorage.getItem('refresh_token') ||
				'""'
			const isLocal = Boolean(localStorage.getItem('refresh_token'))
			const response = await axios.post('/auth/refresh', {
				refresh_token: JSON.parse(refreshToken),
			})
			if (response.data?.code === 200) {
				const newAccessToken = response.data?.results?.object?.access_token
				const newRefreshToken = response.data?.results?.object?.refresh_token
				if (isLocal) {
					localStorage.setItem('token', JSON.stringify(newAccessToken))
					localStorage.setItem('refresh_token', JSON.stringify(newRefreshToken))
				} else {
					sessionStorage.setItem('token', JSON.stringify(newAccessToken))
					sessionStorage.setItem(
						'refresh_token',
						JSON.stringify(newRefreshToken),
					)
				}

				onRefreshed(newAccessToken)
				return newAccessToken
			}
		} catch (error: any) {
			console.error('Unable to refresh token', error)
			if (error?.response?.data?.code === 434) {
				localStorage.clear()
				sessionStorage.clear()
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
					localStorage.clear()
					sessionStorage.clear()
				}
				return Promise.reject(refreshError)
			}
		}
		if (error?.response?.data?.code === 409) {
			localStorage.clear()
			sessionStorage.clear()
		}

		return Promise.reject(error?.response?.data)
	},
)

export default axios
