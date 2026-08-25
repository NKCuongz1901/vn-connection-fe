'use client'
import { Checkbox, Flex } from 'antd'
import Link from 'next/link'
import { memo, useCallback, useState } from 'react'

import useLogin from '@/hooks/Login/useLogin'
import { useLoading } from '@/context/LoadingContext'
import { useLocalePath } from '@/ultis/route'

import OtpMethodList from '@/Components/Auth/SelectOtpMethod'
import CButton from '@/Components/Custom/CButton'
import CInputPassword from '@/Components/Custom/CInputPassword'
import CInputPhone from '@/Components/Custom/CInputPhone'
import DownloadApp from '@/Components/DownloadApp'
import TermPolicy from '@/Components/TermPolicy'
import Logo from '@/Container/Login/Logo'
import Background from './Background'
import Gradiant from './Gradiant'
import MainLogo from './MainLogo'

import classes from './Login.module.scss'

import { REPORT_ISSUE_TYPE } from '@/Variable/common.variable'
import { mainRoutes } from '@/routes/MainRoutes'
import ModalReport from '@/Components/Custom/ModalReport'
import NotFound from '@/svg/NotFound'
import ModalNotFoundAccount from '@/Components/Notification/ModalNotFoundAccount/ModalNotFoundAccount'

const { forgetPassword } = mainRoutes

