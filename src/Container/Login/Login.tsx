'use client'
import { Checkbox, Flex, Select } from 'antd'
import clsx from 'clsx'
import { memo } from 'react'

import CButton from '@/Components/Custom/CButton'
import CInput from '@/Components/Custom/CInput'
import CInputPassword from '@/Components/Custom/CInputPassword'
import Logo from '@/Container/Login/Logo'
import Background from './Background'
import Gradiant from './Gradiant'
import MainLogo from './MainLogo'

import classes from './Login.module.scss'

const { Option } = Select
const prefix = ['+84', '+85']

const Login = () => {
	const selectBefore = (
		<Select defaultValue="+84">
			{prefix.map((i) => (
				<Option key={i} value={i}>
					{i}
				</Option>
			))}
		</Select>
	)
	const _renderLeft = () => {
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
	}
	const _renderRight = () => {
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
							<CInput addonBefore={selectBefore} placeholder="Phone number" />
						</Flex>
						<Flex vertical gap={4}>
							<span>Password</span>
							<CInputPassword
								placeholder="Password"
								style={{ padding: '12px 16px', height: 44 }}
							/>
						</Flex>
						<Flex justify="space-between" align="center">
							<Flex>
								<Checkbox>Remember me</Checkbox>
							</Flex>
							<span className={classes.color}>Forger password</span>
						</Flex>
						<CButton className={classes.cButton}>Sign in</CButton>
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
