'use client'
import { IconChevronLeft } from '@tabler/icons-react'
import { Dropdown, Flex, Skeleton } from 'antd'
import dayjs from 'dayjs'
import clsx from 'clsx'
import { memo, useCallback } from 'react'

import useProfile from '@/hooks/Profile/useProfile'

import { toJson } from '@/ultis/common.ults'
import { useLocalePath, useSafeBack } from '@/ultis/route.ults'
import { getUserInfo } from '@/ultis/storage.ults'

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
	mappingLevelOptions,
	mappingMod,
	stateFriends,
} from '@/Variable/common.variable'

import ArmHeartIcon from '@/svg/ArmHeartIcon'
import ClockIconDivideTopIcon from '@/svg/ClockIconDivideTopIcon'
import FavoriteIcon from '@/svg/FavoriteIcon'
import GenderIcon from '@/svg/GenderIcon'
import Heart from '@/svg/Heart'
import HouseIcon from '@/svg/HouseIcon'
import PeopleHexagonIcon from '@/svg/PeopleHexagonIcon'
import PinTickIcon from '@/svg/PinTickIcon'
import ProfileCircleIcon from '@/svg/ProfileCircleIcon'
import TwoUser from '@/svg/TwoUser'
import WorldIcon from '@/svg/WorldIcon'
import { getAge } from '@/ultis/date.ults'
import { mappingCountriesOptions } from '@/Variable/countryVariable'
import classes from './Profile.module.scss'
import CCounter from '@/Components/Custom/CCounter'
import MarkIcon from '@/svg/MarkIcon'

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
		menus,
		openEditProfile,
		categoryNetworkOpts,
		onOpenEditP,
		onCloseEditP,
		onGetUserProfile,
		onMenusClick,
		onOpenInbox,
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
		const { avatar, cover, name, address, id, is_friend, i_am_from, mode } =
			userData || {}
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
							<Flex className={classes.status}>{mappingMod[mode]}</Flex>
						</Flex>
						<Flex className={classes.commonInfo} vertical>
							<div className={classes.name}>{name}</div>
							<Flex gap={4} align="center">
								<span className={clsx(`flag:${i_am_from}`, classes.flag)} />
								{mappingCountriesOptions[i_am_from]?.name}
							</Flex>
							<Flex className={classes.address} align="center" gap={4}>
								<div>
									<MarkIcon fill="#7987A4" />
								</div>
								{address || ''}
							</Flex>
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
									onClick={onOpenInbox}
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
				Icon: PeopleHexagonIcon,
			},
			{
				label: 'I’m looking for',
				value: looking_for,
				id: 2,
				Icon: FavoriteIcon,
			},
			{
				label: 'I can offer',
				value: i_can_offer,
				id: 3,
				Icon: ArmHeartIcon,
			},
		]
		return (
			<Flex className={classes.contentBody}>
				<Flex className={classes.content} vertical>
					<div className={classes.title}>
						Message for you <span className="error"> *</span>
					</div>
					{content.map((item) => {
						const { id, label, value, Icon } = item || {}
						return (
							<Flex key={id} gap={8}>
								<Flex>{Icon ? <Icon fill="#006B35" /> : null}</Flex>
								<Flex vertical>
									<div className={classes.label}>{label}</div>
									<div>{value}</div>
								</Flex>
							</Flex>
						)
					})}
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
					<div className={classes.title}>
						About me <span className="error"> *</span>
					</div>
					<div>{about_me}</div>
				</Flex>
			</Flex>
		)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [toJson(userData)])

	const _renderLanguages = useCallback(() => {
		const { user_languages, languages_can_speak } = userData || {}
		return (
			<Flex className={classes.contentBody}>
				<Flex className={classes.content} vertical>
					<div className={classes.title}>
						Languages <span className="error"> *</span>
					</div>
					<Flex vertical gap={12}>
						<Flex className={classes.languageName}>
							<div>{languages_can_speak}</div>
							<div
								className={clsx(
									classes.proficiencyLevel,
									classes.languagesCanSpeak,
								)}
							>
								Native
							</div>
						</Flex>
						{(user_languages || []).map((item) => {
							const { language_name, proficiency_level } = item || {}
							return (
								<Flex key={language_name} className={classes.languageName}>
									<div>{language_name}</div>
									<div
										className={clsx(classes.proficiencyLevel, {
											[classes[mappingLevelOptions[proficiency_level]]]:
												!!proficiency_level,
										})}
									>
										{mappingLevelOptions[proficiency_level]}
									</div>
								</Flex>
							)
						})}
					</Flex>
				</Flex>
			</Flex>
		)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [toJson(userData)])

	const _renderSumary = useCallback(() => {
		const { amount_of_friend, gender, birthday } = userData || {}
		const content = [
			{
				label: 'Friends',
				value: (amount_of_friend || 0) + ' friends',
				id: 1,
				Icon: TwoUser,
			},
			{
				label: 'Gender',
				value: mappingGender[gender],
				id: 2,
				Icon: GenderIcon,
			},
			{
				label: 'Age',
				value: getAge(birthday),
				id: 3,
				Icon: ProfileCircleIcon,
			},
			{
				label: 'Member since',
				value: birthday ? dayjs(birthday).format(formatDate.dmy) : '',
				id: 4,
				Icon: ClockIconDivideTopIcon,
			},
		]
		return (
			<Flex className={classes.contentBody}>
				<Flex className={classes.content} vertical>
					<div className={classes.title}>
						Summary <span className="error"> *</span>
					</div>
					{content.map((item) => {
						const { id, label, value, Icon } = item || {}
						return (
							<Flex key={id} gap={8}>
								<Flex>{Icon ? <Icon fill="#006B35" /> : null}</Flex>
								<Flex vertical>
									<div className={classes.label}>{label}</div>
									<div className={id === 1 ? classes.friend : ''}>{value}</div>
								</Flex>
							</Flex>
						)
					})}
				</Flex>
			</Flex>
		)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [toJson(userData)])

	const _renderSpecial = useCallback(() => {
		const { i_am_from, i_am_interested_in, country_lived, country_visited } =
			userData || {}
		const content = [
			{
				label: 'I am from',
				value: mappingCountriesOptions[i_am_from]?.name,
				id: 4,
				Icon: WorldIcon,
			},
			{
				label: 'Intersted in',
				value: i_am_interested_in,
				id: 1,
				Icon: Heart,
			},
			{
				label: "Countries I've lived in",
				value: country_lived,
				id: 2,
				Icon: HouseIcon,
			},
			{
				label: "Countries I've visited",
				value: country_visited,
				id: 3,
				Icon: PinTickIcon,
				count: (country_visited || '').split(',')?.length,
				isCount: true,
			},
		]
		return (
			<Flex className={classes.contentBody}>
				<Flex className={classes.content} vertical>
					<div className={classes.title}>
						Specialties <span className="error"> *</span>
					</div>
					{content.map((item) => {
						const { id, label, value, Icon, isCount, count } = item || {}
						return (
							<Flex key={id} gap={8}>
								<Flex>{Icon ? <Icon fill="#006B35" /> : null}</Flex>
								<Flex vertical>
									<Flex className={classes.label}>
										{label} &nbsp;{!!isCount && <CCounter number={count} />}
									</Flex>
									<div>{value}</div>
								</Flex>
							</Flex>
						)
					})}
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
			{_renderLanguages()}
			{_renderSumary()}
			{_renderSpecial()}
			{openEditProfile && (
				<ModalEditProfile
					categoryNetworkOpts={categoryNetworkOpts}
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
