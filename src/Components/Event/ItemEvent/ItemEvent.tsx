import { IconClockFilled, IconMap, IconRepeat } from '@tabler/icons-react'
import { Flex } from 'antd'
import { memo } from 'react'

import { getDateInfo } from '@/ultis/date'
import { useLocalePath } from '@/ultis/route'
import { formatNumberString } from '@/ultis/string'

import CImage from '@/Components/Custom/CImage'
import GroupIcon from '@/svg/GroupIcon'

import { repeatOpt, ticketEntranceType } from '@/Variable/select.variable'

import classes from './ItemEvent.module.scss'

const ItemEvent = ({ data, type }) => {
	const { onChangeRoute } = useLocalePath()
	const { id, thumbnails, start_time, end_time, expect_participant } = data
	const { time: _start_time } = getDateInfo(Number(start_time))
	const { time: _end_time } = getDateInfo(Number(end_time))
	const handleShowTime = () => {
		const currentTime = +new Date()
		let timeShow
		switch (true) {
			case Number(start_time) > currentTime:
				timeShow = Number(start_time)
				break
			case currentTime > Number(end_time):
				timeShow = Number(end_time)
				break
			default:
				timeShow = currentTime
				break
		}
		const { day, weekday, month } = getDateInfo(timeShow)
		return {
			day,
			weekday,
			month,
		}
	}
	const _renderSpaceTime = () => {
		const { away, repeat_type } = data
		const { type } = repeat_type || {}
		return (
			<div className={classes.spaceTimeWrap}>
				<Flex className={classes.spaceTime}>
					<Flex className={classes.time}>
						<IconClockFilled className={classes.iconClock} />
						<span>{_start_time}</span>
						<span>-</span>
						<span>{_end_time}</span>
					</Flex>
					<Flex className={classes.spaceTimeRight}>
						{type !== repeatOpt[0].value && (
							<Flex className={classes.iconRepeatWrapper}>
								<IconRepeat className={classes.iconRepeat} />
							</Flex>
						)}
						<Flex className={classes.away}>
							<IconMap className={classes.iconMap} />
							<span>{away} km away</span>
						</Flex>
					</Flex>
				</Flex>
			</div>
		)
	}

	const _renderInfo = () => {
		const { address, title, ticket_entrance, ticket_entrance_type } = data
		let ticketValue = ''
		const [minEntr, maxEntr] = (ticket_entrance || '').split(':')
		switch (ticket_entrance_type) {
			case ticketEntranceType.ONLY:
				ticketValue = formatNumberString(minEntr) + 'đ'
				break
			case ticketEntranceType.MULTIPLE_TICKET:
				ticketValue = `${formatNumberString(minEntr)} - ${formatNumberString(
					maxEntr,
				)} đ`
				break
			case ticketEntranceType.FREE:
			default:
				ticketValue = 'Free'
				break
		}
		const { weekday, day, month } = handleShowTime()
		return (
			<Flex className={classes.info}>
				<Flex className={classes.infoLeft} vertical>
					<span>{weekday}</span>
					<span className={classes.day}>{day}</span>
					<span>{month}</span>
				</Flex>
				<Flex className={classes.infoRight} vertical>
					<span className={classes.title}>{title}</span>
					<span className={classes.address}>{address}</span>
					<span className={classes.ticketType}>{ticketValue}</span>
				</Flex>
			</Flex>
		)
	}
	const _renderCategory = () => {
		const { categories } = data
		return (
			<Flex className={classes.categories}>
				{(categories || []).map((i) => (
					<div key={i} className={classes.category}>
						{i}
					</div>
				))}
			</Flex>
		)
	}
	return (
		<Flex
			className={classes.wrapper}
			vertical
			onClick={() => onChangeRoute(`${type}/${id}`)}
		>
			<Flex className={classes.image}>
				<CImage
					src={thumbnails[0] || '/images/defaultThumbnail.png'}
					preview={false}
				/>
				{!!expect_participant && (
					<Flex className={classes.expectParticipant}>
						<GroupIcon />
						<div>Joining: {formatNumberString(expect_participant)}</div>
					</Flex>
				)}
			</Flex>
			{_renderSpaceTime()}
			{_renderInfo()}
			{_renderCategory()}
		</Flex>
	)
}

export default memo(ItemEvent)
