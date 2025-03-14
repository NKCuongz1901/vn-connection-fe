'use client'
import { Flex } from 'antd'
import { memo } from 'react'

import VerifyOTP from '@/Components/Auth/VerifyOTP'
import VerifyPhone from '@/Components/Auth/VerifyPhone'
import TermPolicy from '@/Components/TermPolicy'

import classes from './ForgetPassword.module.scss'
const ForgetPassword = () => {
	return (
		<Flex className={classes.wrapper} vertical>
			<Flex align="center" className={classes.title}>
				Verify Phone Number
			</Flex>
			<VerifyPhone title="Reset your password" />
			<VerifyOTP title="OTP verification" phone="0828684370" />
			<TermPolicy />
		</Flex>
	)
}

export default memo(ForgetPassword)
