'use client'

import { SearchOutlined } from '@ant-design/icons'
import { IconCircleCheckFilled, IconXboxXFilled } from '@tabler/icons-react'
import clsx from 'clsx'
import { Flex, Skeleton } from 'antd'
import React, { useCallback, useState } from 'react'

import CAvatar from '@/Components/Custom/CAvatar'

import { joinConversation, leaveConversation } from '@/apis/conversationApis'
import CAvatarBandage from '@/Components/Custom/CAvatarBandage'
import { useModal } from '@/context/ModalContext'
import CButton from '@/Components/Custom/CButton'
import CInput from '@/Components/Custom/CInput'
import useFriendItem from '@/hooks/Friend/useFriendItem'
import useNetwork from '@/hooks/network/useNetwork'
import { mainRoutes } from '@/routes/MainRoutes'
import { arrayFrom, isArray } from '@/ultis/array'
import { formatLastOnlineShort, getAge } from '@/ultis/date'
import { useLocalePath } from '@/ultis/route'
import { getUserInfo } from '@/ultis/storage'
import DotIcon from '@/svg/DotIcon'
import FeMaleIcon from '@/svg/FeMaleIcon'
import FriendPendingIcon from '@/svg/FriendPendingIcon'
import GenderIcon from '@/svg/GenderIcon'
import MaleIcon from '@/svg/MaleIcon'
import ProfileTick from '@/svg/FriendSvg/ProfileTick'
import GlobalIcon from '@/svg/GlobalIcon'
import MapIcon from '@/svg/MapIcon'
import MarkIcon from '@/svg/MarkIcon'
import NotFound from '@/svg/NotFound'
import People from '@/svg/People'
import ProfileFriendPlus from '@/svg/ProfileFriendPlus'
import StarIcon from '@/svg/Event/StarIcon'
import { LEFT_FLAG, mappingFlag } from '@/Variable/countryVariable'
import { stateFriends } from '@/Variable/common.variable'

import classes from './PeopleCommunity.module.scss'

type FriendActionType =
	| 'add'
	| 'pending_sent'
	| 'pending_received'
	| 'friends'
	| 'none'

const TABS = [
	{ key: 'friends' as const, label: 'Friends' },
	{ key: 'user' as const, label: 'People' },
	{ key: 'club' as const, label: 'Communities' },
]

const genderIcon = {
	MALE: MaleIcon,
	FEMALE: FeMaleIcon,
	OTHER: GenderIcon,
}

const getCommunityRole = (item: any) =>
	item?.userRole || item?.membership_type || ''

const isCommunityJoined = (item: any) => {
	const role = getCommunityRole(item)
	if (role === 'OWNER' || role === 'ADMIN' || role === 'MEMBER') return true
	return isArray(item?.users_in_conversation, 1)
}

const getFriendRelation = (item: any) => {
	if (item?.is_friend) return item.is_friend
	const fromFriends = item?.friends?.[0]
	if (fromFriends) return fromFriends
	return item?.my_friends?.[0] || null
}

const getFriendActionType = (
	item: any,
	myUserId?: string,
): FriendActionType => {
	const relation = getFriendRelation(item)
	if (!relation) return 'add'

	const { state, friend_id } = relation
	if (state === stateFriends.ACCEPTED) return 'friends'
	if (state === stateFriends.PENDING) {
		return friend_id === myUserId ? 'pending_received' : 'pending_sent'
	}
	return 'add'
}

