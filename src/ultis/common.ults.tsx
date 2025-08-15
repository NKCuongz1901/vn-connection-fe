'use client'

import { cloneDeep as _cloneDeep } from 'lodash'

export const toJson = (data: any) => {
	if (data !== undefined) return JSON.stringify(data)
	return data
}

export const isIOS = (): boolean =>
	/iPhone|iPad|iPod/i.test(navigator.userAgent)

export const formatPhone = (prefix: string, phone: string) =>
	phone.startsWith('0') ? prefix + phone.slice(1) : prefix + phone

export const cloneDeep = (obj: any) => (obj ? _cloneDeep(obj) : obj)

export const isFunction = (value: any) => typeof value === 'function'
export const delay = (n: number) =>
	new Promise((resolve) => setTimeout(resolve, n))
export const isMobile = () =>
	window.matchMedia('(min-width: 0px) and (max-width: 769px)').matches
export const isEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

export const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
	return new Promise((resolve, reject) => {
		navigator.geolocation.getCurrentPosition(
			(position) => {
				const lat = position.coords.latitude
				const lng = position.coords.longitude
				resolve({ lat, lng })
			},
			(error) => {
				reject(error)
			},
		)
	})
}

export const handleScrollCallback = (e: any, cb: any) => {
	const clientHeight = e.target.clientHeight
	const scrollHeight = e.target.scrollHeight
	const scrollTop = Math.abs(e.target.scrollTop)
	const isReachedEnd = scrollTop + clientHeight >= scrollHeight - 50
	if (!isReachedEnd) return

	cb()
}
