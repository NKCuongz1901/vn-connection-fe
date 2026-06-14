import { useCallback, useEffect, useMemo, useState } from 'react'

import useProfile from '@/hooks/Profile/useProfile'
import { mainRoutes } from '@/routes/MainRoutes'
import { useLocalePath } from '@/ultis/route'
import { emailRegex } from '@/Variable/regex.variable'

export default function useAddBankCard() {
	const { onChangeRoute } = useLocalePath()
	const { userData } = useProfile({})

	const [cardHolderName, setCardHolderName] = useState('')
	const [cardNumber, setCardNumber] = useState('')
	const [bankName, setBankName] = useState<string | undefined>(undefined)
	const [phone, setPhone] = useState('')
	const [email, setEmail] = useState('')
	const [issuedInVietnam, setIssuedInVietnam] = useState(true)
	const [agreeTerms, setAgreeTerms] = useState(true)

	useEffect(() => {
		setPhone(userData?.phone || '')
		setEmail(userData?.email || '')
	}, [userData?.phone, userData?.email])

	const isValid = useMemo(() => {
		return (
			!!cardHolderName.trim() &&
			!!cardNumber.trim() &&
			!!bankName &&
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

	const onSubmit = useCallback(() => {
		if (!isValid) return
		// TODO: wire add bank card API
	}, [isValid])

	return {
		cardHolderName,
		cardNumber,
		bankName,
		phone,
		email,
		issuedInVietnam,
		agreeTerms,
		isValid,
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
