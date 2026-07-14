'use client'

import { IconX } from '@tabler/icons-react'
import { Skeleton, Spin } from 'antd'
import clsx from 'clsx'
import { memo } from 'react'

import { TalkRoomCountMeInListItem } from '@/apis/talkRoomApis'
import CAvatar from '@/Components/Custom/CAvatar'
import CModal from '@/Components/Custom/CModal/CModal'
import DotIcon from '@/svg/DotIcon'
import FeMaleIcon from '@/svg/FeMaleIcon'
import GenderIcon from '@/svg/GenderIcon'
import MaleIcon from '@/svg/MaleIcon'
import Messenger from '@/svg/Messenger'
import { handleScrollCallback } from '@/ultis/common'
import { mappingFlag } from '@/Variable/countryVariable'

import classes from './TalkRoomPeoplePlanJoinModal.module.scss'

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

export interface TalkRoomPeoplePlanJoinModalProps {
	open: boolean
	onClose: () => void
	users: TalkRoomCountMeInListItem[]
	loading?: boolean
	hasMore?: boolean
	onLoadMore?: () => void
	onMessage?: (userId: string) => void
}

/** Modal listing users who counted themselves in for a talk room. */
function TalkRoomPeoplePlanJoinModal({
	open,
	onClose,
	users,
	loading = false,
	hasMore = false,
	onLoadMore,
	onMessage,
}: TalkRoomPeoplePlanJoinModalProps) {
	if (!open) return null

	const hasUsers = users.length > 0
	const isEmpty = !loading && !hasUsers

	const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
		if (!hasMore || loading) return
		handleScrollCallback(event, () => onLoadMore?.())
	}

	const renderUser = (item: TalkRoomCountMeInListItem) => {
		const user = item.user
		const userId = user?.id || item.user_id
		const IconGender =
			genderIcon[user?.gender as keyof typeof genderIcon] ?? genderIcon.OTHER
		const genderColor =
			genderFill[user?.gender as keyof typeof genderFill] ?? genderFill.OTHER
		const countryCode = user?.country_code || user?.i_am_from || ''
		const languages =
			user?.languages_can_speak ||
			(user?.languages_can_speak_array || []).join(', ')

		return (
			<div key={item.user_id || userId} className={classes.item}>
				<div className={classes.avatarCol}>
					<div className={classes.avatarWrap}>
						<CAvatar src={user?.avatar} size={48} className={classes.avatar} />
						{!!countryCode && (
							<div className={classes.flagWrapper}>
								<div
									className={clsx(
										classes.flag,
										`flag:${mappingFlag[countryCode] || countryCode}`,
									)}
								/>
							</div>
						)}
					</div>
				</div>

				<div className={classes.info}>
					<p className={classes.name}>{user?.name || '—'}</p>
					{(user?.age != null || user?.gender) && (
						<div className={classes.meta}>
							{user?.age != null && (
								<>
									<span className={classes.age}>{user.age}yrs</span>
									{user?.gender && <DotIcon />}
								</>
							)}
							{user?.gender && (
								<span className={classes.genderIcon}>
									<IconGender fill={genderColor} width={12} height={12} />
								</span>
							)}
						</div>
					)}
					{!!languages && <p className={classes.languages}>{languages}</p>}
				</div>

				<div className={classes.actionCol}>
					<button
						type="button"
						className={classes.messageBtn}
						aria-label={`Message ${user?.name || 'user'}`}
						onClick={() => userId && onMessage?.(userId)}
					>
						<Messenger fill="#fff" />
					</button>
				</div>
			</div>
		)
	}

	const renderSkeleton = () => (
		<div className={classes.skeletonList}>
			{Array.from({ length: 5 }).map((_, index) => (
				<div key={index} className={classes.skeletonItem}>
					<Skeleton.Avatar active size={48} />
					<div className={classes.skeletonLines}>
						<Skeleton.Input active size="small" style={{ width: 140 }} />
						<Skeleton.Input active size="small" style={{ width: 80 }} />
					</div>
				</div>
			))}
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
					width: 420,
					maxWidth: 'calc(100vw - 32px)',
					padding: 0,
					borderRadius: 24,
					overflow: 'hidden',
					boxShadow: '-2px 0 12px 0 rgba(0, 13, 25, 0.1)',
				},
				body: {
					padding: 0,
				},
			}}
		>
			<div className={classes.wrapper}>
				<div className={classes.header}>
					<div className={classes.headerTitleRow}>
						<h2 className={classes.title}>People plan to join</h2>
						<button
							type="button"
							className={classes.closeBtn}
							aria-label="Close"
							onClick={onClose}
						>
							<IconX size={16} />
						</button>
					</div>
					<div className={classes.divider} />
				</div>

				<div className={classes.body} onScroll={handleScroll}>
					{loading && !hasUsers ? (
						renderSkeleton()
					) : isEmpty ? (
						<div className={classes.emptyState}>No one plans to join yet</div>
					) : (
						<>
							<div className={classes.list}>{users.map(renderUser)}</div>
							{loading && hasUsers && (
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

export default memo(TalkRoomPeoplePlanJoinModal)
