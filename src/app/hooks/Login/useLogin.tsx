import md5 from 'md5'
import { useCallback, useMemo, useState } from 'react'

import { loginByPhone } from '@/apis/authApis'

import { toJson } from '@/ultis/common.ults'
const useLogin = () => {
	const [account, setAccount] = useState({
		phone: '',
		password: '',
		isRemember: false,
		prefix: '+84',
	})
	const isValidate = useMemo(() => {
		const { phone, password } = account
		return phone.length >= 9 && password.length >= 6
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
	const formatPhone = useCallback(
		(prefix: string, phone: string) =>
			phone.startsWith('0') ? prefix + phone.slice(1) : prefix + phone,
		[],
	)

	const handleLogin = async () => {
		const { phone, password, prefix } = account
		try {
			const payload = {
				phone: formatPhone(prefix, phone),
				password: md5(password),
			}
			const res = await loginByPhone(payload)
			console.log('res', res)
		} catch (error) {
			console.log('error', error)
		}
	}
	return {
		isValidate,
		account,
		onChange: handleChange,
		onLogin: handleLogin,
	}
}

export default useLogin
