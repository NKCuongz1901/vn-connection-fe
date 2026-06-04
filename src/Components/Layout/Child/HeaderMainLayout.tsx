'use client'
import { MenuOutlined, SearchOutlined } from '@ant-design/icons'
import {
	IconBellFilled,
	IconMapPinFilled,
	IconUserCircle,
} from '@tabler/icons-react'
import { Dropdown, Flex } from 'antd'
import { ItemType } from 'antd/es/menu/interface'
import { onMessage } from 'firebase/messaging'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { messaging } from '@/config/firebase'
import { initFCM } from '@/config/firebase-messaging'

import { logout } from '@/apis/authApis'
import { getNotificationCount } from '@/apis/notificationApis'
import { getUserProfile, updateUserProfile } from '@/apis/userApis'

import { useSearchLocation } from '@/context/SearchLocationContext'

import { useLocalePath } from '@/ultis/route'
import {
	getStorageCookie,
	handleRemoveAllCookie,
	handleRemoveAllSession,
	handleStorageCookie,
	isLogin,
	setSessionStorage,
} from '@/ultis/storage'

import CButton from '@/Components/Custom/CButton'
import CInputMap from '@/Components/Custom/CInputMap'
import Notification from '@/Container/Notification'
import LogoSvg from '@/svg/LogoSvg'
import CAvatar from '@/Components/Custom/CAvatar'

import { mainRoutes } from '@/routes/MainRoutes'

import { STORAGE_KEY } from '@/Variable/storage.variable'

import './HeaderMainLayout.scss'

