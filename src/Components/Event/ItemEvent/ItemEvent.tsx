import { IconClockFilled, IconMap, IconRepeat } from '@tabler/icons-react'
import { Flex } from 'antd'
import { memo } from 'react'

import { getDateInfo } from '@/ultis/date.ults'
import { useLocalePath } from '@/ultis/route.ults'
import { formatNumberString } from '@/ultis/string.ults'

import CImage from '@/Components/Custom/CImage'

import { repeatOpt, ticketEntranceType } from '@/Variable/select.variable'
import { mainRoutes } from '@/routes/MainRoutes'

import classes from './ItemEvent.module.scss'

const ItemEvent = ({ data, type }) => {
	const { onChangeRoute } = useLocalePath()
	const { id, thumbnails, start_time, end_time } = data
	const { day, weekday, month, time: _start_time } = getDateInfo(start_time)
	const { time: _end_time } = getDateInfo(end_time)

	const _renderSpaceTime = () => {
		const { away, repeat_type } = data
		const { type } = repeat_type || {}
		return (
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
			</Flex>
			{_renderSpaceTime()}
			{_renderInfo()}
		</Flex>
	)
}

export default memo(ItemEvent)
