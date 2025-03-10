'use client'
import { Checkbox, Flex, Select } from 'antd'
import clsx from 'clsx'
import { memo, useCallback } from 'react'

import CButton from '@/Components/Custom/CButton'
import CInput from '@/Components/Custom/CInput'
import CInputPassword from '@/Components/Custom/CInputPassword'
import Logo from '@/Container/Login/Logo'
import Background from './Background'
import Gradiant from './Gradiant'
import MainLogo from './MainLogo'

import classes from './Login.module.scss'
import useLogin from '@/app/hooks/Login/useLogin'
import { countryCodes } from '@/Variable/common.variable'

const { Option } = Select

const Login = () => {
	const { account, onChange, isValidate } = useLogin()
	console.log('🌸🌸🌸 TrieuNinhHan ~ Login ~ account:', { isValidate, account })
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
				<Background />
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
							/>
						</Flex>
						<Flex vertical gap={4}>
							<span>Password</span>
							<CInputPassword
								value={password}
								onChange={(e) => onChange('password')(e.target.value)}
								placeholder="Password"
								style={{ padding: '12px 16px', height: 44 }}
							/>
						</Flex>
						<Flex justify="space-between" align="center">
							<Flex>
								<Checkbox
									value={isRemember}
									onChange={(e) => onChange('isRemember')(e.target.checked)}
								>
									Remember me
								</Checkbox>
							</Flex>
							<span className={classes.color}>Forger password</span>
						</Flex>
						<CButton
							className={isValidate ? classes.cButton : ''}
							disabled={!isValidate}
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
			<div className={classes.rightContainer}>{_renderRight()}</div>
		</div>
	)
}

export default memo(Login)