interface HeaderMainLayoutProps {
	onToggleMenus?: () => void
}
const HeaderMainLayout = (props: HeaderMainLayoutProps) => {
	const { onToggleMenus } = props
	const { onChangeRoute, pathname } = useLocalePath()
	const { location, setLocationFromMap } = useSearchLocation()

	const isSearchPage = pathname.includes(mainRoutes.search)

	const ref = useRef<HTMLDivElement>(null)

	const [login, setLogin] = useState(false)
	const [mapOpen, setMapOpen] = useState(false)
	const [show, setShow] = useState(false)
	const [count, setCount] = useState(0)
	const [user, setUser] = useState(null)

	const userMenus: ItemType[] = useMemo(
		() => [
			{
				key: 'profile',
				label: 'My Profile',
				onClick: () => handleMenusClick('profile'),
			},
			{
				key: 'peopleCommunity',
				label: 'Search people & communities',
				onClick: () => handleMenusClick('peopleCommunity'),
			},
			{
				key: 'setting',
				label: 'Account Settings',
				onClick: () => handleMenusClick('accountSetting'),
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

	const handleGetCount = useCallback(async () => {
		try {
			const res: any = await getNotificationCount({})
			if (res) {
				setCount(res?.results?.object?.count || 0)
			}
		} catch (error) {
			console.log(error)
		}
	}, [])
	const toggleNoti = (value?: any) => {
		setShow((prev) => value ?? !prev)
		if (show) {
			handleGetCount()
		}
	}

	useEffect(() => {
		const isLoggedIn = Boolean(isLogin())
		setLogin(isLoggedIn)
		if (isLoggedIn) {
			handleGetCount()
		}
		const handleClickOutside = (event: MouseEvent) => {
			if (ref.current && !ref.current.contains(event.target as Node)) {
				toggleNoti(false)
			}
		}

		document.addEventListener('click', handleClickOutside)
		return () => {
			document.removeEventListener('click', handleClickOutside)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])
	const handleUpdateProfile = async (token) => {
		try {
			await updateUserProfile({ last_token_web: token })
		} catch (error) {
			console.log(error)
		}
	}

	const handleClick = useCallback((data) => {
		const { action, post_id } = data || {}
		switch (action) {
			case 'COMMENT_ON_DISCUSS_IN_TOPIC':
				onChangeRoute(`${mainRoutes.discussions}?id=${post_id}`)
				break
			case 'NEW_EVENT_CREATE_NEAR_BY_USER':
			case 'COMMENT_ON_EVENT':
				onChangeRoute(`${mainRoutes.upcomingEvent}/${post_id}`)
				break
			default:
				onChangeRoute(mainRoutes.overview)
				break
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const handleStorageUserInfo = async () => {
		try {
			const res: any = await getUserProfile({
				params: {
					fields: ['$all'],
				},
			})
			setSessionStorage({
				key: STORAGE_KEY.USER,
				data: res?.results?.object || {},
			})
			setUser(res?.results?.object || {})
		} catch {}
	}
	useEffect(() => {
		// Sử dụng khối try...catch bên ngoài để bắt các lỗi đồng bộ
		// xảy ra ngay lập tức trong quá trình khởi tạo hook.
		try {
			handleStorageUserInfo()
			// Sửa lỗi TS1252: Chuyển Function Declaration thành Arrow Function Expression.
			const setupFCM = async () => {
				// Bọc logic bất đồng bộ trong try...catch để bắt lỗi mạng hoặc lỗi Firebase.
				try {
					// Tắt console.log() sau khi debug
					const token = await initFCM()
					console.log('🏖️ FCM Token:', token)
					if (token) {
						handleStorageCookie({
							key: 'last_token_web',
							data: token,
							expireInDays: 300,
						})
						// 🔥 Lưu token về server nếu cần
						handleUpdateProfile(token)
					}
				} catch (error) {
					console.error(
						'🔥 Lỗi trong quá trình khởi tạo FCM (initFCM/handleUpdateProfile):',
						error,
					)
					// TODO: Log lỗi này lên webhook nếu cần
				}
			}
			setupFCM()

			const handleMessage = (payload: any) => {
				// Bọc logic xử lý tin nhắn trong foreground để ngăn lỗi làm hỏng listener.
				try {
					console.log('📩 Payload nhận foreground:', { payload })
					const { data, notification } = payload || {}
					const { title, body, icon } = notification || {}

					// Chỉ hiển thị notification nếu trình duyệt cho phép
					if (
						window.Notification &&
						window.Notification.permission === 'granted'
					) {
						const notif = new (window.Notification as any)(
							title || 'Notification',
							{
								body: body,
								icon: icon || '/images/univini-logo.png',
							},
						)

						notif.onclick = () => {
							const postId = data?.post_id
							if (postId) {
								// Gọi hàm xử lý click tùy chỉnh (chuyển hướng, mở modal,...)
								handleClick(data)
							}
							notif.close()
						}
					} else {
						console.warn('Quyền hiển thị Notification chưa được cấp.')
					}
				} catch (error) {
					console.error(
						'🔥 Lỗi khi xử lý tin nhắn Foreground (handleMessage):',
						error,
					)
				}
			}

			// Gắn listener onMessage
			onMessage(messaging, handleMessage)
		} catch (outerError) {
			console.error(
				'🔥 Lỗi Đồng Bộ Cấp Cao trong useEffect (Lỗi nghiêm trọng):',
				outerError,
			)
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const handleLogout = async () => {
		try {
			// Tắt console.log() sau khi debug
			const access_token = getStorageCookie('token')
			const refresh_token = getStorageCookie('refresh_token')
			const last_token_web = getStorageCookie('last_token_web')
			const body = {
				access_token,
				refresh_token,
				fcm_token: last_token_web,
			}
			await logout(body)
		} catch (error) {
			console.error('🔥 Lỗi trong quá trình logout', error)
		} finally {
			handleRemoveAllCookie()
			handleRemoveAllSession()
			onChangeRoute(mainRoutes.login)
		}
	}

	const handleSearchInputClick = useCallback(() => {
		if (!isSearchPage) {
			onChangeRoute(mainRoutes.search)
			return
		}
		setMapOpen(true)
	}, [isSearchPage, onChangeRoute])

	const handleMenusClick = useCallback((type: string) => {
		switch (type) {
			case 'profile':
				onChangeRoute(mainRoutes.profile)
				break
			case 'fns':
				break
			case 'signout':
				handleLogout()
				break
			case 'accountSetting':
				onChangeRoute(`${mainRoutes.accountSetting}/manage-account`)
				break
			case 'peopleCommunity':
				onChangeRoute(mainRoutes.peopleCommunity)
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
				{login && (
					<Flex className="headerSearchMainLayout">
						<CInputMap
							title="Location"
							value={location.address}
							longitude={location.longitude}
							latitude={location.latitude}
							placeholder="Search location to find people, events & communities."
							onSubmitModal={setLocationFromMap}
							onInputClick={handleSearchInputClick}
							open={mapOpen}
							onOpenChange={setMapOpen}
							prefix={<SearchOutlined className="headerSeachOutline" />}
							style={{ borderRadius: 40, height: 44, width: 415 }}
						/>
					</Flex>
				)}
			</Flex>
			<Flex className="headerButton">
				{login ? (
					<>
						<Flex className="headerIcon" ref={ref} onClick={() => toggleNoti()}>
							<IconBellFilled />
							{show && <Notification onClose={() => toggleNoti(false)} />}
							{!!count && <div className="notificationCount" />}
						</Flex>

						<Dropdown menu={{ items: userMenus }} trigger={['click']}>
							<Flex className="headerIcon">
								{user?.avatar ? (
									<CAvatar src={user.avatar} size={40} />
								) : (
									<IconUserCircle />
								)}
							</Flex>
						</Dropdown>
					</>
				) : (
					<>
						<CButton
							ctype="oranger"
							style={{ height: 40, width: 82 }}
							onClick={() => onChangeRoute(mainRoutes.login)}
						>
							Sign In
						</CButton>
					</>
				)}
				<MenuOutlined className="headerMenuOutlined" onClick={onToggleMenus} />
			</Flex>
		</Flex>
	)
}

export default memo(HeaderMainLayout)
