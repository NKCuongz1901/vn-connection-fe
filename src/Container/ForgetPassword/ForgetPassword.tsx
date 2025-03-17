'use client'
import { Flex } from 'antd'
import { memo } from 'react'

import useRegisterAndReset from '@/app/hooks/RegisterAndReset/useRegisterAndReset'

import ChangePassword from '@/Components/Auth/ChangePassword'
import VerifyOTP from '@/Components/Auth/VerifyOTP'
import VerifyPhone from '@/Components/Auth/VerifyPhone'
import CSteps from '@/Components/Custom/CSteps'
import TermPolicy from '@/Components/TermPolicy'

import classes from './ForgetPassword.module.scss'

import { forgetPasswordStep } from '@/Variable/step.variable'
const ForgetPassword = () => {
	const { step, accountInfo, onChangeData, onSubmitPhone, onSubmitOtp } =
		useRegisterAndReset({
			type: 'reset',
		})
	const { title, prefix, phone, otp } = accountInfo
	const _renderContent = () => {
		switch (step) {
			case 0:
				return (
					<VerifyPhone
						prefix={prefix}
						value={phone}
						title="Reset your password"
						onChangePrefix={onChangeData('prefix')}
						onChange={(e: any) => onChangeData('phone')(e.target.value)}
						onAccept={onSubmitPhone}
					/>
				)
			case 1:
				return (
					<VerifyOTP
						title="OTP verification"
						phone="0828684370"
						value={otp}
						onChange={onChangeData('otp')}
						onInput={onChangeData('otp')}
						onAccept={onSubmitOtp}
					/>
				)
			case 2:
				return (
					<ChangePassword
						title="Change your password"
						note="Make sure it's at least 8 characters long and includes a mix of letters, numbers, and symbols"
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
