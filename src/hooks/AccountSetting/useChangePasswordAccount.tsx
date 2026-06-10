import { useCallback, useEffect, useState } from 'react'

import { changeUserPassword } from '@/apis/userApis'
import { useLoading } from '@/context/LoadingContext'
import { useModal } from '@/context/ModalContext'
import { mainRoutes } from '@/routes/MainRoutes'
import { useLocalePath } from '@/ultis/route'
import { setSessionStorage } from '@/ultis/storage'
import { FORGET_PASSWORD_FROM_ACCOUNT_SESSION_KEY } from '@/Variable/common.variable'
import { passwordRegex } from '@/Variable/regex.variable'

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

	const handleForgotPassword = useCallback(() => {
		setSessionStorage({
			key: FORGET_PASSWORD_FROM_ACCOUNT_SESSION_KEY,
			data: { fromAccount: true },
		})

		onChangeRoute(`${mainRoutes.forgetPassword}?fromAccount=1`)
	}, [onChangeRoute])

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
