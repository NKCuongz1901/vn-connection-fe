import md5 from 'md5'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { useLoading } from '@/context/LoadingContext'
import { useModal } from '@/context/ModalContext'

import { loginByPhone } from '@/apis/authApis'

import { delay, formatPhone, toJson } from '@/ultis/common.ults'
import { useLocalePath } from '@/ultis/route.ults'
import { handleStorageCookie, isLogin } from '@/ultis/storage.ults'

import { mainRoutes } from '@/routes/MainRoutes'

export default function useLogin() {
	const { toggleLoadingContext } = useLoading()
	const { openError } = useModal()
	const { onChangeRoute } = useLocalePath()
	const [account, setAccount] = useState({
		phone: '',
		password: '',
		isRemember: false,
		prefix: '+84',
	})
	const isValidate = useMemo(() => {
		const { phone, password } = account
		return phone.length >= 9 && password.length >= 8
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [toJson(account)])

	const handleChange = useCallback(
		(key: string) => (_value: string | any) => {
			let value = _value
			switch (key) {
				case 'phone':
					value = _value.replace(/[^0-9]/g, '')
					break
				default:
					break
			}
			setAccount((pre) => ({
				...pre,
				[key]: value,
			}))
		},
		[],
	)

	const handleLogin = async () => {
		const { phone, password, prefix, isRemember } = account
		toggleLoadingContext(true)
		try {
			const payload = {
				phone: formatPhone(prefix, phone),
				password: md5(password),
			}
			const res: any = await loginByPhone(payload)

			if (res.code === 200) {
				const { object, refresh_token, token } = res.results || {}
				if (isRemember) {
					handleStorageCookie({ key: 'info', data: object, expireInDays: 300 })
					handleStorageCookie({
						key: 'refresh_token',
						data: refresh_token,
						expireInDays: 300,
					})
					handleStorageCookie({ key: 'token', data: token, expireInDays: 300 })
				} else {
					handleStorageCookie({ key: 'info', data: object })
					handleStorageCookie({
						key: 'refresh_token',
						data: refresh_token,
					})
					handleStorageCookie({ key: 'token', data: token })
				}
				await delay(100)
				onChangeRoute(mainRoutes.home)
			}
		} catch (error: any) {
			openError(error)
		} finally {
			toggleLoadingContext(false)
		}
	}
	useEffect(() => {
		if (isLogin()) return onChangeRoute(mainRoutes.home)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])
	return {
		isValidate,
		account,
		onChange: handleChange,
		onLogin: handleLogin,
	}
}
