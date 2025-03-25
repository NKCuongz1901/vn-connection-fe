'use client'
import { MenuOutlined, SearchOutlined } from '@ant-design/icons'
import { IconBellFilled, IconUserCircle } from '@tabler/icons-react'
import { Flex } from 'antd'
import { memo, useEffect, useState } from 'react'

import { useLocalePath } from '@/ultis/route.ults'

import CButton from '@/Components/Custom/CButton'
import CInput from '@/Components/Custom/CInput'
import LogoSvg from '@/svg/LogoSvg'

import { mainRoutes } from '@/routes/MainRoutes'

import './HeaderMainLayout.scss'

interface HeaderMainLayoutProps {
	onToggleMenus?: () => void
}
const HeaderMainLayout = (props: HeaderMainLayoutProps) => {
	const { onToggleMenus } = props
	const { onChangeRoute } = useLocalePath()
	const [login, setLogin] = useState(false)
	const isLogin = () => {
		if (typeof window !== 'undefined') {
			return localStorage.getItem('token') || sessionStorage.getItem('token')
		}
		return false
	}
	useEffect(() => {
		setLogin(Boolean(isLogin()))
	}, [])

	return (
		<Flex className="headerMainLayoutWrapper">
			<Flex className="headerMainLayout">
				<Flex gap={4} className="homeMainLayout">
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
						<Flex className="headerIcon">
							<IconBellFilled />
						</Flex>
						<Flex className="headerIcon">
							<IconUserCircle />
						</Flex>
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
