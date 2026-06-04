'use client'

import {
	IconCalendarWeekFilled,
	IconChevronLeft,
	IconClockFilled,
	IconMapPinFilled,
	IconShare3,
} from '@tabler/icons-react'
import { Flex, Skeleton } from 'antd'
import { memo } from 'react'

import CAvatar from '@/Components/Custom/CAvatar'
import CButton from '@/Components/Custom/CButton'
import CImage from '@/Components/Custom/CImage'
import { useModal } from '@/context/ModalContext'
import usePublicDetailEvent from '@/hooks/Event/usePublicDetailEvent'
import { mainRoutes } from '@/routes/MainRoutes'
import { isArray } from '@/ultis/array'
import { getDateInfo, isSameDay } from '@/ultis/date'
import { isEmptyObject } from '@/ultis/object'
import { useLocalePath, useSafeBack } from '@/ultis/route'
import { copyToClipboard } from '@/ultis/string'
import GroupPeopleIcon from '@/svg/Event/GroupPeopleIcon'

import classes from './PublicDetailEvent.module.scss'
import { TYPE_SIZE_IMAGE } from '@/Variable/image.variable'

const skeletonItems = [
	{ id: '2', value: 333 },
	{ id: '1', value: 250 },
	{ id: '3', value: 100 },
]

interface PublicDetailEventProps {
	id: string
}

const PublicDetailEvent = ({ id: _id }: PublicDetailEventProps) => {
	const { openSuccess } = useModal()
	const { onChangeRoute } = useLocalePath()
	const { goBackOrPush } = useSafeBack()
	const { detailPost, loading } = usePublicDetailEvent({ id: _id })
	const { detailLoad } = loading

	const handleCopyLink = () => {
		const link = detailPost?.share_link || window.location.href
		copyToClipboard(link, {
			callback: openSuccess({ message: 'Link copied successfully!' }),
		})
	}

	const _renderSkeleton = () => (
		<Flex className={classes.container} vertical>
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

	const _renderAction = () => (
		<Flex className={classes.action}>
			<Flex
				className={classes.icon}
				onClick={() => goBackOrPush(mainRoutes.login)}
			>
				<IconChevronLeft />
			</Flex>
		</Flex>
	)

	const _renderInfo = () => {
		const { title, categories, amount_of_participant } = detailPost || {}
		return (
			<Flex className={classes.info} vertical>
				<Flex className={classes.title}>
					<Flex className={classes.titleInfo} vertical>
						<div className={classes.titleLabel}>{title}</div>
						{isArray(categories, 1) && (
							<Flex className={classes.categories}>
								{(categories || []).map((item: string) => (
									<div key={item} className={classes.category}>
										{item}
									</div>
								))}
							</Flex>
						)}
					</Flex>
					<Flex className={classes.btn}>
						<CButton
							ctype="success"
							icon={<IconShare3 />}
							onClick={handleCopyLink}
						>
							Copy link
						</CButton>
						<CButton
							ctype="oranger"
							onClick={() => onChangeRoute(mainRoutes.login)}
						>
							Log in to join
						</CButton>
					</Flex>
				</Flex>
				{amount_of_participant > 0 && (
					<Flex className={classes.participantCount} align="center" gap={4}>
						<GroupPeopleIcon fill="#006B35" />
						<span>{amount_of_participant} interested</span>
					</Flex>
				)}
			</Flex>
		)
	}

	const _renderTop = () => {
		const { thumbnails } = detailPost || {}
		return (
			<Flex className={classes.top} vertical>
				{_renderAction()}
				<Flex className={classes.image}>
					<CImage
						sizeType={TYPE_SIZE_IMAGE.large}
						preview
						src={thumbnails?.[0] || ''}
					/>
				</Flex>
				{_renderInfo()}
			</Flex>
		)
	}

	const _renderHost = () => {
		const { user } = detailPost || {}
		const { avatar, name, is_verified } = user || {}
		if (!name) return null
		return (
			<Flex className={classes.hostBy} align="center" gap={12}>
				<Flex align="center" gap={8}>
					<CAvatar src={avatar} size={40} />
					<Flex vertical gap={2}>
						<span className={classes.hostLabel}>Hosted by</span>
						<span className={classes.hostName}>
							{name}
							{is_verified ? ' ✓' : ''}
						</span>
					</Flex>
				</Flex>
			</Flex>
		)
	}

	const _renderDetail = () => {
		const { start_time, end_time, address } = detailPost || {}
		if (!start_time || !end_time) return null

		const {
			dmy: dmyStart,
			weekday: weekdayStart,
			time: timeStart,
		} = getDateInfo(Number(start_time))
		const {
			dmy: dmyEnd,
			weekday: weekdayEnd,
			time: timeEnd,
		} = getDateInfo(Number(end_time))
		const sameDay = isSameDay(start_time, end_time)
		const dateLabel = sameDay
			? `${weekdayStart}, ${dmyStart}`
			: `${weekdayStart}, ${dmyStart} - ${weekdayEnd}, ${dmyEnd}`

		return (
			<Flex className={classes.detail} vertical>
				{_renderHost()}
				<Flex className={classes.detailInfo} vertical>
					<Flex className={classes.detailInfoItem}>
						<IconCalendarWeekFilled />
						<span>{dateLabel}</span>
					</Flex>
					{address && (
						<Flex className={classes.detailInfoItem}>
							<IconMapPinFilled />
							<span>{address}</span>
						</Flex>
					)}
					<Flex className={classes.detailInfoItem}>
						<IconClockFilled />
						<span>
							{timeStart} - {timeEnd}
						</span>
					</Flex>
				</Flex>
			</Flex>
		)
	}

	const _renderDesc = () => {
		const { description } = detailPost || {}
		if (!description) return null
		return (
			<Flex className={classes.desc} vertical>
				<div className={classes.title}>Details</div>
				<div>{description}</div>
			</Flex>
		)
	}

	return (
		<div className={classes.wrapper}>
			{detailLoad && isEmptyObject(detailPost) ? (
				_renderSkeleton()
			) : !isEmptyObject(detailPost) ? (
				<Flex className={classes.container} vertical>
					{_renderTop()}
					{_renderDetail()}
					{_renderDesc()}
				</Flex>
			) : (
				<Flex className={classes.noData}>Post does not exist</Flex>
			)}
		</div>
	)
}

export default memo(PublicDetailEvent)
