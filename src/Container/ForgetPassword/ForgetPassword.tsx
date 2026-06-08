'use client'
import { CloseOutlined } from '@ant-design/icons'
import { Flex } from 'antd'
import { memo, useMemo } from 'react'

import useRegisterAndReset from '@/hooks/RegisterAndReset/useRegisterAndReset'
import { useLoading } from '@/context/LoadingContext'
import { useLocalePath } from '@/ultis/route'

import ChangePassword from '@/Components/Auth/ChangePassword'
import VerifyOTP from '@/Components/Auth/VerifyOTP'
import VerifyPhone from '@/Components/Auth/VerifyPhone'
import CSteps from '@/Components/Custom/CSteps'
import TermPolicy from '@/Components/TermPolicy'

import classes from './ForgetPassword.module.scss'

import { mainRoutes } from '@/routes/MainRoutes'
import { OTP_TYPE } from '@/Variable/common.variable'

interface ForgetPasswordProps {
	steps: string[]
	[key: string]: any
}

const ForgetPassword = ({
	type = OTP_TYPE.FORGET_PASSWORD,
	steps,
}: ForgetPasswordProps) => {
	const { onChangeRoute } = useLocalePath()
	const { loadingContext } = useLoading()
	const {
		isValidate,
		step,
		accountInfo,
		errors,
		fromAccount,
		otpChannel,
		otpDestination,
		onChangeStep,
		onChangeData,
		onSubmitPhone,
		onSubmitOtp,
		onSubmitPass,
		onResendOtp,
		onSwitchToSms,
		onClearForgetSession,
	} = useRegisterAndReset({
		type,
		steps,
	})
	const {
		title,
		prefix,
		phone,
		otp,
		password,
		confirmPassword,
		name,
		email,
		invite_code,
		checked,
	} = accountInfo
	const isRegister = useMemo(() => type === OTP_TYPE.REGISTER, [type])

	const handleClose = () => {
		onClearForgetSession()
		onChangeRoute(
			fromAccount
				? `${mainRoutes.accountSetting}/manage-account/change`
				: mainRoutes.login,
		)
	}

	const _renderContent = () => {
		const disabled = !isValidate || loadingContext
		switch (step) {
			case 0:
				return (
					<VerifyPhone
						disabled={disabled}
						prefix={prefix}
						value={phone}
						title={steps[step]}
						onChangePrefix={onChangeData('prefix')}
						onChange={(e: any) => onChangeData('phone')(e.target.value)}
						onAccept={onSubmitPhone}
						onCancel={handleClose}
					/>
				)
			case 1:
				return (
					<VerifyOTP
						title="Enter Your Verification Code"
						destination={otpDestination}
						channel={otpChannel}
						value={otp}
						onChange={onChangeData('otp')}
						onInput={onChangeData('otp')}
						onAccept={onSubmitOtp}
						onSendAgain={onResendOtp}
						onSwitchToSms={onSwitchToSms}
						showSwitchToPhone={Boolean(phone) && otpChannel === 'email'}
						hiddenChangeStep={fromAccount}
						onChangeStep={onChangeStep}
					/>
				)
			case 2:
				return (
					<ChangePassword
						disabled={disabled}
						isRegister={isRegister}
						checked={checked}
						password={password}
						confirmPassword={confirmPassword}
						name={name}
						email={email}
						invite_code={invite_code}
						errors={errors}
						title={steps[step]}
						note="Make sure it's at least 8 characters long and includes a mix of letters, numbers, and symbols"
						onChangePassword={onChangeData('password')}
						onChangeConfirmPassword={onChangeData('confirmPassword')}
						onChangeCommonData={onChangeData}
						onAccept={onSubmitPass}
					/>
				)
			default:
				return <></>
		}
	}

	return (
		<Flex className={classes.wrapper} vertical align="center">
			<Flex className={classes.title}>
				<Flex>{title}</Flex>
				<CloseOutlined className="icon-1" onClick={handleClose} />
			</Flex>
			<Flex className={classes.step} align="center">
				<div className={classes.stepContent}>
					<CSteps current={step} items={steps.map((i) => ({ title: i }))} />
				</div>
			</Flex>
			<Flex className={classes.content}>{_renderContent()}</Flex>
			<Flex className={classes.footer}>
				<TermPolicy />
			</Flex>
		</Flex>
	)
}

export default memo(ForgetPassword)
