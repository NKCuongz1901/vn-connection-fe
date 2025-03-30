'use client'

export const toJson = (data: any) => {
	if (data !== undefined) return JSON.stringify(data)
	return data
}

export const isIOS = (): boolean =>
	/iPhone|iPad|iPod/i.test(navigator.userAgent)

export const formatPhone = (prefix: string, phone: string) =>
	phone.startsWith('0') ? prefix + phone.slice(1) : prefix + phone

export const getUserInfo = (key) => {
	const data = JSON.parse(
		localStorage.getItem('info') || sessionStorage.getItem('info') || '{}',
	)
	return key ? data[key] : data
}
