import md5 from 'md5'
import { useCallback, useEffect, useState } from 'react'

import { useLoading } from '@/context/LoadingContext'
import { useModal } from '@/context/ModalContext'

import {
	checkPhoneExists,
	forgetPasswordByPhone,
	registerByPhone,
	sendOTP,
	verifyOTP,
} from '@/apis/authApis'

import { isArray } from '@/ultis/array.ults'
import { formatPhone, toJson } from '@/ultis/common.ults'
import { useLocalePath } from '@/ultis/route.ults'

import { OTP_TYPE, OTPType } from '@/Variable/common.variable'
import { passwordRegex } from '@/Variable/regex.variable'
import { forgetPasswordStep } from '@/Variable/step.variable'
import { mainRoutes } from '@/routes/MainRoutes'

export default function useRegisterAndReset({ type }: { type: OTPType }) {
	const { toggleLoadingContext } = useLoading()
	const { openError, openSuccess } = useModal()
	const { onChangeRoute } = useLocalePath()
	const [step, setStep] = useState(0)
	const [accountInfo, setAccountInfo] = useState({
		title: 'Verify Phone Number',
		otp: '',
		phone: '',
		password: '',
		confirmPassword: '',
		prefix: '+84',
		uid: '',
		name: '',
		type,
	})
	const [errors, setErrors] = useState({})
	const [isValidate, setIsValidate] = useState(false)
	const handleChangeStep = useCallback((value: number) => {
		setStep(value)
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
		try {
			const data: any = await checkPhoneExists({
				phone: formatPhone(prefix, phone),
			})
			const { is_existed_phone } = data?.results?.object
			switch (type) {
				case OTP_TYPE.FORGET_PASSWORD:
					if (!is_existed_phone) {
						throw new Error('Phone does not exist')
					}
					break
				case OTP_TYPE.REGISTER:
					if (is_existed_phone) {
						throw new Error('Phone already exists')
					}
					break
				default:
					break
			}
			const dataSendOtp: any = await sendOTP({
				phone: formatPhone(prefix, phone),
			})
			if (dataSendOtp?.results?.object?.sid === 'success') {
				setStep(1)
			}
		} catch (error) {
			openError(error)
		} finally {
			toggleLoadingContext(false)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [toJson(accountInfo)])

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
		const { uid, password, name } = accountInfo
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
					// name: formatPhone(prefix, phone),
					email: '',
					invite_code: '',
				}
			}
			const data: any = isRegister
				? await registerByPhone(payload)
				: await forgetPasswordByPhone(payload)
			if (data?.code === 200) {
				openSuccess({
					message: isRegister
						? 'Registration successful, move to login'
						: 'Password changed successfully, move to login',
					onAccept: () => onChangeRoute(mainRoutes.login),
				})
			}
		} catch (error) {
			openError(error)
		} finally {
			toggleLoadingContext()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [toJson(accountInfo), step])
	const handleValidate = useCallback(() => {
		const { phone, password, confirmPassword, name } = accountInfo
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

				if (
					passwordRegex.test(password) &&
					password === confirmPassword &&
					(!isRegister || name.trim())
				) {
					value = true
					break
				}

				if (password !== confirmPassword && confirmPassword) {
					error.confirmPassword = 'Confirm password do not match'
				}
				if (!name.trim() && isRegister) {
					error.name = 'Field is required'
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
					title: forgetPasswordStep[step],
				}))
				break
			default:
				setAccountInfo((pre) => ({
					...pre,
					password: '',
					opt: '',
					title: forgetPasswordStep[step],
				}))
				break
		}
	}, [step])

	useEffect(() => {
		setIsValidate(handleValidate())
	}, [handleValidate])

	return {
		isValidate: isValidate,
		step: step,
		accountInfo: accountInfo,
		errors: errors,
		onChangeStep: handleChangeStep,
		onChangeData: handleChangeAccountInfo,
		onSubmitPhone: handleSubmitPhone,
		onSubmitOtp: handleSubmitOtp,
		onSubmitPass: handleSubmitPass,
	}
}
