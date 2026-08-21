import { useCallback, useEffect, useMemo, useState } from 'react'

import { addBankAccount } from '@/apis/referralApis'
import { useModal } from '@/context/ModalContext'
import useProfile from '@/hooks/Profile/useProfile'
import { mainRoutes } from '@/routes/MainRoutes'
import { useLocalePath } from '@/ultis/route'
import { emailRegex } from '@/Variable/regex.variable'

export default function useAddBankCard() {
	const { onChangeRoute } = useLocalePath()
	const { openError, openSuccess } = useModal()
	const { userData } = useProfile({})

	const [cardHolderName, setCardHolderName] = useState('')
	const [cardNumber, setCardNumber] = useState('')
	const [bankName, setBankName] = useState('')
	const [phone, setPhone] = useState('')
	const [email, setEmail] = useState('')
	const [issuedInVietnam, setIssuedInVietnam] = useState(true)
	const [agreeTerms, setAgreeTerms] = useState(true)
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		setPhone(userData?.phone || '')
		setEmail(userData?.email || '')
	}, [userData?.phone, userData?.email])

	const isValid = useMemo(() => {
		return (
			!!cardHolderName.trim() &&
			!!cardNumber.trim() &&
			!!bankName.trim() &&
			!!email.trim() &&
			emailRegex.test(email.trim()) &&
			issuedInVietnam &&
			agreeTerms
		)
	}, [
		agreeTerms,
		bankName,
		cardHolderName,
		cardNumber,
		email,
		issuedInVietnam,
	])

	const onGoBack = useCallback(() => {
		onChangeRoute(mainRoutes.referral)
	}, [onChangeRoute])

	/** Submits bank account form to save payout details. */
	const onSubmit = useCallback(async () => {
		if (!isValid || loading) return

		setLoading(true)
		try {
			const res: any = await addBankAccount({
				bank_name: bankName.trim(),
				account_holder_name: cardHolderName.trim(),
				account_number: cardNumber.trim(),
				email: email.trim(),
				phone: phone.trim(),
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
	}, [
		bankName,
		cardHolderName,
		cardNumber,
		email,
		isValid,
		loading,
		onChangeRoute,
		openError,
		openSuccess,
		phone,
	])

	return {
		cardHolderName,
		cardNumber,
		bankName,
		phone,
		email,
		issuedInVietnam,
		agreeTerms,
		isValid,
		loading,
		setCardHolderName,
		setCardNumber,
		setBankName,
		setPhone,
		setEmail,
		setIssuedInVietnam,
		setAgreeTerms,
		onGoBack,
		onSubmit,
	}
}
