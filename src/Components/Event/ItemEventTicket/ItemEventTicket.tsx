import { IconChevronRight } from '@tabler/icons-react'
import { Flex } from 'antd'
import { memo } from 'react'

import { getDateInfo } from '@/ultis/date'
import { useLocalePath } from '@/ultis/route'

import BreakLineEvent from '@/svg/Event/BreakLineEvent'
import MapIcon from '@/svg/MapIcon'

import classes from './ItemEventTicket.module.scss'

const ItemEventTicket = ({ data, type }) => {
	const { onChangeRoute } = useLocalePath()
	const { id, start_time, end_time, title, away } = data
	const {
		day,
		weekday,
		month,
		time12h: _start_time,
	} = getDateInfo(Number(start_time))
	const { time12h: _end_time } = getDateInfo(Number(end_time))
	return (
		<Flex
			vertical
			className={classes.wrapper}
			onClick={() => onChangeRoute(`${type}/${id}`)}
		>
			<Flex className={classes.container}>
				<Flex className={classes.time} vertical>
					<span>{weekday}</span>
					<span className={classes.day}>{day}</span>
					<span>{month}</span>
				</Flex>
				<BreakLineEvent />
				<Flex className={classes.info} vertical>
					<div className={classes.timeInfo}>
						{_start_time} - {_end_time}
					</div>
					<div className={classes.titleInfo}>{title}</div>
					<Flex className={classes.locationInfo}>
						<Flex className={classes.away}>
							<MapIcon />
							<span>{away} km away</span>
						</Flex>
						<Flex className={classes.textDetail}>
							Detail
							<IconChevronRight className={classes.icon} />
						</Flex>
					</Flex>
				</Flex>
			</Flex>
		</Flex>
	)
}

export default memo(ItemEventTicket)
