import { toJson } from '@/ultis/common.ults'
import { useCallback, useMemo, useState } from 'react'

const useLogin = () => {
	const [account, setAccount] = useState({
		phone: '',
		password: '',
		isRemember: false,
		prefix: '+84',
	})
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
	const isValidate = useMemo(() => {
		const { phone, password } = account
		return phone.length >= 9 && password.length >= 6
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [toJson(account)])

	return {
		isValidate,
		account,
		onChange: handleChange,
	}
}

export default useLogin
