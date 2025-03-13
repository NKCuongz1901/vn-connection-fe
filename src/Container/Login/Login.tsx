'use client'
import { Checkbox, Flex, Select } from 'antd'
import clsx from 'clsx'
import Link from 'next/link'
import { memo, useCallback } from 'react'

import { useLoading } from '@/app/context/LoadingContext'
import useLogin from '@/app/hooks/Login/useLogin'
import { useLocalePath } from '@/ultis/route.ults'

import CButton from '@/Components/Custom/CButton'
import CInput from '@/Components/Custom/CInput'
import CInputPassword from '@/Components/Custom/CInputPassword'
import DownloadApp from '@/Components/DownloadApp'
import Logo from '@/Container/Login/Logo'
import Background from './Background'
import Gradiant from './Gradiant'
import MainLogo from './MainLogo'

import classes from './Login.module.scss'

import { countryCodes } from '@/Variable/common.variable'
import { mainRoutes } from '@/routes/MainRoutes'

const { Option } = Select
const { forgetPassword } = mainRoutes

const Login = () => {
	const { onGetPath } = useLocalePath()
	const { loadingContext } = useLoading()
	const { error, account, onChange, isValidate, onLogin } = useLogin()
	const selectBefore = (
		<Select
			value={account.prefix}
			onChange={onChange('prefix')}
			style={{ width: 90 }}
		>
			{countryCodes.map((i) => (
				<Option key={i.dial_code} value={i.dial_code}>
					{i.dial_code}
				</Option>
			))}
		</Select>
	)

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
		const { phone, password, isRemember } = account
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
						<div className={classes.buttonSwitch}>Sign Up</div>
					</div>
					<Flex vertical gap={20}>
						<Flex align="center" justify="center" className={classes.rightTop3}>
							Sign In
						</Flex>
						<Flex vertical gap={4}>
							<span>Phone number</span>
							<CInput
								value={phone}
								onChange={(e) => onChange('phone')(e.target.value)}
								addonBefore={selectBefore}
								placeholder="Phone number"
								maxLength={255}
							/>
						</Flex>
						<Flex vertical gap={4}>
							<span>Password</span>
							<CInputPassword
								value={password}
								onChange={(e) => onChange('password')(e.target.value)}
								placeholder="Password"
							/>
						</Flex>
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
						{error && <span className="error">{error}</span>}
						<CButton
							disabled={disable}
							className={!disable ? classes.cButton : ''}
							onClick={onLogin}
						>
							Sign in
						</CButton>
					</Flex>
				</div>
				<Flex
					vertical
					justify="center"
					align="center"
					gap={4}
					className={classes.rightBottom}
				>
					<Flex gap={12}>
						<span>Terms of Use</span>
						<span>Privacy Policy</span>
					</Flex>
					<span>Copyrightⓒ(Inc)UniVini. All rights reserved.</span>
				</Flex>
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
