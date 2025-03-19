'use client'
import { Flex } from 'antd'
import { memo } from 'react'

import useRegisterAndReset from '@/app/hooks/RegisterAndReset/useRegisterAndReset'
import { useLoading } from '@/context/LoadingContext'
import { useLocalePath } from '@/ultis/route.ults'
import { formatPhone } from '@/ultis/common.ults'

import ChangePassword from '@/Components/Auth/ChangePassword'
import VerifyOTP from '@/Components/Auth/VerifyOTP'
import VerifyPhone from '@/Components/Auth/VerifyPhone'
import CSteps from '@/Components/Custom/CSteps'
import TermPolicy from '@/Components/TermPolicy'

import classes from './ForgetPassword.module.scss'

import { forgetPasswordStep } from '@/Variable/step.variable'
import { mainRoutes } from '@/routes/MainRoutes'
import { OTP_TYPE } from '@/Variable/common.variable'

const ForgetPassword = ({ type = OTP_TYPE.FORGET_PASSWORD }) => {
	const { onChangeRoute } = useLocalePath()
	const { loadingContext } = useLoading()
	const {
		isValidate,
		step,
		accountInfo,
		errors,
		onChangeData,
		onSubmitPhone,
		onSubmitOtp,
		onSubmitPass,
	} = useRegisterAndReset({
		type,
	})
	const { title, prefix, phone, otp, password, confirmPassword } = accountInfo
	const _renderContent = () => {
		const disabled = !isValidate || loadingContext
		switch (step) {
			case 0:
				return (
					<VerifyPhone
						disabled={disabled}
						prefix={prefix}
						value={phone}
						title="Reset your password"
						onChangePrefix={onChangeData('prefix')}
						onChange={(e: any) => onChangeData('phone')(e.target.value)}
						onAccept={onSubmitPhone}
						onCancel={() => onChangeRoute(mainRoutes.login)}
					/>
				)
			case 1:
				return (
					<VerifyOTP
						disabled={disabled}
						title="OTP verification"
						phone={formatPhone(prefix, phone)}
						value={otp}
						onChange={onChangeData('otp')}
						onInput={onChangeData('otp')}
						onAccept={onSubmitOtp}
					/>
				)
			case 2:
				return (
					<ChangePassword
						disabled={disabled}
						password={password}
						confirmPassword={confirmPassword}
						errors={errors}
						title="Change your password"
						note="Make sure it's at least 8 characters long and includes a mix of letters, numbers, and symbols"
						onChangePassword={onChangeData('password')}
						onChangeConfirmPassword={onChangeData('confirmPassword')}
						onAccept={onSubmitPass}
					/>
				)
			default:
				return <></>
		}
	}

	return (
		<Flex className={classes.wrapper} vertical align="center">
			<Flex className={classes.title}>{title}</Flex>
			<Flex className={classes.step} align="center">
				<CSteps
					current={step}
					items={forgetPasswordStep.map((i) => ({ title: i }))}
				/>
			</Flex>
			<div className={classes.content}>{_renderContent()}</div>
			<TermPolicy />
		</Flex>
	)
}

export default memo(ForgetPassword)
