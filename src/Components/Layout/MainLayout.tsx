'use client'
import { Flex } from 'antd'
import React, { memo } from 'react'
import './MainLayout.scss'
import { Menus } from '@/routes'
import { useLocalePath } from '@/ultis/route.ults'
import Link from 'next/link'
import Logo from '@/svg/LogoSvg'
import { CloseOutlined } from '@ant-design/icons'
interface MainLayoutProps {
	children: React.ReactNode
	[key: string]: any
}

const MainLayout = (props: MainLayoutProps) => {
	const { children } = props
	const { pathname, onGetPath } = useLocalePath()
	const _renderHeader = () => {
		return (
			<Flex className="headerMainLayout">
				<Flex gap={4}>
					<Logo />
					<span>UniVini</span>
				</Flex>
			</Flex>
		)
	}
	const _renderSideBar = () => {
		return (
			<Flex className="sideBarMainLayoutWrapper">
				<Flex vertical className="sideBarMainLayout">
					<Flex className="sideBarMenuToggle">
						<CloseOutlined
							className="sideBarMenuToggleICon"
							// onClick={() => onChangeRoute(mainRoutes.login)}
						/>
						<span>Menu</span>
					</Flex>
					<Flex vertical className="sideBarMainLayoutItem">
						{Menus.map((menu) => {
							const { title, Icon, path } = menu
							const active = pathname.includes(path)
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
	return (
		<Flex vertical className="wrapperMainLayout">
			{_renderHeader()}
			<Flex className="bodyMainLayout">
				{_renderSideBar()}
				<Flex vertical className="contentMainLayout">
					{children}
				</Flex>
			</Flex>
		</Flex>
	)
}

export default memo(MainLayout)
