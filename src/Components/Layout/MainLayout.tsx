'use client'
import { CloseOutlined } from '@ant-design/icons'
import { Flex } from 'antd'
import Link from 'next/link'
import React, { memo, useCallback, useEffect, useRef, useState } from 'react'

import { isLogin } from '@/ultis/storage.ults'
import { useLocalePath } from '@/ultis/route.ults'

import AuthLayout from './Child/AuthLayout'
import HeaderMainLayout from './Child/HeaderMainLayout'

import { appLayoutAuth } from '@/app/variable/layoutData'
import { Menus } from '@/routes'
import { mainRoutes } from '@/routes/MainRoutes'

import './MainLayout.scss'
import { buildVersion } from '../../../utils/version'
interface MainLayoutProps {
	children: React.ReactNode
	[key: string]: any
}

const MainLayout = (props: MainLayoutProps) => {
	const { children } = props
	const { pathname, onGetPath, localePathname, onChangeRoute } = useLocalePath()
	const ref = useRef<HTMLDivElement>(null)

	const [openMenu, setOpenMenu] = useState(false)
	const [content, setContent] = useState(null) as any
	const toggleMenus = useCallback(() => {
		setOpenMenu((prev) => !prev)
	}, [])
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (ref.current && !ref.current.contains(event.target as Node)) {
				setOpenMenu(false)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [])

	const _renderSideBar = () => {
		return (
			<Flex
				className={`sideBarMainLayoutWrapper ${
					openMenu ? 'openLayoutMenu' : 'closeLayoutMenu'
				}`}
			>
				<Flex
					ref={ref}
					vertical
					className="sideBarMainLayout"
					style={{ height: '100%' }}
				>
					<Flex className="sideBarMenuToggle">
						<CloseOutlined
							className="sideBarMenuToggleICon"
							onClick={toggleMenus}
						/>
						<span>Menu</span>
					</Flex>
					<Flex vertical className="sideBarMainLayoutItem">
						{Menus.map((menu) => {
							const { title, Icon, path } = menu
							const active = pathname.startsWith(path)
							return (
								<Link key={title} href={onGetPath(path)}>
									<Flex
										gap={12}
										className={`menuItem ${active && 'menuItemActive'}`}
									>
										<div className="iconItemMenu">
											<Icon fill={active ? '#006b35' : '#94A3B8'} />
										</div>
										<span>{title}</span>
									</Flex>
								</Link>
							)
						})}
					</Flex>
					<Flex
						className="justify-end items-end item"
						style={{
							marginTop: 'auto',
							padding: '12px',
							fontSize: '12px',
							color: '#64748B',
						}}
					>
						Version: {buildVersion}
					</Flex>
				</Flex>
			</Flex>
		)
	}
	useEffect(() => {
		const login = isLogin()
		if (!appLayoutAuth.some((i) => pathname.includes(i))) {
			if (!login) {
				onChangeRoute(mainRoutes.login)
			} else {
				setContent(
					<Flex vertical className="wrapperMainLayout">
						<HeaderMainLayout onToggleMenus={toggleMenus} />
						<Flex className="bodyMainLayout">
							{_renderSideBar()}
							<Flex vertical className="contentMainLayout">
								{children}
							</Flex>
						</Flex>
					</Flex>,
				)
			}
		} else {
			if (login) {
				onChangeRoute(mainRoutes.upcomingEvent)
			} else {
				setContent(<AuthLayout>{children}</AuthLayout>)
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [localePathname, openMenu])

	return <div className="mainLayout">{content}</div>
}

export default memo(MainLayout)
