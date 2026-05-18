'use client'
import { Checkbox, Flex } from 'antd'
import Link from 'next/link'
import { memo, useCallback, useState } from 'react'

import useLogin from '@/hooks/Login/useLogin'
import { useLoading } from '@/context/LoadingContext'
import { useLocalePath } from '@/ultis/route'

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

import { REGISTER_FROM_LOGIN_SESSION_KEY } from '@/Variable/common.variable'
import { mainRoutes } from '@/routes/MainRoutes'
import { setSessionStorage } from '@/ultis/storage'
import ModalReport from '@/Components/Custom/ModalReport'
import NotFound from '@/svg/NotFound'
import ModalNotFoundAccount from '@/Components/Notification/ModalNotFoundAccount/ModalNotFoundAccount'

const { forgetPassword } = mainRoutes

const Login = () => {
	const { onGetPath, onChangeRoute } = useLocalePath()
	const { loadingContext } = useLoading()
	const [openModalReport, setOpenModalReport] = useState(false)
	const [openModalNotFoundAccount, setOpenModalNotFoundAccount] =
		useState(false)
	const [notFoundPhone, setNotFoundPhone] = useState('')

	const { account, onChange, isValidate, onLogin } = useLogin({
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
		const disable = !isValidate || loadingContext
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
							Just enter your <br /> phone number to get started
						</div>
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
						/>
						<CInputPassword
							isRequired
							label="Password"
							value={password}
							onChange={(e) => onChange('password')(e.target.value)}
							placeholder="Password"
						/>
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
						<CButton
							disabled={disable}
							ctype={!disable ? 'oranger' : null}
							onClick={onLogin}
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
				title="We couldn't find your account."
				description={notFoundPhone}
				onGetHelp={() => {
					setOpenModalNotFoundAccount(false)
					setOpenModalReport(true)
				}}
				onRegister={() => {
					setOpenModalNotFoundAccount(false)
					setSessionStorage({
						key: REGISTER_FROM_LOGIN_SESSION_KEY,
						data: {
							phone: account.phone,
							prefix: account.prefix,
						},
					})
					onChangeRoute(mainRoutes.register)
				}}
			/>
		</div>
	)
}

export default memo(Login)