function PeopleCommunity() {
	const { onChangeRoute } = useLocalePath()
	const { openError } = useModal()
	const myUserId = getUserInfo('id')
	const [loadingJoinIds, setLoadingJoinIds] = useState<string[]>([])
	const {
		loading: friendLoading,
		onAccept,
		onCancel,
		onAdd,
	} = useFriendItem({})
	const {
		activeTab,
		users,
		friends,
		clubs,
		filter,
		loading,
		canLoadMoreUser,
		canLoadMoreFriends,
		canLoadMoreClub,
		onChangeTab,
		onChangeFilter,
		onScroll,
		onLoadMore,
		updateUser,
		updateClub,
	} = useNetwork()

	const patchUserFriend = useCallback(
		(userId: string, is_friend: any) => {
			updateUser(userId, { is_friend, friends: is_friend ? [is_friend] : [] })
		},
		[updateUser],
	)

	const handleAddFriend = useCallback(
		(e: React.MouseEvent, item: any) => {
			e.stopPropagation()
			onAdd({
				id: item.id,
				onCallback: (is_friend) => patchUserFriend(item.id, is_friend),
			})
		},
		[onAdd, patchUserFriend],
	)

	const handleCancelFriend = useCallback(
		(e: React.MouseEvent, item: any) => {
			e.stopPropagation()
			const relation = getFriendRelation(item)
			const requestId = relation?.id
			if (!requestId) return
			onCancel({
				id: requestId,
				onCallback: () => patchUserFriend(item.id, null),
			})
		},
		[onCancel, patchUserFriend],
	)

	const handleAcceptFriend = useCallback(
		(e: React.MouseEvent, item: any) => {
			e.stopPropagation()
			const relation = getFriendRelation(item)
			const requestId = relation?.id
			if (!requestId) return
			onAccept({
				id: requestId,
				onCallback: () =>
					patchUserFriend(item.id, {
						...relation,
						state: stateFriends.ACCEPTED,
					}),
			})
		},
		[onAccept, patchUserFriend],
	)

	const handleJoinCommunity = useCallback(
		async (e: React.MouseEvent, item: any) => {
			e.stopPropagation()
			const { id } = item || {}
			if (!id || loadingJoinIds.includes(id)) return
			setLoadingJoinIds((prev) => [...prev, id])
			try {
				await joinConversation({ id, status: true })
				updateClub(id, {
					amount_of_user: (item.amount_of_user || 0) + 1,
					users_in_conversation: [
						{
							conversation_id: id,
							user_id: myUserId,
							type: 'MEMBER',
						},
					],
				})
			} catch (error) {
				openError(error)
			} finally {
				setLoadingJoinIds((prev) => prev.filter((clubId) => clubId !== id))
			}
		},
		[loadingJoinIds, myUserId, openError, updateClub],
	)

	const handleLeaveCommunity = useCallback(
		async (e: React.MouseEvent, item: any) => {
			e.stopPropagation()
			const { id } = item || {}
			if (!id || loadingJoinIds.includes(id)) return
			setLoadingJoinIds((prev) => [...prev, id])
			try {
				await leaveConversation({ id })
				updateClub(id, {
					amount_of_user: Math.max((item.amount_of_user || 1) - 1, 0),
					users_in_conversation: [],
					userRole: undefined,
					membership_type: undefined,
				})
			} catch (error) {
				openError(error)
			} finally {
				setLoadingJoinIds((prev) => prev.filter((clubId) => clubId !== id))
			}
		},
		[loadingJoinIds, openError, updateClub],
	)

	const renderCommunityAvatar = (item: any) => {
		const { avatar, updated_at } = item || {}
		const role = getCommunityRole(item)
		const isOwner = role === 'OWNER'
		const isAdmin = role === 'ADMIN'

		const avatarNode =
			isOwner || isAdmin ? (
				<CAvatarBandage
					src={avatar}
					size={48}
					className={classes.communityAvatar}
					classBandage={clsx(classes.communityBandage, {
						[classes.communityBandageAdmin]: isAdmin,
					})}
					{...(isAdmin && { customeBandage: <StarIcon /> })}
				/>
			) : (
				<CAvatar src={avatar} size={48} className={classes.communityAvatar} />
			)

		return <div className={classes.communityAvatarWrap}>{avatarNode}</div>
	}

	const renderCommunityMeta = (item: any) => {
		const { amount_of_user, away, is_offline, is_online } = item || {}
		const showInPerson = is_offline === true
		const showOnline =
			!showInPerson && (is_online === true || is_offline === false)

		return (
			<Flex align="center" gap={4} className={classes.communityMetaRow}>
				<Flex align="center" gap={4} className={classes.communityMetaItem}>
					<People fill="#48546B" width={14} height={14} />
					<span>{amount_of_user ?? 0} members</span>
				</Flex>
				{away != null && away !== '' && (
					<>
						<span className={classes.communityMetaDivider} />
						<Flex align="center" gap={4} className={classes.communityMetaItem}>
							<MapIcon fill="#48546B" width={14} height={14} />
							<span>{away} km</span>
						</Flex>
					</>
				)}
				{(showOnline || showInPerson) && (
					<>
						<span className={classes.communityMetaDivider} />
						<Flex align="center" gap={4} className={classes.communityMetaItem}>
							{showInPerson ? (
								<>
									<MarkIcon fill="#0067B8" width={14} height={14} />
									<span className={classes.communityMetaInPerson}>
										In-person
									</span>
								</>
							) : (
								<>
									<GlobalIcon fill="#1B8024" width={14} height={14} />
									<span className={classes.communityMetaOnline}>Online</span>
								</>
							)}
						</Flex>
					</>
				)}
			</Flex>
		)
	}

	const renderCommunityAction = (item: any) => {
		const { id } = item || {}
		const role = getCommunityRole(item)
		const isOwner = role === 'OWNER'
		const isJoined = isCommunityJoined(item)
		const isLoading = loadingJoinIds.includes(id)

		if (isJoined) {
			return (
				<button
					type="button"
					className={clsx(classes.communityBtn, classes.communityBtnJoined)}
					disabled={isOwner || isLoading}
					onClick={(e) => handleLeaveCommunity(e, item)}
				>
					Joined
				</button>
			)
		}

		return (
			<button
				type="button"
				className={clsx(classes.communityBtn, classes.communityBtnJoin)}
				disabled={isLoading}
				onClick={(e) => handleJoinCommunity(e, item)}
			>
				Join
			</button>
		)
	}

	const renderFriendAction = (item: any) => {
		const actionType = getFriendActionType(item, myUserId)
		const disabled = friendLoading

		switch (actionType) {
			case 'friends':
				return (
					<span
						className={clsx(
							classes.friendBtn,
							classes.friendBtnSecondary,
							classes.friendBtnStatic,
						)}
						aria-label="Friends"
					>
						<ProfileTick fill="#7987A4" width={16} height={16} />
					</span>
				)
			case 'pending_sent':
				return (
					<button
						type="button"
						className={clsx(classes.friendBtn, classes.friendBtnSecondary)}
						disabled={disabled}
						onClick={(e) => handleCancelFriend(e, item)}
						aria-label="Cancel friend request"
					>
						<FriendPendingIcon fill="#7987A4" width={16} height={16} />
					</button>
				)
			case 'pending_received':
				return (
					<Flex gap={8} align="center">
						<button
							type="button"
							className={clsx(classes.friendBtn, classes.friendBtnSecondary)}
							disabled={disabled}
							onClick={(e) => handleCancelFriend(e, item)}
							aria-label="Decline friend request"
						>
							<IconXboxXFilled size={16} color="#7987A4" />
						</button>
						<button
							type="button"
							className={clsx(classes.friendBtn, classes.friendBtnPrimary)}
							disabled={disabled}
							onClick={(e) => handleAcceptFriend(e, item)}
							aria-label="Accept friend request"
						>
							<IconCircleCheckFilled size={16} color="#fff" />
						</button>
					</Flex>
				)
			case 'add':
				return (
					<button
						type="button"
						className={clsx(classes.friendBtn, classes.friendBtnSecondary)}
						disabled={disabled}
						onClick={(e) => handleAddFriend(e, item)}
						aria-label="Add friend"
					>
						<ProfileFriendPlus fill="#7987A4" width={16} height={16} />
					</button>
				)
			default:
				return null
		}
	}

	const renderMemberAvatar = (item: any) => {
		const { avatar, visibility, online_time, i_am_from, country_code } =
			item || {}
		const isOnline = visibility === 'ONLINE'
		const countryCode = i_am_from || country_code
		const flagClass = countryCode
			? `flag:${mappingFlag[countryCode] || countryCode}`
			: ''

		return (
			<div className={classes.memberAvatarCol}>
				<div className={classes.memberAvatarWrap}>
					<CAvatar src={avatar} size={64} className={classes.memberAvatar} />
					{flagClass && (
						<div className={classes.flagWrapper}>
							<div
								className={clsx(flagClass, classes.flag, {
									[classes.leftFlag]: !!LEFT_FLAG[countryCode],
								})}
							/>
						</div>
					)}
					{!isOnline && online_time && (
						<span className={classes.lastSeen}>
							{formatLastOnlineShort(online_time)}
						</span>
					)}
				</div>
			</div>
		)
	}

	const renderMemberInfo = (item: any) => {
		const { name, age, birthday, gender, address_local, address } = item || {}
		const displayAge = age ?? (birthday ? getAge(birthday) : null)
		const IconGender =
			genderIcon[gender as keyof typeof genderIcon] ?? genderIcon.OTHER
		const location = address_local || address

		return (
			<div className={classes.memberInfo}>
				<div className={classes.memberName}>{name}</div>
				{(displayAge || IconGender) && (
					<Flex align="center" gap={4} className={classes.memberMetaRow}>
						{displayAge ? (
							<span className={classes.memberMeta}>{displayAge} yrs</span>
						) : null}
						{displayAge && IconGender ? <DotIcon /> : null}
						{IconGender ? (
							<span
								className={clsx(classes.genderIcon, {
									[classes.genderIconOther]: gender === 'OTHER',
								})}
							>
								<IconGender
									width={16}
									height={16}
									{...(gender === 'OTHER' && { fill: '#7987A4' })}
									{...(gender === 'MALE' && { fill: '#2381FF' })}
									{...(gender === 'FEMALE' && { fill: '#E55A8F' })}
								/>
							</span>
						) : null}
					</Flex>
				)}
				{location ? (
					<Flex align="center" gap={4} className={classes.memberLocation}>
						<MarkIcon fill="#7987A4" width={14} height={14} />
						<span>{location}</span>
					</Flex>
				) : null}
			</div>
		)
	}

	const renderEmpty = (label: string) => (
		<Flex className={classes.notFound} vertical>
			<NotFound />
			<div className={classes.notFoundTitle}>No results found</div>
			<span>{label}</span>
		</Flex>
	)

	const renderMemberList = (
		items: any[],
		isLoading: boolean,
		canLoadMore: React.MutableRefObject<boolean>,
		emptyLabel: string,
	) => {
		if (!isLoading && !isArray(items, 1)) {
			return renderEmpty(emptyLabel)
		}

		return (
			<div className={classes.memberList} onScroll={onScroll}>
				{items.map((item) => {
					const { id } = item || {}
					const actionType = getFriendActionType(item, myUserId)
					const showFriendAction =
						actionType !== 'none' && id && id !== myUserId

					return (
						<div
							key={id}
							className={classes.memberItem}
							onClick={() => onChangeRoute(`${mainRoutes.profile}/${id}`)}
						>
							{renderMemberAvatar(item)}
							{renderMemberInfo(item)}
							{showFriendAction ? (
								<div
									className={classes.memberActions}
									onClick={(e) => e.stopPropagation()}
								>
									{renderFriendAction(item)}
								</div>
							) : null}
						</div>
					)
				})}
				{isLoading &&
					arrayFrom(5).map((_, index) => (
						<Skeleton.Input
							key={index}
							active
							className={classes.skeletonMember}
						/>
					))}
				{!isLoading && canLoadMore.current && isArray(items, 1) && (
					<div className={classes.loadMore}>
						<CButton ctype="oranger" onClick={onLoadMore}>
							Load more
						</CButton>
					</div>
				)}
			</div>
		)
	}

	const renderCommunityList = () => {
		if (!loading.club && !isArray(clubs, 1)) {
			return renderEmpty('Try a different search keyword')
		}

		return (
			<div className={classes.communityList} onScroll={onScroll}>
				{clubs.map((item) => {
					const { id, title, category, updated_at } = item || {}

					return (
						<React.Fragment key={id}>
							<div
								className={classes.communityItem}
								onClick={() => onChangeRoute(`${mainRoutes.community}/${id}`)}
							>
								<div className={classes.communityAvatarCol}>
									{renderCommunityAvatar(item)}
								</div>
								<div className={classes.communityInfo}>
									<div className={classes.communityTitle}>{title}</div>
									{category ? (
										<div className={classes.communityCategory}>{category}</div>
									) : null}
									{renderCommunityMeta(item)}
									{/* {updated_at ? (
										<div className={classes.communityUpdatedAt}>
											{formatRelativeAgo(updated_at)}
										</div>
									) : null} */}
								</div>
								<div
									className={classes.communityActions}
									onClick={(e) => e.stopPropagation()}
								>
									{renderCommunityAction(item)}
								</div>
							</div>
							<div className={classes.communityDivider} />
						</React.Fragment>
					)
				})}
				{loading.club &&
					arrayFrom(5).map((_, index) => (
						<Skeleton.Input
							key={index}
							active
							className={classes.skeletonCommunity}
						/>
					))}
				{!loading.club && canLoadMoreClub.current && isArray(clubs, 1) && (
					<div className={classes.loadMore}>
						<CButton ctype="oranger" onClick={onLoadMore}>
							Load more
						</CButton>
					</div>
				)}
			</div>
		)
	}

	return (
		<div className={classes.wrapper}>
			<div className={classes.title}>Search people & Communities</div>
			<div className={classes.container}>
				<div className={classes.searchRow}>
					<CInput
						className={classes.searchInput}
						placeholder="Search name"
						value={filter.q}
						isNotBold
						allowClear={false}
						bordered={false}
						prefix={<SearchOutlined className={classes.searchIcon} />}
						onChange={onChangeFilter('q')}
					/>
				</div>
				<Flex className={classes.tabBar}>
					{TABS.map(({ key, label }) => (
						<button
							key={key}
							type="button"
							className={clsx(classes.tabItem, {
								[classes.tabItemActive]: activeTab === key,
							})}
							onClick={() => onChangeTab(key)}
						>
							{label}
						</button>
					))}
				</Flex>

				<div className={classes.listBody}>
					{activeTab === 'friends' &&
						renderMemberList(
							friends,
							loading.friends,
							canLoadMoreFriends,
							filter.q?.trim()
								? 'Try a different search keyword'
								: 'You have no friends yet',
						)}
					{activeTab === 'user' &&
						renderMemberList(
							users,
							loading.user,
							canLoadMoreUser,
							'Try a different search keyword',
						)}
					{activeTab === 'club' && renderCommunityList()}
				</div>
			</div>
		</div>
	)
}

export default PeopleCommunity
