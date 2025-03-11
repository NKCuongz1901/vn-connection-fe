import md5 from 'md5'
import { useCallback, useMemo, useState } from 'react'

import { useLoading } from '@/app/context/LoadingContext'

import { loginByPhone } from '@/apis/authApis'

import { toJson } from '@/ultis/common.ults'

export default function useLogin() {
	const { toggleLoadingContext } = useLoading()
	const [account, setAccount] = useState({
		phone: '',
		password: '',
		isRemember: false,
		prefix: '+84',
	})
	const [error, setError] = useState('')
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
			if (error) {
				setError('')
			}
			setAccount((pre) => ({
				...pre,
				[key]: value,
			}))
		},
		[error],
	)
	const formatPhone = useCallback(
		(prefix: string, phone: string) =>
			phone.startsWith('0') ? prefix + phone.slice(1) : prefix + phone,
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
			setError(error.message || 'unknow error')
		} finally {
			toggleLoadingContext(false)
		}
	}
	return {
		isValidate,
		account,
		error,
		onChange: handleChange,
		onLogin: handleLogin,
	}
}
