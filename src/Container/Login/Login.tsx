'use client'
import { Checkbox, Flex } from 'antd'
import clsx from 'clsx'
import Link from 'next/link'
import { memo, useCallback } from 'react'

import useLogin from '@/app/hooks/Login/useLogin'
import { useLoading } from '@/context/LoadingContext'
import { useLocalePath } from '@/ultis/route.ults'

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

import { mainRoutes } from '@/routes/MainRoutes'

const { forgetPassword } = mainRoutes

const Login = () => {
	const { onGetPath, onChangeRoute } = useLocalePath()
	const { loadingContext } = useLoading()
	const { account, onChange, isValidate, onLogin } = useLogin()

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
			<Flex className={classes.right} vertical justify="space-between">
				<div className={classes.rightTop}>
					<div className={classes.rightTop1}>
						<Logo />
						<span className={classes.title}>UniVini</span>
					</div>
					<div className={classes.rightTop2}>
						<div className={clsx(classes.buttonSwitch, classes.active)}>
							Sign In
						</div>
						<div
							className={classes.buttonSwitch}
							onClick={() => onChangeRoute(mainRoutes.register)}
						>
							Sign Up
						</div>
					</div>
					<Flex vertical gap={20}>
						<Flex align="center" justify="center" className={classes.rightTop3}>
							Sign In
						</Flex>
						<CInputPhone
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
						<Flex justify="space-between" align="center">
							<Flex>
								<Checkbox
									checked={isRemember}
									onChange={(e) => onChange('isRemember')(e.target.checked)}
								>
									Remember me
								</Checkbox>
							</Flex>
							<Link href={onGetPath(forgetPassword)}>
								<span className={classes.color}>Forger password</span>
							</Link>
						</Flex>
						<CButton
							disabled={disable}
							ctype={!disable ? 'oranger' : null}
							onClick={onLogin}
						>
							Sign in
						</CButton>
					</Flex>
				</div>
				<br />
				<TermPolicy />
			</Flex>
		)
	}
	return (
		<div className={classes.wrapper}>
			{_renderLeft()}
			{<DownloadApp />}
			<div className={classes.rightContainer}>{_renderRight()}</div>
		</div>
	)
}

export default memo(Login)
