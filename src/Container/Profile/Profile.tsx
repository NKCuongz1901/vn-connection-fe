'use client'
import { IconChevronLeft } from '@tabler/icons-react'
import { Dropdown, Flex, Skeleton } from 'antd'
import clsx from 'clsx'
import dayjs from 'dayjs'
import { memo, useCallback, useState, Fragment } from 'react'

import useProfile from '@/hooks/Profile/useProfile'

import { toJson } from '@/ultis/common'
import { isArray } from '@/ultis/array'
import { getAge, getDiffFromNow } from '@/ultis/date'
import { useLocalePath, useQuery, useSafeBack } from '@/ultis/route'
import { getUserInfo } from '@/ultis/storage'

import CButton from '@/Components/Custom/CButton'
import CCounter from '@/Components/Custom/CCounter'
import CImage from '@/Components/Custom/CImage'
import ModalEditProfile from '@/Components/Profile/ModalEditProfile'
import UserMoreAction from '@/Components/User/UserMoreAction'
import ArmHeartIcon from '@/svg/ArmHeartIcon'
import ClockIcon from '@/svg/ClockIcon'
import ClockIconDivideTopIcon from '@/svg/ClockIconDivideTopIcon'
import FavoriteIcon from '@/svg/FavoriteIcon'
import ProfileCancelIcon from '@/svg/FriendSvg/ProfileCancelIcon'
import ProfileTick from '@/svg/FriendSvg/ProfileTick'
import ShareIcon from '@/svg/FriendSvg/ShareIcon'
import GenderIcon from '@/svg/GenderIcon'
import Heart from '@/svg/Heart'
import HouseIcon from '@/svg/HouseIcon'
import MarkIcon from '@/svg/MarkIcon'
import Messenger from '@/svg/Messenger'
import PeopleHexagonIcon from '@/svg/PeopleHexagonIcon'
import PinTickIcon from '@/svg/PinTickIcon'
import ProfileCircleIcon from '@/svg/ProfileCircleIcon'
import WorldIcon from '@/svg/WorldIcon'
import People from '@/svg/People'
import { IconStarFilled } from '@tabler/icons-react'
import { IconAlertCircleFilled } from '@tabler/icons-react'
import TickIcon from '@/svg/TickIcon'

import { mainRoutes } from '@/routes/MainRoutes'
import {
	formatDate,
	mappingGender,
	mappingLevelOptions,
	mappingMod,
	stateFriends,
} from '@/Variable/common.variable'

import {
	mappingCountriesOptions,
	mappingFlag,
} from '@/Variable/countryVariable'

