import { useCallback, useEffect, useMemo, useState } from 'react'

import { addBankAccount, getSummaryRedeemRequest } from '@/apis/referralApis'
import { useModal } from '@/context/ModalContext'
import useProfile from '@/hooks/Profile/useProfile'
import { mainRoutes } from '@/routes/MainRoutes'
import { useLocalePath } from '@/ultis/route'
import { emailRegex } from '@/Variable/regex.variable'

export type BankCardForm = {
	cardHolderName: string
	cardNumber: string
	bankName: string
	phone: string
	email: string
}

const INITIAL_FORM: BankCardForm = {
	cardHolderName: '',
	cardNumber: '',
	bankName: '',
	phone: '',
	email: '',
}

export default function useAddBankCard() {
	const { onChangeRoute } = useLocalePath()
	const { openError, openSuccess } = useModal()
	const { userData } = useProfile({})

	const [form, setForm] = useState<BankCardForm>(INITIAL_FORM)
	const [issuedInVietnam, setIssuedInVietnam] = useState(true)
	const [agreeTerms, setAgreeTerms] = useState(false)
	const [loading, setLoading] = useState(false)

	const isValid = useMemo(() => {
		return (
			!!form.cardHolderName.trim() &&
			!!form.cardNumber.trim() &&
			!!form.bankName.trim() &&
			!!form.email.trim() &&
			emailRegex.test(form.email.trim()) &&
			issuedInVietnam &&
			agreeTerms
		)
	}, [agreeTerms, form, issuedInVietnam])

	/** Updates one form field. */
	const handleChangeField = useCallback(
		(key: keyof BankCardForm) => (e: { target: { value: string } }) => {
			const value = e.target.value
			setForm((prev) => ({ ...prev, [key]: value }))
		},
		[],
	)

	const onGoBack = useCallback(() => {
		onChangeRoute(mainRoutes.referral)
	}, [onChangeRoute])

	/** Loads existing bank account and prefills the form. */
	const handleGetSummaryRedeemRequest = useCallback(async () => {
		try {
			const res: any = await getSummaryRedeemRequest()
			const { code, results } = res || {}
			if (code !== 200) return

			const account = results?.object?.bank_account
			if (!account) return

			setForm((prev) => ({
				cardHolderName: account.account_holder_name || prev.cardHolderName,
				cardNumber: account.account_number || prev.cardNumber,
				bankName: account.bank_name || prev.bankName,
				phone: account.phone || prev.phone,
				email: account.email || prev.email,
			}))
		} catch (error) {
			openError(error)
		}
	}, [openError])

	/** Submits bank account form to save payout details. */
	const onSubmit = useCallback(async () => {
		if (!isValid || loading) return

		setLoading(true)
		try {
			const res: any = await addBankAccount({
				bank_name: form.bankName.trim(),
				account_holder_name: form.cardHolderName.trim(),
				account_number: form.cardNumber.trim(),
				email: form.email.trim(),
				phone: form.phone.trim(),
			})
			const { code } = res || {}
			if (code === 200) {
				openSuccess({ message: 'Bank account saved successfully' })
				onChangeRoute(mainRoutes.referral)
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoading(false)
		}
	}, [form, isValid, loading, onChangeRoute, openError, openSuccess])

	useEffect(() => {
		handleGetSummaryRedeemRequest()
	}, [handleGetSummaryRedeemRequest])

	/** Fills empty phone/email from profile without overwriting existing values. */
	useEffect(() => {
		if (!userData?.phone && !userData?.email) return
		setForm((prev) => ({
			...prev,
			phone: prev.phone || userData?.phone || '',
			email: prev.email || userData?.email || '',
		}))
	}, [userData?.phone, userData?.email])

	return {
		form,
		issuedInVietnam,
		agreeTerms,
		isValid,
		loading,
		handleChangeField,
		setIssuedInVietnam,
		setAgreeTerms,
		onGoBack,
		onSubmit,
	}
}
