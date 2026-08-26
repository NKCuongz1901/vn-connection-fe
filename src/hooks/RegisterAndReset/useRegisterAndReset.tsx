import md5 from 'md5'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useLoading } from '@/context/LoadingContext'
import { useModal } from '@/context/ModalContext'

import type { OtpSendMethod } from '@/Components/Auth/SelectOtpMethod'
import {
	checkOTP,
	checkPhoneExists,
	forgetPasswordByPhone,
	registerByPhone,
	sendOTP,
	sendToMail,
	sendToWhatsapp,
	sendToZalo,
	verifyOTP,
} from '@/apis/authApis'

import { isArray } from '@/ultis/array'
import { formatPhone, toJson } from '@/ultis/common'
import { useLocalePath } from '@/ultis/route'
import { getSessionStorage } from '@/ultis/storage'

import {
	FORGET_PASSWORD_FROM_ACCOUNT_SESSION_KEY,
	OTP_TYPE,
	OTPType,
	REGISTER_FROM_LOGIN_SESSION_KEY,
} from '@/Variable/common.variable'
import { emailRegex, passwordRegex } from '@/Variable/regex.variable'
import { forgetPasswordStep } from '@/Variable/step.variable'
import { mainRoutes } from '@/routes/MainRoutes'

type RegisterFromLoginInit = {
	phone: string
	prefix: string
	otpSent?: boolean
	otpMethod?: OtpSendMethod
}

type ForgetPasswordFromAccountInit = {
	fromAccount: true
}

type OtpChannel = 'email' | OtpSendMethod