import classes from './Profile.module.scss'
import ModalProfileComplete from '@/Components/Notification/ModalProfileComplete/ModalProfileComplete'
import TickCircleIcon from '@/svg/TickCircleIcon'
import CupIcon from '@/svg/CupIcon'

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
const Profile = (props: ProfileProps) => {
	const { isMinimize } = props
	const { onGetQuerry } = useQuery()
	const { redirect } = onGetQuerry()
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
		onReDirect,
	} = useProfile(props)
	const { goBackOrPush } = useSafeBack()
	const { onChangeRoute } = useLocalePath()
	const [openModalProfileComplete, setOpenModalProfileComplete] =
		useState(false)
	const COMPLETED_SCORE = 100
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
								<ProfileTick fill="#000" />
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
		const {
			avatar,
			cover,
			name,
			address,
			id,
			is_friend,
			i_am_from,
			mode,
			amount_of_friend,
		} = userData || {}
		const isMe = id === getUserInfo('id')
		const completedScore = userData?.complete_profile?.point || 0
		return (
			<Flex className={classes.totalInfo} vertical>
				<Flex className={classes.cover}>
					<div className={classes.coverImg}>
						<CImage preview src={cover || '/images/defaultCover2.jpg'} alt="" />
					</div>
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
									isProfile
									userData={userData}
									isFriend={!isMinimize && is_friend}
									onCallback={onGetUserProfile}
								/>
							</Flex>
						)}
					</Flex>
				</Flex>
				<Flex className={classes.infoWrapper}>
					<Flex className={classes.info}>
						<Flex className={classes.avatarWrapper}>
							<div className={classes.avatar}>
								<CImage preview src={avatar} />
							</div>
							<Flex className={classes.status}>{mappingMod[mode]}</Flex>
						</Flex>
						<Flex className={classes.commonInfo} vertical>
							<div className={classes.name}>{name}</div>
							<Flex gap={4} align="center">
								<span
									className={clsx(
										`flag:${mappingFlag[i_am_from] || i_am_from}`,
										classes.flag,
									)}
								/>
								{mappingCountriesOptions[i_am_from]?.name}
							</Flex>
							<Flex gap={12} align="center">
								<Flex gap={4} align="center">
									<People fill="#006B35" width={14} height={14} />
									<span className={classes.amountOfFriend}>
										{amount_of_friend} friends
									</span>
								</Flex>
								<Flex gap={4} align="center">
									<IconStarFilled size={14} color="#006B35" />
									<span className={classes.amountOfFeferences}>
										10 feferences
									</span>
								</Flex>
							</Flex>
							<Flex className={classes.address} align="center" gap={4}>
								<div>
									<MarkIcon fill="#7987A4" />
								</div>
								{(address || '').split(',').slice(-2).join(',')}
							</Flex>
							{isMe ? (
								completedScore < 100 ? (
									<div
										className={classes.completedScoreWrapper}
										onClick={() => setOpenModalProfileComplete(true)}
									>
										<Flex gap={4} align="center">
											<IconAlertCircleFilled size={16} color="#E55A0F" />
											<span className={classes.completedScoreText}>
												Your Profile: {completedScore}% completed
											</span>
										</Flex>
									</div>
								) : (
									<div className={classes.completedScoreWrapperComplete}>
										<Flex gap={4} align="center">
											<TickCircleIcon fill="#006B35" width={16} height={16} />
											<span className={classes.completedScoreCompleteText}>
												Your profile is complete
											</span>
										</Flex>
									</div>
								)
							) : (
								<div className={classes.communityBuilderWrapper}>
									<Flex gap={4} align="center">
										<CupIcon fill="#E55A0F" width={14} height={14} />
										<span className={classes.communityBuilderText}>
											Community builder:{' '}
											<span className={classes.communityBuilderTextBold}>
												5
											</span>{' '}
											friends invited
										</span>
									</Flex>
								</div>
							)}
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
									<Flex>
										<Messenger fill="#006B35" />
									</Flex>
									<span>Inbox</span>
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
					<div className={classes.title}>Message for you</div>
					{content.map((item) => {
						const { id, label, value, Icon } = item || {}
						return (
							<Flex key={id} gap={8}>
								<Flex className={classes.contentIcon}>
									{Icon ? <Icon fill="#006B35" /> : null}
								</Flex>
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
					<div className={classes.title}>About me</div>
					<div className={classes.aboutMe}>{about_me}</div>
				</Flex>
			</Flex>
		)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [toJson(userData)])

	const _renderLanguages = useCallback(() => {
		const { user_languages, languages_can_speak_array } = userData || {}
		const nativeLanguages = (languages_can_speak_array || []).filter(Boolean)
		const practicingLanguages = user_languages || []

		if (!isArray(nativeLanguages, 1) && !isArray(practicingLanguages, 1))
			return null

		const displayItems: { key: string; name: string; level: string; combined?: boolean }[] =
			[]

		if (nativeLanguages.length > 2) {
			displayItems.push({
				key: 'languages-can-speak-combined',
				name: nativeLanguages.join(', '),
				level: 'Native',
				combined: true,
			})
		} else {
			nativeLanguages.forEach((lang, index) => {
				displayItems.push({
					key: `native-${lang}-${index}`,
					name: lang,
					level: 'Native',
				})
			})
		}

		practicingLanguages.forEach((item, index) => {
			const { language_name, proficiency_level } = item || {}
			if (!language_name) return
			displayItems.push({
				key: `practice-${language_name}-${index}`,
				name: language_name,
				level:
					mappingLevelOptions[proficiency_level] || proficiency_level || '',
			})
		})

		if (!displayItems.length) return null

		return (
			<Flex className={classes.contentBody} vertical>
				<div className={classes.title}>Languages</div>
				<Flex className={classes.languageSkills} align="center" wrap="wrap">
					{displayItems.map((item, index) => (
						<Fragment key={item.key}>
							{index > 0 && <div className={classes.languageDivider} />}
							<Flex className={classes.languageItem} vertical>
								<span
									className={clsx(classes.languageName, {
										[classes.languageNameCombined]: item.combined,
									})}
								>
									{item.name}
								</span>
								<span className={classes.languageLevel}>{item.level}</span>
							</Flex>
						</Fragment>
					))}
				</Flex>
			</Flex>
		)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [toJson(userData)])

	const _renderSumary = useCallback(() => {
		const {
			id,
			gender,
			birthday,
			created_at,
			is_hide_age,
			visibility,
			online_time,
		} = userData || {}
		const isHideAge = is_hide_age && id !== getUserInfo('id')

		const lastActiveValue = (() => {
			if (visibility === 'ONLINE') return 'Online'
			if (!online_time) return ''
			const { value, unit } = getDiffFromNow({ input: Number(online_time) })
			if (!unit) return String(value)
			const label = value === 1 ? unit : `${unit}s`
			return `${value} ${label} ago`
		})()

		const content = [
			{
				label: 'Gender',
				value: mappingGender[gender],
				id: 1,
				Icon: GenderIcon,
			},
			...(isHideAge
				? []
				: [
						{
							label: 'Age',
							value: getAge(birthday),
							id: 2,
							Icon: ProfileCircleIcon,
						},
					]),
			{
				label: 'Member since',
				value: created_at ? dayjs(created_at).format(formatDate.dmy) : '',
				id: 3,
				Icon: ClockIconDivideTopIcon,
			},
			{
				label: 'Last active',
				value: lastActiveValue,
				id: 4,
				Icon: ClockIcon,
			},
		]
		return (
			<Flex className={classes.contentBody} vertical>
				<div className={classes.title}>Summary</div>
				<div className={classes.summaryList}>
					{content.map((item) => {
						const { id, label, value, Icon } = item || {}
						return (
							<Flex key={id} className={classes.summaryItem} align="flex-start">
								<Flex className={classes.summaryIcon}>
									{Icon ? <Icon fill="#006B35" width={24} height={24} /> : null}
								</Flex>
								<Flex className={classes.summaryText} vertical>
									<span className={classes.summaryLabel}>{label}</span>
									<span className={classes.summaryValue}>{value}</span>
								</Flex>
							</Flex>
						)
					})}
				</div>
			</Flex>
		)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [toJson(userData)])

	const _renderReferences = useCallback(() => {
		const { id } = userData || {}
		const isMe = id === getUserInfo('id')
		if (!isMe) return null
		return (
			<Flex className={classes.contentBody}>
				<Flex className={classes.refContent}>
					<Flex className={classes.title} vertical gap={8}>
						<Flex gap={8}>
							<p className={classes.titleText}>Invite & Earn</p>
							<div className={classes.titleTextSub}>1 point = 5,000 đ</div>
						</Flex>
						<div className={classes.DetailTextSub}>
							Community builder:{' '}
							<span className={classes.DetailTextSubBold}>
								5 friends invited
							</span>
						</div>
					</Flex>
					<CButton className={classes.inviteBtn}>Invite now</CButton>
				</Flex>
			</Flex>
		)
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
				count: (country_visited || '').split(',').filter(Boolean)?.length,
				isCount: true,
			},
		]
		return (
			<Flex className={classes.contentBody}>
				<Flex className={classes.content} vertical>
					<div className={classes.title}>Specialties</div>
					{content.map((item) => {
						const { id, label, value, Icon, isCount, count } = item || {}
						return (
							<Flex key={id} gap={8}>
								<Flex className={classes.contentIcon}>
									{Icon ? <Icon fill="#006B35" /> : null}
								</Flex>
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
			{_renderReferences()}
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
					onGetUserProfile={redirect ? onReDirect : onGetUserProfile}
				/>
			)}
			{openModalProfileComplete && (
				<ModalProfileComplete
					completeData={userData?.complete_profile}
					onClose={() => setOpenModalProfileComplete(false)}
					onCompleteProfile={() => {
						setOpenModalProfileComplete(false)
						onOpenEditP()
					}}
				/>
			)}
		</Flex>
	)
}

export default memo(Profile)
