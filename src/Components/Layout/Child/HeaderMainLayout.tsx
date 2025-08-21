'use client'
import { MenuOutlined, SearchOutlined } from '@ant-design/icons'
import { IconBellFilled, IconUserCircle } from '@tabler/icons-react'
import { Dropdown, Flex } from 'antd'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useLocalePath } from '@/ultis/route.ults'
import { handleRemoveAllCookie, isLogin } from '@/ultis/storage.ults'

import CButton from '@/Components/Custom/CButton'
import CInput from '@/Components/Custom/CInput'
import Notification from '@/Container/Notification'
import LogoSvg from '@/svg/LogoSvg'

import { mainRoutes } from '@/routes/MainRoutes'

import { ItemType } from 'antd/es/menu/interface'
import './HeaderMainLayout.scss'

interface HeaderMainLayoutProps {
	onToggleMenus?: () => void
}
const HeaderMainLayout = (props: HeaderMainLayoutProps) => {
	const { onToggleMenus } = props
	const { onChangeRoute } = useLocalePath()

	const ref = useRef<HTMLDivElement>(null)

	const [login, setLogin] = useState(false)
	const [show, setShow] = useState(false)
	const userMenus: ItemType[] = useMemo(
		() => [
			{
				key: 'profile',
				label: 'My Profile',
				onClick: () => handleMenusClick('profile'),
			},
			{
				key: 'setting',
				label: 'Account Settings',
			},
			{
				key: 'fns',
				label: 'Feedback & Support',
			},
			{
				key: 'signout',
				label: 'Sign out',
				onClick: () => handleMenusClick('signout'),
				style: { color: '#F80024' },
			},
		],
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[],
	)
	// const isLogin = () => {
	// 	if (typeof window !== 'undefined') {
	// 		return localStorage.getItem('token') || sessionStorage.getItem('token')
	// 	}
	// 	return false
	// }
	useEffect(() => {
		setLogin(Boolean(isLogin()))
		const handleClickOutside = (event: MouseEvent) => {
			if (ref.current && !ref.current.contains(event.target as Node)) {
				setShow(false)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [])

	const handleMenusClick = useCallback((type: string) => {
		switch (type) {
			case 'profile':
				onChangeRoute(mainRoutes.profile)
				break
			case 'fns':
				break
			case 'signout':
				handleRemoveAllCookie()
				onChangeRoute(mainRoutes.login)
				break
			default:
				break
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return (
		<Flex className="headerMainLayoutWrapper">
			<Flex className="headerMainLayout">
				<Flex
					gap={4}
					className="homeMainLayout"
					onClick={() => onChangeRoute(mainRoutes.home)}
				>
					<LogoSvg />
					<div>UniVini</div>
				</Flex>
				<Flex className="headerSearchMainLayout">
					<CInput
						placeholder="Find your events"
						style={{ borderRadius: 40, height: 40 }}
						prefix={<SearchOutlined className="headerSeachOutline" />}
					/>
				</Flex>
			</Flex>
			<Flex className="headerButton">
				{login ? (
					<>
						<Flex
							className="headerIcon"
							ref={ref}
							onClick={() => setShow((prev) => !prev)}
						>
							<IconBellFilled />
							{show && <Notification />}
						</Flex>

						<Dropdown menu={{ items: userMenus }} trigger={['click']}>
							<Flex className="headerIcon">
								<IconUserCircle />
							</Flex>
						</Dropdown>
					</>
				) : (
					<>
						<CButton
							ctype="oranger"
							style={{ height: 40, width: 86, padding: 12 }}
							onClick={() => onChangeRoute(mainRoutes.login)}
						>
							Sign In
						</CButton>
						<CButton
							ctype="disabled"
							style={{ height: 40, width: 86, padding: 12 }}
							onClick={() => onChangeRoute(mainRoutes.register)}
						>
							Sign Up
						</CButton>
					</>
				)}
				<MenuOutlined className="headerMenuOutlined" onClick={onToggleMenus} />
			</Flex>
		</Flex>
	)
}

export default memo(HeaderMainLayout)
