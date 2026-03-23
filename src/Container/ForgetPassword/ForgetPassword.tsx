'use client'
import { CloseOutlined } from '@ant-design/icons'
import { Flex } from 'antd'
import { memo, useMemo } from 'react'

import useRegisterAndReset from '@/hooks/RegisterAndReset/useRegisterAndReset'
import { useLoading } from '@/context/LoadingContext'
import { formatPhone } from '@/ultis/common'
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
		onChangeStep,
		onChangeData,
		onSubmitPhone,
		onSubmitOtp,
		onSubmitPass,
	} = useRegisterAndReset({
		type,
		steps,
	})
	const { title, prefix, phone, otp, password, confirmPassword, name } =
		accountInfo
	const isRegister = useMemo(() => type === OTP_TYPE.REGISTER, [type])

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
						onCancel={() => onChangeRoute(mainRoutes.login)}
					/>
				)
			case 1:
				return (
					<VerifyOTP
						disabled={disabled}
						title={steps[step]}
						phone={formatPhone(prefix, phone)}
						value={otp}
						onChange={onChangeData('otp')}
						onInput={onChangeData('otp')}
						onAccept={onSubmitOtp}
						onSendAgain={onSubmitPhone}
						onChangeStep={onChangeStep}
					/>
				)
			case 2:
				return (
					<ChangePassword
						disabled={disabled}
						isRegister={isRegister}
						password={password}
						confirmPassword={confirmPassword}
						name={name}
						errors={errors}
						title={steps[step]}
						note="Make sure it's at least 8 characters long and includes a mix of letters, numbers, and symbols"
						onChangePassword={onChangeData('password')}
						onChangeConfirmPassword={onChangeData('confirmPassword')}
						onChangeCommonData={onChangeData('name')}
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
				<CloseOutlined
					className="icon-1"
					onClick={() => onChangeRoute(mainRoutes.login)}
				/>
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
