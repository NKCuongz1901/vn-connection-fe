'use client'

import { SearchOutlined } from '@ant-design/icons'
import { IconCrown, IconStar } from '@tabler/icons-react'
import clsx from 'clsx'
import { Flex, Skeleton } from 'antd'
import React from 'react'

import CAvatar from '@/Components/Custom/CAvatar'
import CButton from '@/Components/Custom/CButton'
import CInput from '@/Components/Custom/CInput'
import useNetwork from '@/hooks/network/useNetwork'
import { mainRoutes } from '@/routes/MainRoutes'
import { arrayFrom, isArray } from '@/ultis/array'
import { useLocalePath } from '@/ultis/route'
import NotFound from '@/svg/NotFound'

import classes from './Network.module.scss'

type ClubBadge = 'crown' | 'star' | null

const TABS = [
	{ key: 'user' as const, label: 'Members' },
	{ key: 'club' as const, label: 'Networks' },
]

const getClubBadge = (club: any): ClubBadge => {
	if (club?.userRole === 'OWNER') return 'crown'
	if (club?.userRole === 'ADMIN' || club?.is_verified) return 'star'
	return null
}

function Network() {
	const { onChangeRoute } = useLocalePath()
	const {
		activeTab,
		users,
		clubs,
		filter,
		loading,
		canLoadMoreUser,
		canLoadMoreClub,
		onChangeTab,
		onChangeFilter,
		onScroll,
		onLoadMore,
	} = useNetwork()

	const renderEmpty = (label: string) => (
		<Flex className={classes.notFound} vertical>
			<NotFound />
			<div className={classes.notFoundTitle}>No results found</div>
			<span>{label}</span>
		</Flex>
	)

	const renderMemberList = () => {
		if (!loading.user && !isArray(users, 1)) {
			return renderEmpty('Try a different search keyword')
		}

		return (
			<div className={classes.memberList} onScroll={onScroll}>
				{users.map((item) => {
					const { id, avatar, name } = item || {}
					return (
						<div
							key={id}
							className={classes.memberItem}
							onClick={() => onChangeRoute(`${mainRoutes.profile}/${id}`)}
						>
							<CAvatar src={avatar} size={40} />
							<span className={classes.memberName}>{name}</span>
						</div>
					)
				})}
				{loading.user &&
					arrayFrom(5).map((_, index) => (
						<Skeleton.Input
							key={index}
							active
							className={classes.skeletonMember}
						/>
					))}
				{!loading.user && canLoadMoreUser.current && isArray(users, 1) && (
					<div className={classes.loadMore}>
						<CButton ctype="oranger" onClick={onLoadMore}>
							Load more
						</CButton>
					</div>
				)}
			</div>
		)
	}

	const renderNetworkGrid = () => {
		if (!loading.club && !isArray(clubs, 1)) {
			return renderEmpty('Try a different search keyword')
		}

		return (
			<div className={classes.networkGrid} onScroll={onScroll}>
				{clubs.map((item) => {
					const { id, avatar, title } = item || {}
					const badge = getClubBadge(item)

					return (
						<div
							key={id}
							className={classes.networkItem}
							onClick={() => onChangeRoute(`${mainRoutes.community}/${id}`)}
						>
							<div className={classes.networkAvatarWrap}>
								<CAvatar src={avatar} size={64} />
								{badge === 'crown' && (
									<span className={`${classes.badge} ${classes.badgeCrown}`}>
										<IconCrown size={16} stroke={2} />
									</span>
								)}
								{badge === 'star' && (
									<span className={`${classes.badge} ${classes.badgeStar}`}>
										<IconStar size={16} stroke={2} color="#fff" />
									</span>
								)}
							</div>
							<div className={classes.networkName}>{title}</div>
						</div>
					)
				})}
				{loading.club &&
					arrayFrom(8).map((_, index) => (
						<Skeleton.Avatar
							key={index}
							active
							size={64}
							className={classes.skeletonNetwork}
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

			<div className={classes.searchRow}>
				<CInput
					className={classes.searchInput}
					placeholder="Search"
					value={filter.q}
					isNotBold
					allowClear={false}
					bordered={false}
					prefix={<SearchOutlined className={classes.searchIcon} />}
					onChange={onChangeFilter('q')}
				/>
			</div>

			<div className={classes.sectionTitle}>
				{activeTab === 'user' ? 'Suggested members' : 'Suggested networks'}
			</div>

			{activeTab === 'user' ? renderMemberList() : renderNetworkGrid()}
		</div>
	)
}

export default Network
