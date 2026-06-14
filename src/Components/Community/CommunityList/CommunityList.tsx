'use client'

import clsx from 'clsx'
import { Flex, Skeleton } from 'antd'
import React, { useCallback, useState } from 'react'

import CAvatar from '@/Components/Custom/CAvatar'
import CAvatarBandage from '@/Components/Custom/CAvatarBandage'
import CButton from '@/Components/Custom/CButton'
import { useModal } from '@/context/ModalContext'
import { joinConversation, leaveConversation } from '@/apis/conversationApis'
import { mainRoutes } from '@/routes/MainRoutes'
import { arrayFrom, isArray } from '@/ultis/array'
import { useLocalePath } from '@/ultis/route'
import { getUserInfo } from '@/ultis/storage'
import GlobalIcon from '@/svg/GlobalIcon'
import MapIcon from '@/svg/MapIcon'
import MarkIcon from '@/svg/MarkIcon'
import NotFound from '@/svg/NotFound'
import People from '@/svg/People'
import StarIcon from '@/svg/Event/StarIcon'

import {
	getCommunityRole,
	isCommunityJoined,
} from './communityList.utils'
import classes from './CommunityList.module.scss'

export interface CommunityListProps {
	clubs: any[]
	loading: boolean
	canLoadMore: React.MutableRefObject<boolean>
	onScroll: (e: React.UIEvent<HTMLDivElement>) => void
	onLoadMore: () => void
	onUpdateClub: (clubId: string, patch: Record<string, unknown>) => void
	emptyLabel?: string
	listClassName?: string
	scrollClassName?: string
}

function CommunityList({
	clubs,
	loading,
	canLoadMore,
	onScroll,
	onLoadMore,
	onUpdateClub,
	emptyLabel = 'Try a different search keyword',
	listClassName,
	scrollClassName,
}: CommunityListProps) {
	const { onChangeRoute } = useLocalePath()
	const { openError } = useModal()
	const myUserId = getUserInfo('id')
	const [loadingJoinIds, setLoadingJoinIds] = useState<string[]>([])

	const handleJoinCommunity = useCallback(
		async (e: React.MouseEvent, item: any) => {
			e.stopPropagation()
			const { id } = item || {}
			if (!id || loadingJoinIds.includes(id)) return
			setLoadingJoinIds((prev) => [...prev, id])
			try {
				await joinConversation({ id, status: true })
				onUpdateClub(id, {
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
		[loadingJoinIds, myUserId, onUpdateClub, openError],
	)

	const handleLeaveCommunity = useCallback(
		async (e: React.MouseEvent, item: any) => {
			e.stopPropagation()
			const { id } = item || {}
			if (!id || loadingJoinIds.includes(id)) return
			setLoadingJoinIds((prev) => [...prev, id])
			try {
				await leaveConversation({ id })
				onUpdateClub(id, {
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
		[loadingJoinIds, onUpdateClub, openError],
	)

	const renderCommunityAvatar = (item: any) => {
		const { avatar } = item || {}
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

	if (!loading && !isArray(clubs, 1)) {
		return (
			<Flex className={classes.notFound} vertical>
				<NotFound />
				<div className={classes.notFoundTitle}>No results found</div>
				<span>{emptyLabel}</span>
			</Flex>
		)
	}

	return (
		<div className={clsx(classes.wrapper, listClassName)}>
			<div
				className={clsx(classes.communityList, scrollClassName)}
				onScroll={onScroll}
			>
				{clubs.map((item) => {
					const { id, title, category } = item || {}

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
				{loading &&
					arrayFrom(5).map((_, index) => (
						<Skeleton.Input
							key={index}
							active
							className={classes.skeletonCommunity}
						/>
					))}
				{!loading && canLoadMore.current && isArray(clubs, 1) && (
					<div className={classes.loadMore}>
						<CButton ctype="oranger" onClick={onLoadMore}>
							Load more
						</CButton>
					</div>
				)}
			</div>
		</div>
	)
}

export default CommunityList
