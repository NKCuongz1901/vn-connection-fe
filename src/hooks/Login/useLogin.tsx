import md5 from 'md5'
import { useCallback, useEffect, useMemo, useState } from 'react'

import type { OtpSendMethod } from '@/Components/Auth/SelectOtpMethod'
import { useLoading } from '@/context/LoadingContext'
import { useModal } from '@/context/ModalContext'

import {
	checkOTP,
	checkPhoneExists,
	loginByPhone,
	sendOTP,
	sendToWhatsapp,
	sendToZalo,
} from '@/apis/authApis'

import { delay, formatPhone, toJson } from '@/ultis/common'
import { useLocalePath } from '@/ultis/route'
import { handleStorageCookie, isLogin, setSessionStorage } from '@/ultis/storage'
import { randomString } from '@/ultis/string'

import { mainRoutes } from '@/routes/MainRoutes'
import { REGISTER_FROM_LOGIN_SESSION_KEY } from '@/Variable/common.variable'

type LoginStep = 'phone' | 'password' | 'registerOtp'

type UseLoginOptions = {
	onAccountNotFound?: (displayPhone: string) => void
}

/** Sends register OTP via the selected channel. */
const sendRegisterOtpByMethod = async ({
	method,
	phone,
	language,
}: {
	method: OtpSendMethod
	phone: string
	language: string
}) => {
	if (method === 'zalo') {
		return sendToZalo({ phone, language })
	}
	if (method === 'whatsapp') {
		return sendToWhatsapp({ phone, language })
	}
	return sendOTP({ phone })
}

export default function useLogin(options?: UseLoginOptions) {
	const { onAccountNotFound } = options || {}
	const { toggleLoadingContext } = useLoading()
	const { openError } = useModal()
	const { onChangeRoute, locale } = useLocalePath()
	const [loginStep, setLoginStep] = useState<LoginStep>('phone')
	const [otpMethod, setOtpMethod] = useState<OtpSendMethod>('sms')
	const [isVnPhone, setIsVnPhone] = useState(false)
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
					if (loginStep === 'password' || loginStep === 'registerOtp') {
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

			if (
				key === 'phone' &&
				(loginStep === 'password' || loginStep === 'registerOtp')
			) {
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
		async (res: any, isRemember: boolean, formattedPhone?: string) => {
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
				phone,
				prefix_phone,
			} = object || {}
			const appealPhone =
				formattedPhone ||
				(phone
					? phone.startsWith('+')
						? phone
						: formatPhone(prefix_phone || '+84', phone)
					: undefined)
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
				...(appealPhone ? { appeal_phone: appealPhone } : {}),
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
				await persistLoginSession(res, isRemember, formattedPhone)
			}
		} catch (error: any) {
			openError({
				...error,
				appealPhone: formattedPhone,
			})
		} finally {
			toggleLoadingContext(false)
		}
	}

	/** Opens register OTP method selection after account-not-found. */
	const handleStartRegister = useCallback(async () => {
		const { phone, prefix } = account
		if (phone.length < 9) return

		setLoginStep('registerOtp')
		setOtpMethod('sms')
		toggleLoadingContext(true)
		try {
			const checkRes: any = await checkOTP({
				phone: formatPhone(prefix, phone),
				prefix_phone: prefix,
			})
			const vnPhone = Boolean(checkRes?.results?.object?.status)
			setIsVnPhone(vnPhone)
			if (!vnPhone) {
				setOtpMethod('sms')
			}
		} catch (error: any) {
			setIsVnPhone(false)
			setOtpMethod('sms')
			openError(error)
		} finally {
			toggleLoadingContext(false)
		}
	}, [account, openError, toggleLoadingContext])

	const handleChangeOtpMethod = useCallback((method: OtpSendMethod) => {
		setOtpMethod(method)
	}, [])

	/** Sends register OTP then continues to Register OTP verify step. */
	const handleSendRegisterOtp = useCallback(async () => {
		const { phone, prefix } = account
		const formattedPhone = formatPhone(prefix, phone)
		const language = String(locale || 'en')

		toggleLoadingContext(true)
		try {
			const res: any = await sendRegisterOtpByMethod({
				method: otpMethod,
				phone: formattedPhone,
				language,
			})
			if (res?.results?.object?.sid !== 'success') {
				throw new Error('Failed to send OTP')
			}

			setSessionStorage({
				key: REGISTER_FROM_LOGIN_SESSION_KEY,
				data: {
					phone,
					prefix,
					otpSent: true,
					otpMethod,
				},
			})
			onChangeRoute(mainRoutes.register)
		} catch (error: any) {
			openError(error)
		} finally {
			toggleLoadingContext(false)
		}
	}, [
		account,
		locale,
		onChangeRoute,
		openError,
		otpMethod,
		toggleLoadingContext,
	])

	useEffect(() => {
		if (isLogin()) return onChangeRoute(mainRoutes.overview)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return {
		loginStep,
		isPhoneValid,
		isValidate,
		account,
		otpMethod,
		isVnPhone,
		onChange: handleChange,
		onContinuePhone: handleContinuePhone,
		onLogin: handleLogin,
		onStartRegister: handleStartRegister,
		onChangeOtpMethod: handleChangeOtpMethod,
		onSendRegisterOtp: handleSendRegisterOtp,
	}
}
