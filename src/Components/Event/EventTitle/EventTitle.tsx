import {
	IconChevronRight,
	IconSquareRoundedPlusFilled,
} from '@tabler/icons-react'
import { Flex } from 'antd'
import { memo } from 'react'

import { formatNumberString } from '@/ultis/string.ults'

import classes from './EventTitle.module.scss'

interface EventTitleProps {
	label: string
	number: number | null | undefined
	icon: any
	onClick?: any
	onAddNew?: any
	hiddenAdd?: boolean
	[key: string]: any
}
const EventTitle = ({
	label,
	number,
	icon,
	hiddenAdd = false,
	onClick,
	onAddNew,
}: EventTitleProps) => {
	return (
		<div className={classes.wrapper}>
			<Flex className={classes.container}>
				<Flex className={classes.startIcon}>{icon}</Flex>
				<Flex className={classes.middle}>
					<span className={classes.label}>{label}</span>
					<Flex className={classes.number}>
						{formatNumberString(String(number))}
					</Flex>
					<Flex className={classes.arrowIcon} onClick={onClick}>
						<IconChevronRight />
					</Flex>
				</Flex>
				{!hiddenAdd && (
					<Flex className={classes.buttonAdd} onClick={onAddNew}>
						<IconSquareRoundedPlusFilled />
					</Flex>
				)}
			</Flex>
		</div>
	)
}

export default memo(EventTitle)
