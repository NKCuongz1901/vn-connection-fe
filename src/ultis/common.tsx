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

export const cloneDeep = <T,>(obj: T): T => {
	return obj ? _cloneDeep(obj) : obj
}

export const isFunction = (value: any) => typeof value === 'function'
export const delay = (n: number) =>
	new Promise((resolve) => setTimeout(resolve, n))
export const isMobile = () =>
	window.matchMedia('(min-width: 0px) and (max-width: 769px)').matches
export const isEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

const getGeolocationPermissionState = async (): Promise<PermissionState | null> => {
	if (!navigator.permissions?.query) return null

	try {
		const status = await navigator.permissions.query({
			name: 'geolocation' as PermissionName,
		})
		return status.state
	} catch (permissionError) {
		console.log('permissionError:', permissionError)
		return null
	}
}

const mapGeolocationErrorMessage = (error: GeolocationPositionError) => {
	switch (error.code) {
		case error.PERMISSION_DENIED:
			return 'Location permission was denied. Please allow location access and try again.'
		case error.POSITION_UNAVAILABLE:
			return 'Current position is unavailable. Please turn on GPS/location services and try again.'
		case error.TIMEOUT:
			return 'Location request timed out. Please try again in a place with better signal.'
		default:
			return error.message || 'Unable to get your current location.'
	}
}

export const getCurrentLocation = async (): Promise<{ lat: number; lng: number }> => {
	if (!navigator.geolocation) {
		throw new Error('Geolocation is not supported by this browser.')
	}

	const permissionState = await getGeolocationPermissionState()
	if (permissionState === 'denied') {
		throw new Error(
			'Location permission is blocked. Please enable location access in your browser settings.',
		)
	}

	return new Promise((resolve, reject) => {
		navigator.geolocation.getCurrentPosition(
			(position) => {
				const lat = position.coords.latitude
				const lng = position.coords.longitude
				resolve({ lat, lng })
			},
			(error) => {
				reject(new Error(mapGeolocationErrorMessage(error)))
			},
			{
				enableHighAccuracy: true,
				timeout: 15000,
				maximumAge: 0,
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