const Login = () => {
	const { onGetPath } = useLocalePath()
	const { loadingContext } = useLoading()
	const [openModalReport, setOpenModalReport] = useState(false)
	const [openModalNotFoundAccount, setOpenModalNotFoundAccount] =
		useState(false)
	const [notFoundPhone, setNotFoundPhone] = useState('')

	const {
		loginStep,
		account,
		onChange,
		isPhoneValid,
		isValidate,
		otpMethod,
		isVnPhone,
		onContinuePhone,
		onLogin,
		onStartRegister,
		onChangeOtpMethod,
		onSendRegisterOtp,
	} = useLogin({
		onAccountNotFound: (displayPhone) => {
			setNotFoundPhone(displayPhone)
			setOpenModalNotFoundAccount(true)
		},
	})

	const _renderLeft = useCallback(() => {
		return (
			<Flex vertical align="center" className={classes.left}>
				<div>
					<Background />
				</div>
				<Flex align="center" justify="center">
					<div className={classes.mainLogo}>
						<MainLogo />
					</div>
				</Flex>
				<Flex align="center" justify="center" className={classes.title}>
					UniVini
				</Flex>
				<Flex vertical>
					<Flex className={classes.label1}>The easiest way to</Flex>
					<Flex className={classes.label2}>Exchange languages</Flex>
					<Flex className={classes.label2}>Build Networks</Flex>
					<Flex className={classes.label2}>Travel</Flex>
					<div className={classes.gradiant}>
						<Gradiant />
					</div>
				</Flex>
			</Flex>
		)
	}, [])

	const _renderRight = () => {
		const { phone, password, isRemember, prefix } = account
		const isPasswordStep = loginStep === 'password'
		const isRegisterOtpStep = loginStep === 'registerOtp'
		const disable =
			loadingContext ||
			(isRegisterOtpStep
				? !isPhoneValid
				: isPasswordStep
					? !isValidate
					: !isPhoneValid)

		if (isRegisterOtpStep) {
			return (
				<Flex className={classes.right} vertical>
					<Flex
						className={classes.rightHeader}
						justify="flex-end"
						align="center"
					>
						<Logo />
						<span className={classes.brandSmall}>UniVini</span>
					</Flex>

					<Flex
						className={classes.rightCenter}
						vertical
						justify="center"
						align="center"
						flex={1}
					>
						<Flex vertical gap={24} className={classes.form}>
							<Flex vertical gap={8} align="center">
								<div className={classes.rightTop3}>
									Verify your phone number
								</div>
								<p className={classes.otpSubtitle}>
									Choose how you want to receive your OTP code.
								</p>
							</Flex>
							<OtpMethodList
								value={otpMethod}
								isVnPhone={isVnPhone}
								onChange={onChangeOtpMethod}
							/>
							<CButton
								disabled={disable}
								ctype={!disable ? 'oranger' : null}
								onClick={onSendRegisterOtp}
							>
								Send OTP
							</CButton>
						</Flex>
					</Flex>

					<div className={classes.footer}>
						<TermPolicy />
					</div>
				</Flex>
			)
		}

		return (
			<Flex className={classes.right} vertical>
				<Flex className={classes.rightHeader} justify="flex-end" align="center">
					<Logo />
					<span className={classes.brandSmall}>UniVini</span>
				</Flex>

				<Flex
					className={classes.rightCenter}
					vertical
					justify="center"
					align="center"
					flex={1}
				>
					<Flex vertical gap={20} className={classes.form}>
						<div className={classes.rightTop3}>
							<>
								Just enter your <br /> phone number to get started
							</>
						</div>
						<div
							className={classes.fieldLabel}
							style={{
								color: '#0f1729',
								fontSize: '14px',
								fontWeight: 500,
								lineHeight: '20px',
							}}
						>
							<CInputPhone
								isNotBold
								isRequired
								label="Phone number"
								prefix={prefix}
								value={phone}
								onChangePrefix={onChange('prefix')}
								onChange={(e) => onChange('phone')(e.target.value)}
								placeholder="Phone number"
								maxLength={255}
								labelStyle={{
									color: '#0f1729',
									fontSize: '14px',
									fontWeight: 500,
									lineHeight: '20px',
								}}
							/>
						</div>
						{isPasswordStep && (
							<>
								<div
									className={classes.passwordField}
									style={{
										color: '#0f1729',
										fontSize: '14px',
										fontWeight: 500,
										lineHeight: '20px',
									}}
								>
									<CInputPassword
										isNotBold={true}
										isRequired
										label="Password"
										value={password}
										onChange={(e) => onChange('password')(e.target.value)}
										placeholder="Password"
									/>
								</div>
								<Flex justify="space-between" align="flex-start">
									<Checkbox
										checked={isRemember}
										onChange={(e) => onChange('isRemember')(e.target.checked)}
									>
										Remember me
									</Checkbox>
									<Flex vertical gap={16} align="flex-end">
										<Link href={onGetPath(forgetPassword)}>
											<span className={classes.color}>Forgot password?</span>
										</Link>
										<span onClick={() => setOpenModalReport(true)}>
											<span className={classes.color}>Need help?</span>
										</span>
									</Flex>
								</Flex>
							</>
						)}
						{!isPasswordStep && (
							<span onClick={() => setOpenModalReport(true)}>
								<span className={classes.color}>Need help?</span>
							</span>
						)}
						<CButton
							disabled={disable}
							ctype={!disable ? 'oranger' : null}
							onClick={isPasswordStep ? onLogin : onContinuePhone}
						>
							Continue
						</CButton>
					</Flex>
				</Flex>

				<div className={classes.footer}>
					<TermPolicy />
				</div>
			</Flex>
		)
	}
	return (
		<div className={classes.wrapper}>
			{_renderLeft()}
			{<DownloadApp />}
			<div className={classes.rightContainer}>{_renderRight()}</div>
			<ModalReport
				reportType={REPORT_ISSUE_TYPE.GET_HELP}
				open={openModalReport}
				onClose={() => setOpenModalReport(false)}
				data={{}}
				message="You want to need help this problem ?"
				title="Report"
			/>
			<ModalNotFoundAccount
				open={openModalNotFoundAccount}
				onClose={() => setOpenModalNotFoundAccount(false)}
				icon={<NotFound />}
				title="This phone number is not registered yet."
				description={notFoundPhone}
				onGetHelp={() => {
					setOpenModalNotFoundAccount(false)
					setOpenModalReport(true)
				}}
				onRegister={() => {
					setOpenModalNotFoundAccount(false)
					onStartRegister()
				}}
			/>
		</div>
	)
}

export default memo(Login)
