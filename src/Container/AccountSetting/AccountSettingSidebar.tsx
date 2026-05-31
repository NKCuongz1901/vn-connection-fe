'use client'

import Link from 'next/link'
import { Flex } from 'antd'
import clsx from 'clsx'

import { useLocalePath } from '@/ultis/route'
import { ACCOUNT_SETTING_MENUS } from '@/Variable/accountSetting.variable'

import classes from './AccountSettingLayout.module.scss'

function AccountSettingSidebar() {
	const { pathname, onGetPath } = useLocalePath()

	return (
		<Flex vertical className={classes.sidebar} gap={12}>
			{ACCOUNT_SETTING_MENUS.map(({ key, label, path, Icon }) => {
				const active = pathname === path || pathname.startsWith(`${path}/`)

				return (
					<Link
						key={key}
						href={onGetPath(path)}
						className={classes.sidebarLink}
					>
						<Flex
							align="center"
							gap={12}
							className={clsx(classes.sidebarItem, {
								[classes.sidebarItemActive]: active,
							})}
						>
							<Icon
								fill={active ? '#006B35' : '#94A3B8'}
								width={24}
								height={24}
							/>
							<span>{label}</span>
						</Flex>
					</Link>
				)
			})}
		</Flex>
	)
}

export default AccountSettingSidebar
