'use client'
import { CloseOutlined } from '@ant-design/icons'
import { Flex } from 'antd'
import Link from 'next/link'
import React, { memo, useCallback, useEffect, useState } from 'react'

import { useLocalePath } from '@/ultis/route.ults'

import HeaderMainLayout from './Child/HeaderMainLayout'

import { Menus } from '@/routes'

import './MainLayout.scss'
import { appLayoutAuth } from '@/app/variable/layoutData'
interface MainLayoutProps {
	children: React.ReactNode
	[key: string]: any
}

const MainLayout = (props: MainLayoutProps) => {
	const { children } = props
	const { pathname, onGetPath, localePathname } = useLocalePath()
	const [openMenu, setOpenMenu] = useState(false)
	const [content, setContent] = useState(null) as any
	const toggleMenus = useCallback(() => {
		setOpenMenu((prev) => !prev)
	}, [])
	const _renderSideBar = () => {
		return (
			<Flex
				className={`sideBarMainLayoutWrapper ${
					openMenu ? 'openLayoutMenu' : 'closeLayoutMenu'
				}`}
			>
				<Flex vertical className="sideBarMainLayout">
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
				</Flex>
			</Flex>
		)
	}
	useEffect(() => {
		if (!appLayoutAuth.some((i) => pathname.includes(i))) {
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
		} else {
			setContent(
				<Flex
					vertical
					className="wrapperContainerMainLayout"
					style={{
						background: 'white',
						color: 'black',
						height: '100vh',
						fontSize: 14,
						overflow: 'auto',
					}}
				>
					{children}
				</Flex>,
			)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [localePathname, openMenu])

	return <>{content}</>
}

export default memo(MainLayout)
