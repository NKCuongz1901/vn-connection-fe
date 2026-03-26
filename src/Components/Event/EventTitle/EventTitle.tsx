import {
	IconChevronRight,
	IconSquareRoundedPlusFilled,
} from '@tabler/icons-react'
import { Flex } from 'antd'
import { memo } from 'react'

import { formatNumberString } from '@/ultis/string'

import classes from './EventTitle.module.scss'
import CButtonCreate from '@/Components/Custom/CButtonCreate'

interface EventTitleProps {
	label: string
	number?: number | null | undefined
	icon: any
	endIcon?: any
	labelCreateBtn?: string
	onClick?: any
	onAddNew?: any
	hiddenAdd?: boolean
	hiddenNumber?: boolean
	[key: string]: any
}
const EventTitle = ({
	label,
	number,
	labelCreateBtn,
	icon,
	endIcon,
	hiddenAdd = false,
	hiddenNumber = false,
	onClick,
	onAddNew,
}: EventTitleProps) => {
	return (
		<div className={classes.wrapper}>
			<Flex className={classes.container}>
				<Flex className={classes.startIcon}>{icon}</Flex>
				<Flex className={classes.middle}>
					<span className={classes.label}>{label}</span>
					{!hiddenNumber && (
						<Flex className={classes.number}>
							{formatNumberString(String(number))}
						</Flex>
					)}
					<Flex className={classes.arrowIcon} onClick={onClick}>
						{endIcon || <IconChevronRight />}
					</Flex>
				</Flex>
				{!hiddenAdd &&
					(labelCreateBtn ? (
						<CButtonCreate isIcon onClick={onAddNew}>
							{labelCreateBtn}
						</CButtonCreate>
					) : (
						<Flex className={classes.buttonAdd} onClick={onAddNew}>
							<IconSquareRoundedPlusFilled />
						</Flex>
					))}
			</Flex>
		</div>
	)
}

export default memo(EventTitle)
