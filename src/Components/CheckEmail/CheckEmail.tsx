import { Flex } from 'antd'
import { memo, useCallback, useState } from 'react'

import { useLoading } from '@/context/LoadingContext'
import { useModal } from '@/context/ModalContext'

import { checkOTP, sendOTP, verifyOTP } from '@/apis/authApis'
import { updateUserProfile } from '@/apis/userApis'

import { isArray } from '@/ultis/array'
import { isEmail } from '@/ultis/common'
import { getSessionStorage, setSessionStorage } from '@/ultis/storage'

import VerifyOTP from '../Auth/VerifyOTP'
import CButton from '../Custom/CButton'
import CInput from '../Custom/CInput'
import CModal from '../Custom/CModal/CModal'

import { OTP_TYPE } from '@/Variable/common.variable'
import { STORAGE_KEY } from '@/Variable/storage.variable'

import classes from './CheckEmail.module.scss'

interface CheckEmailProps {
	onClose: any
	onSubmit: any
}
const stepTitle = {
	0: 'Add your email',
	1: 'OTP Verification',
}
const CheckEmail = (props: CheckEmailProps) => {
	const { onClose = () => null, onSubmit = () => null } = props || {}
	const { toggleLoadingContext, loadingContext } = useLoading()
	const { openError, openSuccess } = useModal()
	const [step, setStep] = useState(0)
	const [email, setEmail] = useState('')
	const [errors, setErrors] = useState({ email: '' })
	const [phone, setPhone] = useState('')
	const [code, setCode] = useState('')
	const handleValidate = useCallback((dataModal: any) => {
		const { email } = dataModal
		const _errors: any = Object.fromEntries(
			Object.entries({
				email: 'Please enter your email',
				// content: 'Please enter your proble',
			}).filter(([key]) => !dataModal?.[key]),
		)
		if (!_errors.email && !isEmail(email)) {
			_errors.email = 'Please enter correct email'
		}
		if (isArray(Object.entries(_errors), 1)) {
			setErrors(_errors)
			return false
		}
		return true
	}, [])

	const handleUpdateProfile = async () => {
		try {
			const res: any = await updateUserProfile({ email })
			if (res?.code === 200) {
				setSessionStorage({
					key: STORAGE_KEY.USER,
					data: res?.results?.object || {},
				})
				openSuccess({
					message: 'Add email success',
					onAccept: () => {
						onSubmit()
						onClose()
					},
				})
			} else {
				throw res
			}
		} catch (error) {
			openError(error)
		}
	}

	const handleVerifyOtp = async () => {
		toggleLoadingContext(true)
		try {
			const res: any = await verifyOTP({
				code: code,
				phone: phone,
				otp_type: OTP_TYPE.CHANGE_PHONE,
			})
			if (res?.code == 200) {
				await handleUpdateProfile()
			} else {
				throw res
			}
		} catch (error) {
			openError(error)
		} finally {
			toggleLoadingContext()
		}
	}
	const handleSendOtp = async (phone) => {
		try {
			const res: any = await sendOTP({ phone })
			const { sid } = res?.results?.object
			if (sid) {
				setStep(1)
			} else {
				openError('OTP sending failed')
			}
		} catch (error) {
			openError(error)
		}
	}
	const handleCheckOtp = async () => {
		const data = getSessionStorage(STORAGE_KEY.USER)
		const { phone, prefix_phone } = data || {}
		toggleLoadingContext(true)
		try {
			setPhone(phone)
			const res: any = await checkOTP({ phone, prefix_phone })
			const { status } = res?.results?.object
			if (status) {
				await handleSendOtp(phone)
			} else {
				openError('Phone number verification failed')
			}
		} catch (error) {
			openError(error)
		} finally {
			toggleLoadingContext()
		}
	}
	const handleSubmit = (step) => {
		switch (step) {
			case 0:
				{
					if (handleValidate({ email })) {
						handleCheckOtp()
					}
				}
				break
			case 1:
				{
					handleVerifyOtp()
				}
				break
		}
	}
	const renderStepZero = () => {
		return (
			<>
				<span>
					For host and admins, please enter your email so we can notify you
					about updates or contact you for future improvements
				</span>
				<CInput
					isRequired
					error={errors.email}
					value={email}
					label="Email"
					placeholder="Enter your email address"
					onChange={(e) => {
						setEmail(e.target.value)
						setErrors((prev) => ({ ...prev, email: '' }))
					}}
				/>
			</>
		)
	}
	const renderContent = () => {
		switch (step) {
			case 0:
				return renderStepZero()
			case 1:
				return (
					<VerifyOTP
						disabled={loadingContext}
						className={classes.noBoxShadow}
						hiddenChangeStep
						title={'OTP Verification'}
						phone={phone}
						value={code}
						onChange={(e) => setCode(e)}
						onInput={(_value) =>
							setCode(() => {
								let value: any = _value
								if (isArray(value)) {
									value = _value.join('')
								}
								return value
							})
						}
						onAccept={() => handleSubmit(1)}
						onSendAgain={() => handleSendOtp(phone)}
					/>
				)
		}
	}
	return (
		<div>
			<CModal
				maskClosable={false}
				onClose={onClose}
				onCancel={onClose}
				title={stepTitle[step]}
				styles={{
					content: {
						width: 560,
					},
				}}
				footer={
					step === 0
						? [
								<Flex key="back" justify="flex-end">
									<CButton
										disabled={!email || loadingContext}
										onClick={() => handleSubmit(step)}
										ctype="oranger"
										style={{ width: 240 }}
									>
										Save
									</CButton>
								</Flex>,
							]
						: [<div key="back" />]
				}
			>
				<Flex className={classes.wrapper} vertical>
					{renderContent()}
				</Flex>
			</CModal>
		</div>
	)
}

export default memo(CheckEmail)
