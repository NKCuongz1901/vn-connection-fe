import md5 from 'md5'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { useLoading } from '@/context/LoadingContext'
import { useModal } from '@/context/ModalContext'

import { checkPhoneExists, loginByPhone } from '@/apis/authApis'

import { delay, formatPhone, toJson } from '@/ultis/common'
import { useLocalePath } from '@/ultis/route'
import { handleStorageCookie, isLogin } from '@/ultis/storage'
import { randomString } from '@/ultis/string'

import { mainRoutes } from '@/routes/MainRoutes'

type UseLoginOptions = {
	onAccountNotFound?: (displayPhone: string) => void
}

export default function useLogin(options?: UseLoginOptions) {
	const { onAccountNotFound } = options || {}
	const { toggleLoadingContext } = useLoading()
	const { openError } = useModal()
	const { onChangeRoute } = useLocalePath()
	const [loginStep, setLoginStep] = useState<'phone' | 'password'>('phone')
	const [account, setAccount] = useState({
		phone: '',
		password: '',
		isRemember: true,
		prefix: '+84',
	})

	const isPhoneValid = useMemo(() => {
		return account.phone.length >= 9
	}, [account.phone])

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
				case 'prefix':
					if (loginStep === 'password') {
						setLoginStep('phone')
						setAccount((pre) => ({
							...pre,
							prefix: value,
							password: '',
						}))
						return
					}
					break
				default:
					break
			}

			if (key === 'phone' && loginStep === 'password') {
				setLoginStep('phone')
				setAccount((pre) => ({
					...pre,
					phone: value,
					password: '',
				}))
				return
			}

			setAccount((pre) => ({
				...pre,
				[key]: value,
			}))
		},
		[loginStep],
	)

	const persistLoginSession = useCallback(
		async (res: any, isRemember: boolean) => {
			const { object, refresh_token, token } = res.results || {}
			const {
				id,
				name,
				avatar,
				country_code,
				email,
				cover,
				latitude,
				longitude,
				is_verified,
			} = object || {}
			const dataInfo = {
				id,
				name,
				avatar,
				country_code,
				email,
				cover,
				latitude,
				longitude,
				is_verified,
			}
			if (isRemember) {
				handleStorageCookie({
					key: 'info',
					data: dataInfo,
					expireInDays: 300,
				})
				handleStorageCookie({
					key: 'refresh_token',
					data: refresh_token,
					expireInDays: 300,
				})
				handleStorageCookie({ key: 'token', data: token, expireInDays: 300 })
			} else {
				handleStorageCookie({ key: 'info', data: dataInfo })
				handleStorageCookie({
					key: 'refresh_token',
					data: refresh_token,
				})
				handleStorageCookie({ key: 'token', data: token })
			}
			await delay(100)
			onChangeRoute(`${mainRoutes.overview}?cookie_id=${randomString()}`)
		},
		[onChangeRoute],
	)

	const handleContinuePhone = async () => {
		const { phone, prefix } = account
		const formattedPhone = formatPhone(prefix, phone)

		toggleLoadingContext(true)
		try {
			const checkRes: any = await checkPhoneExists({ phone: formattedPhone })
			const { is_existed_phone } = checkRes?.results?.object ?? {}

			if (!is_existed_phone) {
				onAccountNotFound?.(phone)
				return
			}

			setLoginStep('password')
		} catch (error: any) {
			openError(error)
		} finally {
			toggleLoadingContext(false)
		}
	}

	const handleLogin = async () => {
		const { phone, password, prefix, isRemember } = account
		const formattedPhone = formatPhone(prefix, phone)

		toggleLoadingContext(true)
		try {
			const res: any = await loginByPhone({
				phone: formattedPhone,
				password: md5(password),
			})

			if (res.code === 200) {
				await persistLoginSession(res, isRemember)
			}
		} catch (error: any) {
			openError(error)
		} finally {
			toggleLoadingContext(false)
		}
	}

	useEffect(() => {
		if (isLogin()) return onChangeRoute(mainRoutes.overview)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return {
		loginStep,
		isPhoneValid,
		isValidate,
		account,
		onChange: handleChange,
		onContinuePhone: handleContinuePhone,
		onLogin: handleLogin,
	}
}
