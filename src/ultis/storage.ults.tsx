'use client'
export const handleStorageCookie = ({
	key,
	data,
	expireInDays,
}: {
	key: string
	data: any
	expireInDays?: number
}) => {
	if (typeof document === 'undefined') return

	const value = encodeURIComponent(JSON.stringify(data))
	let cookie = `${key}=${value}; path=/;`
	if (typeof expireInDays === 'number' && expireInDays > 0) {
		const expireDate = new Date()
		expireDate.setDate(expireDate.getDate() + expireInDays)
		cookie += ` expires=${expireDate.toUTCString()};`

		if (key === 'refresh_token') {
			document.cookie = `refresh_token_flag=persist; path=/; expires=${expireDate.toUTCString()};`
		}
	} else {
		if (key === 'refresh_token') {
			document.cookie = `refresh_token_flag=session; path=/;`
		}
	}

	document.cookie = cookie
}

export const getStorageCookie = (key: string) => {
	const match = document.cookie.match(new RegExp('(^| )' + key + '=([^;]+)'))
	if (!match) return null

	try {
		return JSON.parse(decodeURIComponent(match[2]))
	} catch {
		return null
	}
}

export const isPersistCookie = (): boolean => {
	return getStorageCookie('refresh_token_flag') === 'persist'
}

export const removeStorageCookie = (key: string) => {
	if (typeof document === 'undefined') return

	document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;`

	if (key === 'refresh_token') {
		document.cookie = `refresh_token_flag=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;`
	}
}

export const getUserInfo = (key?: string) => {
	const data = getStorageCookie('info') || {}
	return key ? data[key] : data
}

export const isLogin = () => {
	const token = getStorageCookie('token')
	const info = getStorageCookie('info')
	const refreshToken = getStorageCookie('refresh_token')

	return !!(token && info && refreshToken)
}

export const handleRemoveAllCookie = () => {
	document.cookie.split(';').forEach((c) => {
		document.cookie = c
			.replace(/^ +/, '')
			.replace(/=.*/, '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/')
	})

	// const keys = ['token', 'refresh_token', 'info', 'refresh_token_flag']
	// keys.forEach((i) => {
	// 	removeStorageCookie(i)
	// })
}
