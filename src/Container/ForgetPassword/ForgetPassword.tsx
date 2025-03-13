'use client'
import { VerifyPhone } from '@/Components/Auth'
import { Flex } from 'antd'
import { memo } from 'react'

import TermPolicy from '@/Components/TermPolicy'

import classes from './ForgetPassword.module.scss'
const ForgetPassword = () => {
	return (
		<Flex className={classes.wrapper} vertical>
			<Flex align="center" className={classes.title}>
				Verify Phone Number
			</Flex>
			<VerifyPhone title="Reset your password" />
			<TermPolicy />
		</Flex>
	)
}

export default memo(ForgetPassword)
