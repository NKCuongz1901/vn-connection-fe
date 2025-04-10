import md5 from 'md5'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { useLoading } from '@/context/LoadingContext'
import { useModal } from '@/context/ModalContext'

import { loginByPhone } from '@/apis/authApis'

import { delay, formatPhone, isLogin, toJson } from '@/ultis/common.ults'
import { useLocalePath } from '@/ultis/route.ults'

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
					localStorage.setItem('info', JSON.stringify(object))
					localStorage.setItem('refresh_token', JSON.stringify(refresh_token))
					localStorage.setItem('token', JSON.stringify(token))
					delay(100)
					onChangeRoute(mainRoutes.home)
				} else {
					sessionStorage.setItem('info', JSON.stringify(object))
					sessionStorage.setItem('refresh_token', JSON.stringify(refresh_token))
					sessionStorage.setItem('token', JSON.stringify(token))
				}
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
