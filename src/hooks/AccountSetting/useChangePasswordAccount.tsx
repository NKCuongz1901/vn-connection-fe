import { useCallback, useEffect, useState } from 'react'

import { sendOTP, sendToMail } from '@/apis/authApis'
import { changeUserPassword } from '@/apis/userApis'
import { useLoading } from '@/context/LoadingContext'
import { useModal } from '@/context/ModalContext'
import { mainRoutes } from '@/routes/MainRoutes'
import { formatPhone } from '@/ultis/common'
import { useLocalePath } from '@/ultis/route'
import { getSessionStorage, getUserInfo, setSessionStorage } from '@/ultis/storage'
import { FORGET_PASSWORD_FROM_ACCOUNT_SESSION_KEY } from '@/Variable/common.variable'
import { passwordRegex } from '@/Variable/regex.variable'
import { STORAGE_KEY } from '@/Variable/storage.variable'

type FormErrors = {
	oldPassword?: string
	newPassword?: string
	confirmPassword?: string
}

export default function useChangePasswordAccount() {
	const { toggleLoadingContext } = useLoading()
	const { openError, openSuccess } = useModal()
	const { onChangeRoute } = useLocalePath()

	const [oldPassword, setOldPassword] = useState('')
	const [newPassword, setNewPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [errors, setErrors] = useState<FormErrors>({})
	const [isValid, setIsValid] = useState(false)

	const validate = useCallback(() => {
		const nextErrors: FormErrors = {}

		if (newPassword && !passwordRegex.test(newPassword)) {
			nextErrors.newPassword =
				'Password must be at least 8 characters with letters, numbers and symbols'
		}
		if (newPassword !== confirmPassword && confirmPassword) {
			nextErrors.confirmPassword = 'Confirm password do not match'
		}

		const valid =
			!!oldPassword.trim() &&
			passwordRegex.test(newPassword) &&
			newPassword === confirmPassword

		setErrors(nextErrors)
		setIsValid(valid)
		return valid
	}, [oldPassword, newPassword, confirmPassword])

	useEffect(() => {
		validate()
	}, [validate])

	const handleSubmit = useCallback(async () => {
		if (!validate()) return

		toggleLoadingContext(true)
		try {
			const res: any = await changeUserPassword({
				old_password: oldPassword,
				new_password: newPassword,
			})
			if (res?.code === 200) {
				openSuccess({
					message: 'Password changed successfully',
					onAccept: () =>
						onChangeRoute(`${mainRoutes.accountSetting}/manage-account`),
				})
			}
		} catch (error) {
			openError(error)
		} finally {
			toggleLoadingContext(false)
		}
	}, [
		oldPassword,
		newPassword,
		onChangeRoute,
		openError,
		openSuccess,
		toggleLoadingContext,
		validate,
	])

	const handleGoBack = useCallback(() => {
		onChangeRoute(`${mainRoutes.accountSetting}/manage-account`)
	}, [onChangeRoute])

	const handleForgotPassword = useCallback(async () => {
		toggleLoadingContext(true)
		try {
			const user = {
				...(getUserInfo() || {}),
				...(getSessionStorage(STORAGE_KEY.USER) || {}),
			}
			const hasEmail = Boolean(user?.email?.trim())
			const prefix = user?.prefix_phone ?? '+84'
			const phone = user?.phone ?? ''

			const navigateToForgetPassword = (data: {
				channel: 'email' | 'sms'
				email_masked?: string
			}) => {
				setSessionStorage({
					key: FORGET_PASSWORD_FROM_ACCOUNT_SESSION_KEY,
					data: {
						phone,
						prefix,
						channel: data.channel,
						email_masked: data.email_masked,
						fromAccount: true,
					},
				})

				const params = new URLSearchParams({
					fromAccount: '1',
					channel: data.channel,
				})
				if (data.email_masked) {
					params.set('email', data.email_masked)
				}
				if (phone) {
					params.set('phone', phone)
					params.set('prefix', prefix)
				}

				onChangeRoute(`${mainRoutes.forgetPassword}?${params.toString()}`)
			}

			if (hasEmail) {
				const res: any = await sendToMail()
				const { sid, email_masked } = res?.results?.object ?? {}

				if (sid === 'success' && email_masked) {
					navigateToForgetPassword({ channel: 'email', email_masked })
					return
				}
			}

			if (!phone) {
				openError({
					message: 'Unable to send OTP. Please update your phone number.',
				})
				return
			}

			const res: any = await sendOTP({ phone: formatPhone(prefix, phone) })
			if (res?.results?.object?.sid === 'success') {
				navigateToForgetPassword({ channel: 'sms' })
				return
			}

			openError({ message: 'Failed to send OTP' })
		} catch (error) {
			openError(error)
		} finally {
			toggleLoadingContext(false)
		}
	}, [onChangeRoute, openError, toggleLoadingContext])

	return {
		oldPassword,
		newPassword,
		confirmPassword,
		errors,
		isValid,
		setOldPassword,
		setNewPassword,
		setConfirmPassword,
		onSubmit: handleSubmit,
		onGoBack: handleGoBack,
		onForgotPassword: handleForgotPassword,
	}
}
