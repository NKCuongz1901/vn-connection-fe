'use client'
import { CloseOutlined } from '@ant-design/icons'
import {
	IconLayoutSidebarLeftCollapse,
	IconLayoutSidebarLeftExpand,
	IconLayoutSidebarRight,
} from '@tabler/icons-react'
import { Flex, Tooltip } from 'antd'
import Link from 'next/link'
import React, { memo, useCallback, useEffect, useRef, useState } from 'react'

import { isLogin } from '@/ultis/storage'
import { useLocalePath } from '@/ultis/route'
import { useModal } from '@/context/ModalContext'
import { useNewInbox } from '@/context/NewInboxContext'

import AuthLayout from './Child/AuthLayout'
import HeaderMainLayout from './Child/HeaderMainLayout'
import TermPolicy from '@/Components/TermPolicy'

import {
	appLayoutAuth,
	appLayoutGuestAllowed,
} from '@/app/variable/layoutData'
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
	const { hasNewInboxMessage } = useNewInbox()
	const { openConfirm } = useModal()
	const ref = useRef<HTMLDivElement>(null)

	const isGuestAllowedRoute = appLayoutGuestAllowed.some((i) =>
		pathname.includes(i),
	)
	const shouldGuardMenu = isGuestAllowedRoute && !isLogin()

	const [openMenu, setOpenMenu] = useState(false)
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
	const [content, setContent] = useState(null) as any
	const toggleMenus = useCallback(() => {
		setOpenMenu((prev) => !prev)
	}, [])
	const toggleSidebarCollapsed = useCallback(() => {
		setSidebarCollapsed((prev) => !prev)
	}, [])

	const handleMenuItemClick = useCallback(
		(e: React.MouseEvent<HTMLAnchorElement>) => {
			setOpenMenu(false)
			if (!shouldGuardMenu) return

			e.preventDefault()
			openConfirm({
				titleLabel: 'Login required',
				message: 'Please sign in to access this page.',
				confirmLabel: 'Sign in',
				cancelLabel: 'Cancel',
				onAccept: () => onChangeRoute(mainRoutes.login),
			})
		},
		[shouldGuardMenu, openConfirm, onChangeRoute],
	)
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
				} ${sidebarCollapsed ? 'sidebarCollapsed' : ''}`}
			>
				<Flex
					ref={ref}
					vertical
					className="sideBarMainLayout"
					style={{ height: '100%' }}
				>
					<Flex className="sideBarMenuToggle" align="center">
						<CloseOutlined
							className="sideBarMenuToggleICon sideBarMenuToggleMobile"
							onClick={toggleMenus}
						/>
						<span className="sideBarMenuToggleLabel">Menu</span>
						<div
							className="sideBarCollapseBtn"
							onClick={toggleSidebarCollapsed}
							aria-label={sidebarCollapsed ? 'Expand menu' : 'Collapse menu'}
						>
							{sidebarCollapsed ? (
								<IconLayoutSidebarRight stroke={1} size={20} />
							) : (
								<IconLayoutSidebarRight size={20} />
							)}
						</div>
					</Flex>
					<Flex vertical className="sideBarMainLayoutItem">
						{Menus.map((menu) => {
							const { title, Icon, path } = menu
							const active = Boolean(path) && pathname.startsWith(path)
							const isInboxMenu = path === mainRoutes.inbox
							const showDot = isInboxMenu && hasNewInboxMessage && !active

							const menuItem = (
								<Link
									href={onGetPath(path)}
									className="menuLink"
									onClick={handleMenuItemClick}
								>
									<Flex
										gap={12}
										className={`menuItem ${active ? 'menuItemActive' : ''} ${
											menu.hasTopDivider ? 'menuItemTopDivider' : ''
										}`}
									>
										<div className="iconItemMenu">
											<Icon fill={active ? '#006b35' : '#94A3B8'} />
											{showDot && (
												<span className="inboxUnreadDot" aria-hidden />
											)}
										</div>
										<span className="menuItemLabel">{title}</span>
									</Flex>
								</Link>
							)

							return (
								<Tooltip
									key={title}
									title={sidebarCollapsed ? title : null}
									placement="right"
									mouseEnterDelay={0.1}
								>
									{menuItem}
								</Tooltip>
							)
						})}
					</Flex>
					<Flex
						vertical
						className="sidebarLegalFooter"
						gap={4}
						style={{
							marginTop: 'auto',
							padding: '12px',
							fontSize: '12px',
							color: '#64748B',
						}}
					>
						<span>VN CONNECTIONS COMPANY LIMITED</span>
						<span>Version: {buildVersion}</span>
					</Flex>
				</Flex>
			</Flex>
		)
	}

	const _renderAppShell = () => (
		<Flex vertical className="wrapperMainLayout">
			<HeaderMainLayout onToggleMenus={toggleMenus} />
			<Flex className="bodyMainLayout">
				{_renderSideBar()}
				<Flex vertical className="contentMainLayout">
					<div className="contentMainLayoutBody">{children}</div>
					<footer className="mainLayoutLegalFooter">
						<TermPolicy layout="inline" />
					</footer>
				</Flex>
			</Flex>
		</Flex>
	)

	useEffect(() => {
		const login = isLogin()
		if (appLayoutGuestAllowed.some((i) => pathname.includes(i))) {
			setContent(_renderAppShell())
			return
		}
		if (!appLayoutAuth.some((i) => pathname.includes(i))) {
			if (!login) {
				onChangeRoute(mainRoutes.login)
			} else {
				setContent(_renderAppShell())
			}
		} else {
			const isOpenAppPage = pathname.includes('open-app')
			const isGuestOnlyAuth = [mainRoutes.login, mainRoutes.register].some(
				(i) => pathname.includes(i),
			)
			if (login && !isOpenAppPage && isGuestOnlyAuth) {
				onChangeRoute(mainRoutes.overview)
			} else {
				setContent(<AuthLayout>{children}</AuthLayout>)
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [localePathname, openMenu, sidebarCollapsed, hasNewInboxMessage])

	return <div className="mainLayout">{content}</div>
}

export default memo(MainLayout)
