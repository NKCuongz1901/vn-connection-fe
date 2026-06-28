'use client'

import { IconX } from '@tabler/icons-react'
import { Skeleton, Spin } from 'antd'
import clsx from 'clsx'
import { memo, useMemo } from 'react'

import { TalkRoomConnectedUser } from '@/apis/talkRoomApis'
import CAvatar from '@/Components/Custom/CAvatar'
import CModal from '@/Components/Custom/CModal/CModal'
import DotIcon from '@/svg/DotIcon'
import EmptyConnectionIcon from '@/svg/Talkroom/EmptyConnectionIcon'
import FeMaleIcon from '@/svg/FeMaleIcon'
import GenderIcon from '@/svg/GenderIcon'
import MaleIcon from '@/svg/MaleIcon'
import { handleScrollCallback } from '@/ultis/common'
import { mappingFlag } from '@/Variable/countryVariable'

import classes from './TalkRoomConnectedUserModal.module.scss'

const genderIcon = {
	MALE: MaleIcon,
	FEMALE: FeMaleIcon,
	OTHER: GenderIcon,
}

const genderFill = {
	MALE: '#2381FF',
	FEMALE: '#E55A8F',
	OTHER: '#7987A4',
}

export interface TalkRoomConnectedUserModalProps {
	open: boolean
	onClose: () => void
	users: TalkRoomConnectedUser[]
	total?: number
	loading?: boolean
	hasMore?: boolean
	onLoadMore?: () => void
	onCreateRoom?: () => void
}

function TalkRoomConnectedUserModal({
	open,
	onClose,
	users,
	total = 0,
	loading = false,
	hasMore = false,
	onLoadMore,
	onCreateRoom,
}: TalkRoomConnectedUserModalProps) {
	const hasUsers = users.length > 0
	const isEmpty = !loading && !hasUsers
	const displayTotal = total || users.length

	const description = useMemo(
		() =>
			`Amazing! You've connected with ${displayTotal} awesome ${
				displayTotal === 1 ? 'person' : 'people'
			} in this talk room. 🎉`,
		[displayTotal],
	)

	if (!open) return null

	const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
		if (!hasMore || loading) return
		handleScrollCallback(event, () => onLoadMore?.())
	}

	const renderParticipant = (user: TalkRoomConnectedUser) => {
		const IconGender =
			genderIcon[user.gender as keyof typeof genderIcon] ?? genderIcon.OTHER
		const genderColor =
			genderFill[user.gender as keyof typeof genderFill] ?? genderFill.OTHER
		const countryCode = user.country_code

		return (
			<div key={user.id} className={classes.participant}>
				<div className={classes.avatarWrap}>
					<CAvatar src={user.avatar} size={64} className={classes.avatar} />
					{!!countryCode && (
						<div
							className={clsx(
								classes.flag,
								`flag:${mappingFlag[countryCode] || countryCode}`,
							)}
						/>
					)}
				</div>
				<span className={classes.name}>{user.name}</span>
				{(user.age != null || user.gender) && (
					<div className={classes.meta}>
						{user.age != null && (
							<>
								<span className={classes.age}>{user.age}yrs</span>
								{user.gender && <DotIcon />}
							</>
						)}
						{user.gender && (
							<span className={classes.genderIcon}>
								<IconGender fill={genderColor} width={12} height={12} />
							</span>
						)}
					</div>
				)}
			</div>
		)
	}

	const renderSkeleton = () => (
		<div className={classes.skeletonGrid}>
			{Array.from({ length: 10 }).map((_, index) => (
				<div key={index} className={classes.skeletonItem}>
					<Skeleton.Avatar active className={classes.skeletonAvatar} />
					<Skeleton.Input active className={classes.skeletonLine} />
					<Skeleton.Input active className={classes.skeletonLine} />
				</div>
			))}
		</div>
	)

	const renderEmptyState = () => (
		<div className={classes.emptyState}>
			<div className={classes.emptyInfo}>
				<div className={classes.emptyIcon}>
					<EmptyConnectionIcon width={120} height={99} />
				</div>
				<div className={classes.emptyContent}>
					<h3 className={classes.emptyTitle}>No connections yet</h3>
					<p className={classes.emptyDescription}>
						Start a new talk room and be the first to connect with someone!
					</p>
				</div>
			</div>
			<button
				type="button"
				className={classes.createRoomBtn}
				onClick={onCreateRoom}
			>
				Create room
			</button>
		</div>
	)

	const renderSimpleHeader = () => (
		<div className={classes.simpleHeader}>
			<h2 className={classes.simpleTitle}>People connected</h2>
			<button
				type="button"
				className={classes.simpleCloseBtn}
				onClick={onClose}
				aria-label="Close"
			>
				<IconX size={16} />
			</button>
		</div>
	)

	const renderFilledHeader = () => (
		<div className={classes.header}>
			<button
				type="button"
				className={classes.closeBtn}
				onClick={onClose}
				aria-label="Close"
			>
				<IconX size={16} />
			</button>
			<h2 className={classes.title}>
				<span className={classes.titleCount}>{displayTotal}</span>
				{` People connected`}
			</h2>
			<p className={classes.description}>{description}</p>
		</div>
	)

	return (
		<CModal
			open
			centered
			closable={false}
			footer={null}
			onCancel={onClose}
			styles={{
				content: {
					width: isEmpty ? 660 : 692,
					maxWidth: 'calc(100vw - 32px)',
					height: '70vh',
					padding: 0,
					borderRadius: 8,
					overflow: 'hidden',
				},
				body: {
					padding: 0,
				},
			}}
		>
			<div
				className={clsx(classes.wrapper, {
					[classes.wrapperEmpty]: isEmpty,
				})}
			>
				{isEmpty || (loading && !hasUsers)
					? renderSimpleHeader()
					: renderFilledHeader()}

				{!isEmpty && <div className={classes.divider} />}

				<div
					className={clsx(classes.body, {
						[classes.bodyEmpty]: isEmpty,
					})}
					onScroll={hasUsers ? handleScroll : undefined}
				>
					{loading && !hasUsers ? (
						renderSkeleton()
					) : isEmpty ? (
						renderEmptyState()
					) : (
						<>
							<div className={classes.grid}>
								{users.map((user) => renderParticipant(user))}
							</div>
							{loading && users.length > 0 && (
								<div className={classes.loadingMore}>
									<Spin size="small" />
								</div>
							)}
						</>
					)}
				</div>
			</div>
		</CModal>
	)
}

export default memo(TalkRoomConnectedUserModal)
