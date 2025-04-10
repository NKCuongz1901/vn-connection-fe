'use client'
import { IconChevronLeft } from '@tabler/icons-react'
import { Dropdown, Flex, Skeleton } from 'antd'
import dayjs from 'dayjs'
import { memo, useCallback } from 'react'

import useProfile from '@/hooks/Profile/useProfile'

import { getUserInfo, toJson } from '@/ultis/common.ults'
import { useLocalePath, useSafeBack } from '@/ultis/route.ults'

import CAvatar from '@/Components/Custom/CAvatar'
import CButton from '@/Components/Custom/CButton'
import ModalEditProfile from '@/Components/Profile/ModalEditProfile'
import UserMoreAction from '@/Components/User/UserMoreAction'
import ProfileCancelIcon from '@/svg/FriendSvg/ProfileCancelIcon'
import ProfileTick from '@/svg/FriendSvg/ProfileTick'
import ShareIcon from '@/svg/FriendSvg/ShareIcon'

import { mainRoutes } from '@/routes/MainRoutes'
import {
	formatDate,
	mappingGender,
	stateFriends,
} from '@/Variable/common.variable'

import classes from './Profile.module.scss'

const skeletonItems = [
	{ id: '2', value: 220 },
	{ id: '1', value: 120 },
	{ id: '3', value: 320 },
	{ id: '4', value: 240 },
]
interface ProfileProps {
	id?: string
	isMinimize?: boolean
}
const Profile = ({ id, isMinimize }: ProfileProps) => {
	const {
		loading,
		loadingButtonFriend,
		userData,
		onOpenEditP,
		openEditProfile,
		onCloseEditP,
		onGetUserProfile,
		onMenusClick,
		menus,
	} = useProfile({
		id,
	})
	const { goBackOrPush } = useSafeBack()
	const { onChangeRoute } = useLocalePath()
	const _renderButtonFriend = useCallback(() => {
		const { is_friend } = userData || {}
		const { responMenus, cancelMenus, deleteMenus } = menus
		if (is_friend) {
			const { state, friend_id } = is_friend || {}
			if (state === stateFriends.ACCEPTED) {
				return (
					<Dropdown
						disabled={loadingButtonFriend}
						menu={{ items: deleteMenus }}
						trigger={['click']}
					>
						<CButton ctype="disabled" style={{ height: 40 }}>
							<Flex>
								<ProfileTick />
							</Flex>
							<span>Friend</span>
						</CButton>
					</Dropdown>
				)
			} else {
				if (friend_id === getUserInfo('id')) {
					return (
						<Dropdown menu={{ items: responMenus }} trigger={['click']}>
							<CButton
								disabled={loadingButtonFriend}
								ctype="success"
								style={{ height: 40 }}
							>
								<Flex>
									<ProfileTick fill="white" />
								</Flex>
								<span>Respond</span>
							</CButton>
						</Dropdown>
					)
				} else {
					return (
						<Dropdown menu={{ items: cancelMenus }} trigger={['click']}>
							<CButton
								disabled={loadingButtonFriend}
								ctype="disabled"
								style={{ height: 40 }}
							>
								<Flex>
									<ProfileCancelIcon />
								</Flex>
								<span>Cancel Request</span>
							</CButton>
						</Dropdown>
					)
				}
			}
		}
		return (
			<CButton
				disabled={loadingButtonFriend}
				ctype="oranger"
				style={{ height: 40 }}
				onClick={() => onMenusClick('add')}
			>
				Add friend
			</CButton>
		)
	}, [userData, menus, loadingButtonFriend, onMenusClick])

	const _renderTotalInfo = useCallback(() => {
		const { avatar, cover, name, address, id, is_friend } = userData || {}
		const isMe = id === getUserInfo('id')
		return (
			<Flex className={classes.totalInfo} vertical>
				<Flex className={classes.cover}>
					<img
						className={classes.coverImg}
						src={cover || '/images/defaultCover.png'}
						alt=""
					/>
					<Flex className={classes.header}>
						{!isMinimize ? (
							<Flex className={classes.icon}>
								<IconChevronLeft
									onClick={() => goBackOrPush(mainRoutes.home)}
								/>
							</Flex>
						) : (
							<div></div>
						)}
						{isMe ? (
							<div></div>
						) : (
							<Flex className={classes.icon}>
								<UserMoreAction
									id={id}
									isFriend={is_friend}
									onCallback={onGetUserProfile}
								/>
							</Flex>
						)}
					</Flex>
				</Flex>
				<Flex className={classes.infoWrapper}>
					<Flex className={classes.info}>
						<Flex className={classes.avatarWrapper}>
							<CAvatar className={classes.avatar} size={96} src={avatar} />
						</Flex>
						<Flex className={classes.commonInfo} vertical>
							<div className={classes.name}>{name}</div>
							<div className={classes.address}>{address || ''}</div>
							<Flex className={classes.status}>Available</Flex>
						</Flex>
					</Flex>
					<Flex className={classes.endButton}>
						{isMe ? (
							<>
								<CButton
									ctype="oranger"
									style={{ height: 40 }}
									onClick={() => onChangeRoute(mainRoutes.search)}
								>
									<Flex>
										<ShareIcon />
									</Flex>
									<span>Invite friend</span>
								</CButton>
								<CButton
									ctype="disabled"
									style={{ height: 40 }}
									onClick={onOpenEditP}
								>
									Edit Profile
								</CButton>
							</>
						) : (
							<>
								{!isMinimize && _renderButtonFriend()}
								<CButton
									ctype="disabled"
									style={{ height: 40 }}
									onClick={() => onChangeRoute(mainRoutes.inbox)}
								>
									Inbox
								</CButton>
							</>
						)}
					</Flex>
				</Flex>
			</Flex>
		)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [toJson(userData), _renderButtonFriend])

	const _renderMessageForU = useCallback(() => {
		const { who_i_am, looking_for, i_can_offer } = userData || {}
		const content = [
			{
				label: 'I am',
				value: who_i_am,
				id: 1,
			},
			{
				label: 'I’m looking for',
				value: looking_for,
				id: 2,
			},
			{
				label: 'I can offer',
				value: i_can_offer,
				id: 3,
			},
		]
		return (
			<Flex className={classes.contentBody}>
				<Flex className={classes.content} vertical>
					<div className={classes.title}>Message for you</div>
					{content.map((item) => (
						<Flex key={item.id} vertical>
							<div className={classes.label}>{item.label}</div>
							<div>{item.value}</div>
						</Flex>
					))}
				</Flex>
			</Flex>
		)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [toJson(userData)])

	const _renderAbout = useCallback(() => {
		const { about_me } = userData || {}
		return (
			<Flex className={classes.contentBody}>
				<Flex className={classes.content} vertical>
					<div className={classes.title}>About me</div>
					<div>{about_me}</div>
				</Flex>
			</Flex>
		)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [toJson(userData)])

	const _renderSumary = useCallback(() => {
		const { amount_of_friend, gender, age, birthday } = userData || {}
		const content = [
			{
				label: 'Friends',
				value: (amount_of_friend || 0) + ' friends',
				id: 1,
			},
			{
				label: 'Gender',
				value: mappingGender[gender],
				id: 2,
			},
			{
				label: 'Age',
				value: age,
				id: 3,
			},
			{
				label: 'Member since',
				value: birthday ? dayjs(birthday).format(formatDate.dmy) : '',
				id: 4,
			},
		]
		return (
			<Flex className={classes.contentBody}>
				<Flex className={classes.content} vertical>
					<div className={classes.title}>Summary</div>
					{content.map((item) => (
						<Flex key={item.id} vertical>
							<div className={classes.label}>{item.label}</div>
							<div className={item.id === 1 ? classes.friend : ''}>
								{item.value}
							</div>
						</Flex>
					))}
				</Flex>
			</Flex>
		)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [toJson(userData)])

	const _renderSpecial = useCallback(() => {
		const { i_am_interested_in, languages_can_speak, country_visited } =
			userData || {}
		const content = [
			{
				label: 'Intersted in',
				value: i_am_interested_in,
				id: 1,
			},
			{
				label: 'Languages I can speak',
				value: languages_can_speak,
				id: 2,
			},
			{
				label: "Countries I've visited",
				value: country_visited,
				id: 3,
			},
		]
		return (
			<Flex className={classes.contentBody}>
				<Flex className={classes.content} vertical>
					<div className={classes.title}>Specialties</div>
					{content.map((item) => (
						<Flex key={item.id} vertical>
							<div className={classes.label}>{item.label}</div>
							<div>{item.value}</div>
						</Flex>
					))}
				</Flex>
			</Flex>
		)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [toJson(userData)])

	if (loading) {
		return (
			<Flex className={classes.wrapper} vertical>
				<Flex className={classes.totalInfo} vertical>
					<Skeleton.Input active style={{ width: '100%', height: 320 }} />
				</Flex>
				{skeletonItems.map((i) => (
					<Skeleton.Input
						key={i.id}
						active
						className={classes.contentBody}
						style={{ width: '100%', height: i.value }}
					/>
				))}
			</Flex>
		)
	}
	return (
		<Flex className={classes.wrapper} vertical>
			{_renderTotalInfo()}
			{_renderMessageForU()}
			{_renderAbout()}
			{_renderSumary()}
			{_renderSpecial()}
			{openEditProfile && (
				<ModalEditProfile
					open={openEditProfile}
					onClose={onCloseEditP}
					data={userData}
					onGetUserProfile={onGetUserProfile}
				/>
			)}
		</Flex>
	)
}

export default memo(Profile)
