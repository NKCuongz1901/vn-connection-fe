import md5 from 'md5'
import { useCallback, useMemo, useState } from 'react'

import { useLoading } from '@/context/LoadingContext'
import { useModal } from '@/context/ModalContext'

import { loginByPhone } from '@/apis/authApis'

import { formatPhone, toJson } from '@/ultis/common.ults'

export default function useLogin() {
	const { toggleLoadingContext } = useLoading()
	const { openError } = useModal()
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
				} else {
					sessionStorage.setItem('info', JSON.stringify(object))
					sessionStorage.setItem('refresh_token', JSON.stringify(refresh_token))
					sessionStorage.setItem('token', JSON.stringify(token))
				}
			}
		} catch (error: any) {
			console.log('error', error)
			openError(error)
		} finally {
			toggleLoadingContext(false)
		}
	}
	return {
		isValidate,
		account,
		onChange: handleChange,
		onLogin: handleLogin,
	}
}
