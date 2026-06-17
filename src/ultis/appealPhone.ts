import { getUserProfile } from '@/apis/userApis'
import { STORAGE_KEY } from '@/Variable/storage.variable'

import { formatPhone } from '@/ultis/common'
import {
	getSessionStorage,
	getUserInfo,
	isLogin,
} from '@/ultis/storage'

const formatProfilePhone = (phone?: string, prefixPhone?: string) => {
	if (!phone) return null
	if (phone.startsWith('+')) return phone
	return formatPhone(prefixPhone || '+84', phone)
}

export const resolveAppealPhone = (error?: { appealPhone?: string }) => {
	if (error?.appealPhone) return error.appealPhone

	const cookiePhone = getUserInfo('appeal_phone')
	if (cookiePhone) return cookiePhone

	const sessionUser = getSessionStorage(STORAGE_KEY.USER) || {}
	return formatProfilePhone(sessionUser.phone, sessionUser.prefix_phone)
}

export const fetchAppealPhone = async () => {
	const cached = resolveAppealPhone()
	if (cached) return cached

	if (!isLogin()) return null

	try {
		const res: any = await getUserProfile({
			params: {
				fields: ['phone', 'prefix_phone'],
			},
		})
		const { phone, prefix_phone } = res?.results?.object || {}
		return formatProfilePhone(phone, prefix_phone)
	} catch {
		return null
	}
}
