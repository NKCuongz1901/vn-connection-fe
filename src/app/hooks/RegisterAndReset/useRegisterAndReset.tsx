import { useCallback, useEffect, useState } from 'react'

import { useLoading } from '@/app/context/LoadingContext'

import { isArray } from '@/ultis/array.ults'
import { toJson } from '@/ultis/common.ults'

import { forgetPasswordStep } from '@/Variable/step.variable'

export default function useRegisterAndReset({ type }: { type: string }) {
	const { toggleLoadingContext: _ } = useLoading()
	const [step, setStep] = useState(0)
	const [accountInfo, setAccountInfo] = useState({
		title: 'Verify Phone Number',
		otp: '',
		phone: '',
		password: '',
		confirmPassword: '',
		prefix: '+84',
		type,
	})
	const handleChangeStep = useCallback((value: number) => {
		setStep(value)
	}, [])

	const handleChangeAccountInfo = useCallback(
		(key: string) => (_value: any) => {
			console.log('object', {
				key,
				_value,
			})
			let value = _value
			switch (key) {
				case 'phone':
					value = _value.replace(/[^0-9]/g, '')
				case 'otp':
					if (isArray(value)) {
						value = _value.join('')
					}
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

	const handleSubmitPhone = useCallback(() => {
		try {
			setStep(1)
		} catch (error) {
			console.log('🌸🌸🌸 TrieuNinhHan ~ handleSubmitPhone ~ error:', error)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [toJson(accountInfo)])

	const handleSubmitOtp = useCallback(() => {
		try {
			setStep(2)
		} catch (error) {
			console.log('🌸🌸🌸 TrieuNinhHan ~ handleSubmitPhone ~ error:', error)
		}
	}, [])

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

	return {
		step: step,
		accountInfo: accountInfo,
		onChangeStep: handleChangeStep,
		onChangeData: handleChangeAccountInfo,
		onSubmitPhone: handleSubmitPhone,
		onSubmitOtp: handleSubmitOtp,
	}
}
