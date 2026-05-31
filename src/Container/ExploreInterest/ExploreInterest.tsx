'use client'
import {
	IconGenderBigender,
	IconGenderFemale,
	IconGenderMale,
} from '@tabler/icons-react'
import { Flex, Skeleton } from 'antd'
import clsx from 'clsx'
import { memo } from 'react'

import useExploreInterest from '@/hooks/ExploreInterest/useExploreInterest'

import { arrayFrom, isArray } from '@/ultis/array'
import { useLocalePath } from '@/ultis/route'

import CAvatar from '@/Components/Custom/CAvatar'
import CButton from '@/Components/Custom/CButton'
import CImage from '@/Components/Custom/CImage'
import CInputMap from '@/Components/Custom/CInputMap'
import CSelect from '@/Components/Custom/CSelect'
import ModalInviteCommunity from '@/Components/ExploreInterest/ModalInviteCommunity'
import ArrrowLeftIcon from '@/svg/ArrrowLeftIcon'
import MapIcon from '@/svg/MapIcon'
import MarkIcon from '@/svg/MarkIcon'
import People from '@/svg/People'

import { radiusOpts } from '@/Variable/select.variable'
import { mainRoutes } from '@/routes/MainRoutes'

import classes from './ExploreInterest.module.scss'

const tabs = [
	{
		value: 'club',
		label: 'Communities',
	},
	{
		value: 'user',
		label: 'People by interest',
	},
]
const status = [
	{
		value: 'is_online',
		label: 'Online',
	},
	{
		value: 'is_offline',
		label: 'Offline',
	},
]
const mappingTabMatching = {
	club: 'Matching Communities',
	user: 'Matching People',
}
const GENDER = {
	FEMALE: (
		<IconGenderFemale style={{ color: '#ED5DCD' }} className={classes.gender} />
	),
	MALE: (
		<IconGenderMale style={{ color: '#2381FF' }} className={classes.gender} />
	),
	OTHER: (
		<IconGenderBigender
			style={{ color: '#006B35' }}
			className={classes.gender}
		/>
	),
}
const ExploreInterest = () => {
	const { onChangeRoute } = useLocalePath()
	const {
		loadingInvite,
		invited,
		modal,
		selects,
		filters,
		tabsData,
		loading,
		loadingMatching,
		activeTab,
		matchingClub,
		matchingUser,
		matching,
		statusClub,
		loadingJoin,

		setModal,
		setInvited,
		setMatching,
		onSetStatus,
		onChangeTab,
		onChangeFilter,
		onChooseCategory,
		onSearchMatching,
		onJoinConv,
		onJoinLeave,
		onScrollClub,
		onScrollUser,
		onInviteUser,
	} = useExploreInterest({})
	console.log('tab data:', tabsData)
	const _renderNoData = () => {
		return <Flex className={classes.noData}>No matching Data</Flex>
	}
	const _renderHeader = () => {
		if (matching) {
			return (
				<Flex className={classes.header} onClick={() => setMatching(false)}>
					<ArrrowLeftIcon />
					<div>{mappingTabMatching[activeTab]}</div>
				</Flex>
			)
		}
		return (
			<Flex className={classes.header}>
				<People fill="#1E9037" />
				<div>Explore by interest</div>
			</Flex>
		)
	}

	const _renderSearch = () => {
		const { radius, latitude, longitude, address } = filters || {}
		if (matching) return
		return (
			<Flex className={classes.search}>
				<CInputMap
					disabled={loading}
					placeholder="Search location"
					value={address}
					longitude={longitude}
					latitude={latitude}
					onSubmitModal={onChangeFilter('address')}
					prefix={<MarkIcon fill="#94a3b8" />}
				/>

				<Flex className={classes.distance}>
					<CSelect
						disabled={loading}
						value={radius}
						options={radiusOpts}
						placeholder="Choose distance"
						prefix={<MarkIcon />}
						onChange={onChangeFilter('radius')}
					/>
				</Flex>
			</Flex>
		)
	}

	const _renderTabBnt = () => {
		return (
			<Flex className={classes.tabBntWrapper}>
				{tabs.map((i) => (
					<Flex
						key={i.value}
						className={clsx(classes.tabBnt, {
							[classes.activeTab]: i.value === activeTab,
						})}
						onClick={() => onChangeTab(i.value)}
					>
						{i.label}
					</Flex>
				))}
			</Flex>
		)
	}
	const _renderLoadingMatching = () => {
		return (
			<Flex vertical className={classes.loadingMatching}>
				{arrayFrom(5).map((_, index) => (
					<Skeleton.Input key={index} className={classes.skeletonMatching} />
				))}
			</Flex>
		)
	}
	const _renderTabData = () => {
		const datas = tabsData[activeTab]
		if (loading) {
			return (
				<Flex className={classes.skeletonWrapper}>
					{arrayFrom(36).map((_, index) => (
						<Skeleton.Input key={index} active className={classes.skeleton} />
					))}
				</Flex>
			)
		}
		return (
			<Flex className={classes.dataWrapper}>
				{(datas || []).map((data) => {
					const { id, image, title, count } = data || {}
					return (
						<Flex
							vertical
							key={id}
							className={clsx(classes.itemWrapper, {
								[classes.itemSelected]: selects.includes(id),
							})}
							onClick={() => onChooseCategory(id)}
						>
							<Flex className={classes.count}>{count || 0}</Flex>
							<Flex className={classes.itemImg}>
								<CImage src={image} />
							</Flex>
							<div className={classes.itemLable}>{title}</div>
						</Flex>
					)
				})}
			</Flex>
		)
	}
	const _renderMatchingClubList = () => {
		return (
			<Flex
				vertical
				className={classes.matchingClubList}
				onScroll={onScrollClub}
			>
				{isArray(matchingClub, 1)
					? matchingClub.map((item) => {
							const {
								id,
								title,
								amount_of_user,
								avatar,
								away,
								category,
								users_in_conversation,
								membership_type,
								is_offline,
							} = item || {}
							const isOwner = membership_type === 'OWNER'
							const isJoin = isArray(users_in_conversation, 1) || isOwner
							const isLoading = loadingJoin.includes(id)
							return (
								<Flex key={id} className={classes.matchingClubWrapper}>
									<Flex className={classes.matchingClubInfoLeft}>
										<CAvatar
											src={avatar}
											className={classes.infoAva}
											onClick={() =>
												onChangeRoute(`${mainRoutes.community}/${id}`)
											}
										/>

										<Flex
											vertical
											className={classes.matchingClubInfo}
											onClick={() =>
												onChangeRoute(`${mainRoutes.community}/${id}`)
											}
										>
											<div className={classes.matchingClubInfoLabel}>
												{title}
											</div>
											<div className={classes.matchingClubInfoCate}>
												{category}
											</div>
											<Flex className={classes.otherInfo}>
												<Flex className={classes.otherInfoItem}>
													<People fill="#006b35" />
													<div>{amount_of_user} members</div>
												</Flex>
												{is_offline && statusClub.is_offline && (
													<Flex className={classes.otherInfoItem}>
														<MapIcon fill="#006b35" />
														<div>{away} km</div>
													</Flex>
												)}
											</Flex>
										</Flex>
									</Flex>
									<Flex className={classes.matchingClubInfoRight}>
										<CButton
											disabled={isOwner || isLoading}
											ctype={isJoin ? 'disabled' : 'success'}
											onClick={() => {
												if (isJoin) {
													onJoinLeave(id)
												} else {
													onJoinConv(id)
												}
											}}
										>
											{isJoin ? 'Joined' : 'Join'}
										</CButton>
									</Flex>
								</Flex>
							)
						})
					: !loadingMatching.club && _renderNoData()}
				{loadingMatching.club && _renderLoadingMatching()}
			</Flex>
		)
	}
	const _renderMatchingItemClub = () => {
		return (
			<Flex vertical className={classes.matchingClub}>
				<Flex className={classes.matchingClubStatus}>
					{status.map((item) => (
						<Flex
							key={item.value}
							className={clsx(classes.matchingClubBtn, {
								[classes.matchingClubBtnSelected]: !!statusClub[item.value],
							})}
							onClick={() => onSetStatus(item.value)}
						>
							{item.label}
						</Flex>
					))}
				</Flex>
				{_renderMatchingClubList()}
			</Flex>
		)
	}

	const _renderMatchingUserList = () => {
		return (
			<Flex
				vertical
				className={classes.matchingClubList}
				onScroll={onScrollUser}
			>
				{isArray(matchingUser, 1)
					? matchingUser.map((item) => {
							const { id, name, age, avatar, i_am_interested_in, gender } =
								item || {}
							return (
								<Flex key={id} className={classes.matchingClubWrapper}>
									<Flex
										className={classes.matchingClubInfoLeft}
										onClick={() => onChangeRoute(`${mainRoutes.profile}/${id}`)}
									>
										<CAvatar src={avatar} className={classes.infoAva} />

										<Flex vertical className={classes.matchingClubInfo}>
											<div className={classes.matchingClubInfoLabel}>
												{name}
											</div>
											<Flex className={classes.matchingClubInfoCate}>
												<div>{age} yrs </div>
												<div>{GENDER[gender || 'OTHER']}</div>
											</Flex>
											<Flex className={classes.otherInfo}>
												<Flex className={classes.otherInfoItem}>
													{i_am_interested_in}
												</Flex>
											</Flex>
										</Flex>
									</Flex>
									<Flex className={classes.matchingClubInfoRight}>
										<CButton
											ctype="success"
											onClick={() => {
												setModal({ type: 'invite', data: id })
											}}
										>
											Invite
										</CButton>
									</Flex>
								</Flex>
							)
						})
					: !loadingMatching.user && _renderNoData()}
				{loadingMatching.user && _renderLoadingMatching()}
			</Flex>
		)
	}
	const _renderMatchingItemUser = () => {
		return (
			<Flex vertical className={classes.matchingClub}>
				<Flex className={classes.matchingUserAll}>
					<div className={classes.matchingUserAllTitle}>
						Send invitation to all
					</div>
					<CButton
						ctype="oranger"
						onClick={() => setModal({ type: 'invite', data: null })}
					>
						Invite all
					</CButton>
				</Flex>
				{_renderMatchingUserList()}
			</Flex>
		)
	}

	const _renderMatching = () => {
		switch (activeTab) {
			case 'club':
				return _renderMatchingItemClub()
			case 'user':
				return _renderMatchingItemUser()
		}
	}
	const _renderMyFriendComp = (data) => {
		const { inviteeRole, id } = data || {}

		const isInvite = inviteeRole !== 'MEMBER' && !invited[id]
		return (
			<div className={classes.btnShareFriend}>
				<CButton
					ctype="success"
					onClick={() => onInviteUser(id)}
					loading={loadingInvite[id]}
					disabled={!isInvite || loadingInvite[id]}
				>
					{isInvite ? 'Send' : 'Sent'}
				</CButton>
			</div>
		)
	}
	const _renderModal = () => {
		const { type, data } = modal || {}
		let Content = <></>
		const propsModal = {
			open: true,
			data,
			onCancel: () => {
				setModal({})
			},
			onClose: () => {
				setModal({})
				setInvited({})
			},
		}
		switch (type) {
			case 'invite':
				Content = (
					<ModalInviteCommunity
						title="Send invitation to my communities"
						id={data}
						{...propsModal}
						customComp={_renderMyFriendComp}
					/>
				)
				break

			default:
				break
		}
		return Content
	}
	return (
		<div className={classes.wrapper}>
			<Flex vertical className={classes.container}>
				{_renderHeader()}
				<Flex className={classes.content} vertical>
					{_renderSearch()}
					{_renderTabBnt()}
					{!matching ? _renderTabData() : _renderMatching()}
					{!matching && (
						<Flex className={classes.matching}>
							<CButton
								disabled={!isArray(selects, 1)}
								ctype={isArray(selects, 1) ? 'oranger' : 'disabled'}
								onClick={onSearchMatching}
							>
								See Matching Communities
							</CButton>
						</Flex>
					)}
				</Flex>
			</Flex>
			{_renderModal()}
		</div>
	)
}

export default memo(ExploreInterest)