/** Sends OTP via WhatsApp, Zalo, or SMS. */
const sendOtpByMethod = async ({
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

let forgetPasswordFromAccountCache:
	| ForgetPasswordFromAccountInit
	| null
	| undefined

export const clearForgetPasswordFromAccount = () => {
	forgetPasswordFromAccountCache = undefined
	if (typeof window !== 'undefined') {
		sessionStorage.removeItem(FORGET_PASSWORD_FROM_ACCOUNT_SESSION_KEY)
	}
}

const readForgetPasswordFromQuery =
	(): ForgetPasswordFromAccountInit | null => {
		if (typeof window === 'undefined') return null

		const params = new URLSearchParams(window.location.search)
		if (params.get('fromAccount') !== '1') return null

		return { fromAccount: true }
	}

const readRegisterFromLogin = (type: OTPType): RegisterFromLoginInit | null => {
	if (typeof window === 'undefined') return null
	if (type !== OTP_TYPE.REGISTER) return null

	const init = getSessionStorage(REGISTER_FROM_LOGIN_SESSION_KEY)
	if (!init?.phone) return null

	sessionStorage.removeItem(REGISTER_FROM_LOGIN_SESSION_KEY)

	return {
		phone: init.phone,
		prefix: init.prefix || '+84',
		otpSent: Boolean(init.otpSent),
		otpMethod: init.otpMethod || 'sms',
	}
}

const readForgetPasswordFromAccount = (
	type: OTPType,
): ForgetPasswordFromAccountInit | null => {
	if (typeof window === 'undefined') return null
	if (type !== OTP_TYPE.FORGET_PASSWORD) return null

	if (forgetPasswordFromAccountCache !== undefined) {
		return forgetPasswordFromAccountCache
	}

	const init = getSessionStorage(FORGET_PASSWORD_FROM_ACCOUNT_SESSION_KEY)
	let result: ForgetPasswordFromAccountInit | null = null

	if (init?.fromAccount) {
		result = { fromAccount: true }
	} else {
		result = readForgetPasswordFromQuery()
	}

	forgetPasswordFromAccountCache = result
	return result
}

const createInitialAccountInfo = (
	type: OTPType,
	steps: string[],
	loginInit: RegisterFromLoginInit | null,
	forgetInit: ForgetPasswordFromAccountInit | null,
) => ({
	title: loginInit
		? (steps[1] ?? 'Code Verification')
		: (steps[0] ?? 'Enter Phone Number'),
	otp: '',
	phone: loginInit?.phone ?? '',
	password: '',
	confirmPassword: '',
	prefix: loginInit?.prefix ?? '+84',
	uid: '',
	name: '',
	invite_code: '',
	email: '',
	type,
	checked: false,
})

export default function useRegisterAndReset({
	type,
	steps = forgetPasswordStep,
}: {
	type: OTPType
	steps?: string[]
}) {
	const { toggleLoadingContext } = useLoading()
	const { openError, openSuccess } = useModal()
	const { onChangeRoute, locale } = useLocalePath()
	const otpFromLoginSentRef = useRef(false)

	const [loginInit] = useState(() => readRegisterFromLogin(type))
	const [forgetInit] = useState(() => readForgetPasswordFromAccount(type))
	const [fromAccount] = useState(() => Boolean(forgetInit?.fromAccount))
	const [step, setStep] = useState(() => (loginInit ? 1 : 0))
	const [otpChannel, setOtpChannel] = useState<OtpChannel>(() =>
		loginInit ? loginInit.otpMethod || 'sms' : 'email',
	)
	const [otpDestination, setOtpDestination] = useState(() =>
		loginInit ? formatPhone(loginInit.prefix, loginInit.phone) : '',
	)
	const [isVnPhone, setIsVnPhone] = useState(false)
	const [showAlternateMethods, setShowAlternateMethods] = useState(false)
	const [accountInfo, setAccountInfo] = useState(() =>
		createInitialAccountInfo(type, steps, loginInit, forgetInit),
	)
	const [errors, setErrors] = useState({})
	const [isValidate, setIsValidate] = useState(false)

	const formattedPhone = useMemo(
		() => formatPhone(accountInfo.prefix, accountInfo.phone),
		[accountInfo.phone, accountInfo.prefix],
	)

	/** Checks whether Zalo OTP is available for this phone. */
	const resolveVnPhone = useCallback(async (prefix: string, phone: string) => {
		try {
			const checkRes: any = await checkOTP({
				phone: formatPhone(prefix, phone),
				prefix_phone: prefix,
			})
			return Boolean(checkRes?.results?.object?.status)
		} catch {
			return false
		}
	}, [])

	const handleChangeStep = useCallback((value: number) => {
		setStep(value)
		if (value === 0) {
			setShowAlternateMethods(false)
		}
	}, [])

	const handleChangeAccountInfo = useCallback(
		(key: string) => (_value: any) => {
			let value = _value
			switch (key) {
				case 'phone':
					value = _value.replace(/[^0-9]/g, '')
					break
				case 'otp':
					if (isArray(value)) {
						value = _value.join('')
					}
					break
				default:
					break
			}
			setAccountInfo((pre) => ({
				...pre,
				[key]: value,
			}))
		},
		[],
	)

	const handleSubmitPhone = useCallback(async () => {
		toggleLoadingContext(true)
		const { prefix, phone } = accountInfo
		const formattedPhone = formatPhone(prefix, phone)

		try {
			const data: any = await checkPhoneExists({ phone: formattedPhone })
			const { is_existed_phone } = data?.results?.object ?? {}

			if (type === OTP_TYPE.FORGET_PASSWORD) {
				if (!is_existed_phone) {
					throw new Error('Phone does not exist')
				}

				const mailRes: any = await sendToMail({
					phone: formattedPhone,
					language: String(locale || 'en'),
				})
				const { sid, email_masked } = mailRes?.results?.object ?? {}

				if (sid !== 'success') {
					throw new Error('Failed to send OTP')
				}

				setOtpChannel('email')
				if (email_masked) {
					setOtpDestination(email_masked)
					setAccountInfo((pre) => ({ ...pre, email: email_masked }))
				}
				setShowAlternateMethods(false)
				setStep(1)
				return
			}

			if (type === OTP_TYPE.REGISTER) {
				if (is_existed_phone) {
					throw new Error('Phone already exists')
				}

				const dataSendOtp: any = await sendOTP({ phone: formattedPhone })
				if (dataSendOtp?.results?.object?.sid === 'success') {
					setOtpChannel('sms')
					setOtpDestination(formattedPhone)
					setStep(1)
				}
			}
		} catch (error) {
			openError(error)
		} finally {
			toggleLoadingContext(false)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [toJson(accountInfo), type])

	const handleResendEmailOtp = useCallback(async () => {
		const { prefix, phone } = accountInfo
		const res: any = await sendToMail({
			phone: formatPhone(prefix, phone),
			language: String(locale || 'en'),
		})
		const { sid, email_masked } = res?.results?.object ?? {}
		if (sid !== 'success') {
			throw res
		}
		if (email_masked) {
			setOtpDestination(email_masked)
			setAccountInfo((pre) => ({ ...pre, email: email_masked }))
		}
	}, [accountInfo, locale])

	const handleResendRegisterOtp = useCallback(async () => {
		const { prefix, phone } = accountInfo
		const method: OtpSendMethod =
			otpChannel === 'email' ? 'sms' : (otpChannel as OtpSendMethod)
		const formatted = formatPhone(prefix, phone)
		const res: any = await sendOtpByMethod({
			method,
			phone: formatted,
			language: String(locale || 'en'),
		})
		if (res?.results?.object?.sid !== 'success') {
			throw res
		}
		setOtpDestination(formatted)
	}, [accountInfo, locale, otpChannel])

	const handleResendOtp = useCallback(async () => {
		toggleLoadingContext(true)
		try {
			if (otpChannel === 'email') {
				await handleResendEmailOtp()
			} else {
				await handleResendRegisterOtp()
			}
		} catch (error) {
			openError(error)
		} finally {
			toggleLoadingContext(false)
		}
	}, [
		handleResendEmailOtp,
		handleResendRegisterOtp,
		openError,
		otpChannel,
		toggleLoadingContext,
	])

	/** Reveals WhatsApp / Zalo / SMS options after Get OTP via phone. */
	const handleSwitchToSms = useCallback(async () => {
		if (!accountInfo.phone) {
			openError({ message: 'No phone number found' })
			return
		}

		toggleLoadingContext(true)
		try {
			const vnPhone = await resolveVnPhone(
				accountInfo.prefix,
				accountInfo.phone,
			)
			setIsVnPhone(vnPhone)
			setShowAlternateMethods(true)
		} catch (error) {
			openError(error)
		} finally {
			toggleLoadingContext(false)
		}
	}, [
		accountInfo.phone,
		accountInfo.prefix,
		openError,
		resolveVnPhone,
		toggleLoadingContext,
	])

	/** Sends OTP via a phone channel chosen on the email OTP screen. */
	const handleSelectAlternateMethod = useCallback(
		async (method: OtpSendMethod) => {
			const { prefix, phone } = accountInfo
			if (!phone) {
				openError({ message: 'No phone number found' })
				return
			}
			const formatted = formatPhone(prefix, phone)
			toggleLoadingContext(true)
			try {
				const res: any = await sendOtpByMethod({
					method,
					phone: formatted,
					language: String(locale || 'en'),
				})
				if (res?.results?.object?.sid !== 'success') {
					throw new Error('Failed to send OTP')
				}
				setOtpChannel(method)
				setOtpDestination(formatted)
				setShowAlternateMethods(false)
				setAccountInfo((pre) => ({ ...pre, otp: '' }))
			} catch (error) {
				openError(error)
			} finally {
				toggleLoadingContext(false)
			}
		},
		[accountInfo, locale, openError, toggleLoadingContext],
	)

	const handleSubmitOtp = useCallback(async () => {
		toggleLoadingContext(true)

		const { otp, prefix, phone } = accountInfo
		try {
			const data: any = await verifyOTP({
				otp_type: type,
				phone: formatPhone(prefix, phone),
				code: otp,
			})
			const { status, token } = data?.results?.object
			if (status !== 'approved') {
				throw new Error('Incorrect OTP code')
			} else {
				setAccountInfo((pre) => ({ ...pre, uid: token }))
				setStep(2)
			}
		} catch (error) {
			openError(error)
		} finally {
			toggleLoadingContext()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [toJson(accountInfo), step])

	const handleSubmitPass = useCallback(async () => {
		const isRegister = type === OTP_TYPE.REGISTER
		const { uid, password, name, email, invite_code } = accountInfo
		toggleLoadingContext(true)

		try {
			let payload = {
				uid: uid,
				password: md5(password),
			} as any
			if (isRegister) {
				payload = {
					...payload,
					name: name,
					email: email || '',
					invite_code: invite_code || '',
				}
			}
			const data: any = isRegister
				? await registerByPhone(payload)
				: await forgetPasswordByPhone(payload)
			if (data?.code === 200) {
				clearForgetPasswordFromAccount()
				openSuccess({
					message: isRegister
						? 'Registration successful, move to login'
						: 'Password changed successfully',
					onAccept: () =>
						onChangeRoute(
							fromAccount
								? `${mainRoutes.accountSetting}/manage-account`
								: mainRoutes.login,
						),
				})
			}
		} catch (error) {
			openError(error)
		} finally {
			toggleLoadingContext()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fromAccount, toJson(accountInfo), step])

	const handleValidate = useCallback(() => {
		const {
			phone,
			password,
			confirmPassword,
			name,
			email,
			invite_code,
			checked,
		} = accountInfo || {}
		const error: { [key: string]: any } = {}
		let value = false
		const isRegister = type === OTP_TYPE.REGISTER

		switch (step) {
			case 0:
				if (phone.length >= 9) {
					value = true
				}
				break
			case 2:
				error.confirmPassword = null
				error.password = null
				error.name = null
				error.email = null
				error.invite_code = null
				if (
					passwordRegex.test(password) &&
					password === confirmPassword &&
					(!isRegister ||
						(name.trim().length > 5 &&
							(!email || emailRegex.test(email)) &&
							(!invite_code || invite_code.length === 8) &&
							checked))
				) {
					value = true
					break
				}
				if (password && !passwordRegex.test(password)) {
					error.password =
						'Password must be at least 8 characters with letters, numbers and symbols'
				}

				if (password !== confirmPassword && confirmPassword) {
					error.confirmPassword = 'Confirm password do not match'
				}
				if (isRegister) {
					if (name && name.trim().length < 5) {
						error.name = 'Please enter both your first and last name'
					}
					if (!!email) {
						if (!emailRegex.test(email)) {
							error.email = 'Invalid email'
						}
					}
					if (!!invite_code) {
						if (invite_code.length !== 8) {
							error.invite_code = 'Referral code must be 8 characters'
						}
					}
				}
				break

			default:
				break
		}
		setErrors((pre) => ({ ...pre, ...error }))
		return value
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [toJson(accountInfo), step])

	useEffect(() => {
		switch (step) {
			case 2:
			case 3:
				setAccountInfo((pre) => ({
					...pre,
					title: steps[step],
				}))
				break
			default:
				setAccountInfo((pre) => ({
					...pre,
					password: '',
					opt: '',
					title: steps[step],
				}))
				break
		}
	}, [step, steps])

	useEffect(() => {
		setIsValidate(handleValidate())
	}, [handleValidate])

	useEffect(() => {
		if (!loginInit || otpFromLoginSentRef.current) return

		otpFromLoginSentRef.current = true
		const { prefix, phone, otpSent, otpMethod } = loginInit

		if (otpSent) {
			setOtpChannel(otpMethod || 'sms')
			setOtpDestination(formatPhone(prefix, phone))
			return
		}

		const sendOtpFromLogin = async () => {
			toggleLoadingContext(true)
			try {
				const dataSendOtp: any = await sendOTP({
					phone: formatPhone(prefix, phone),
				})
				if (dataSendOtp?.results?.object?.sid !== 'success') {
					openError({ message: 'Failed to send OTP. Please try again.' })
				} else {
					setOtpChannel('sms')
					setOtpDestination(formatPhone(prefix, phone))
				}
			} catch (error) {
				openError(error)
			} finally {
				toggleLoadingContext(false)
			}
		}

		sendOtpFromLogin()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [loginInit])

	return {
		isValidate: isValidate,
		step: step,
		accountInfo: accountInfo,
		errors: errors,
		fromAccount,
		otpChannel,
		otpDestination,
		isVnPhone,
		showAlternateMethods,
		formattedPhone,
		onChangeStep: handleChangeStep,
		onChangeData: handleChangeAccountInfo,
		onSubmitPhone: handleSubmitPhone,
		onSubmitOtp: handleSubmitOtp,
		onSubmitPass: handleSubmitPass,
		onResendOtp: handleResendOtp,
		onSwitchToSms: handleSwitchToSms,
		onSelectAlternateMethod: handleSelectAlternateMethod,
		onClearForgetSession: clearForgetPasswordFromAccount,
	}
}
