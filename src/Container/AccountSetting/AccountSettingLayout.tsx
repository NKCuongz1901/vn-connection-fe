'use client'

import { Flex } from 'antd'
import { ReactNode } from 'react'

import AccountSettingSidebar from './AccountSettingSidebar'
import classes from './AccountSettingLayout.module.scss'

type Props = {
	children: ReactNode
}

function AccountSettingLayout({ children }: Props) {
	return (
		<div className={classes.wrapper}>
			<h1 className={classes.pageTitle}>Account Settings</h1>
			<div className={classes.container}>
				<Flex className={classes.card}>
					<AccountSettingSidebar />

					<Flex className={classes.content} vertical>
						{children}
					</Flex>
				</Flex>
			</div>
		</div>
	)
}

export default AccountSettingLayout
