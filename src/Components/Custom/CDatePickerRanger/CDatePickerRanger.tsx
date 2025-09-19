'use client'

import { ArrowRightOutlined } from '@ant-design/icons'
import { IconCalendarWeekFilled, IconChevronDown } from '@tabler/icons-react'
import { DatePicker, Flex } from 'antd'
import { RangePickerProps } from 'antd/es/date-picker'
import dayjs from 'dayjs'
import { memo } from 'react'

import CButton from '../CButton'

import classes from './CDatePickerRanger.module.scss'

const { RangePicker } = DatePicker

interface CDatePickerOthersProps {
	label?: string
	error?: string
	isRequired?: boolean
}
const arr = [
	{ value: 'today', label: 'Today', active: 'isToday' },
	{ value: 'tomorrow', label: 'Tomorrow', active: 'isTomorrow' },
	{ value: 'thisweek', label: 'This Week', active: 'isThisWeek' },
	{ value: 'alldate', label: 'All dates', active: 'isAll' },
]
const mappingArr = {
	today: 'today',
	tomorrow: 'tomorrow',
	thisweek: 'thisweek',
	alldate: 'alldate',
}
interface CDatePickerRangerProps
	extends CDatePickerOthersProps,
		RangePickerProps {}
const CDatePickerRanger = (_props: CDatePickerRangerProps) => {
	const { error, label, isRequired, style, value, ...props } = _props
	const status = error ? 'error' : ''
	const today = dayjs().startOf('day')
	const tomorrow = today.add(1, 'day')
	const weekStart = today.startOf('week')
	const weekEnd = today.endOf('week')

	const isToday =
		value && value[0]?.isSame(today, 'day') && value[1]?.isSame(today, 'day')

	const isTomorrow =
		value &&
		value[0]?.isSame(tomorrow, 'day') &&
		value[1]?.isSame(tomorrow, 'day')

	const isThisWeek =
		value &&
		value[0]?.isSame(weekStart, 'day') &&
		value[1]?.isSame(weekEnd, 'day')
	const active = {
		isToday,
		isTomorrow,
		isThisWeek,
		isAll: !value,
	}
	const handleOnChange = (type: string) => {
		const { onChange } = _props
		if (onChange) {
			switch (type) {
				case mappingArr.today:
					onChange([today, today], ['', ''])
					break
				case mappingArr.tomorrow:
					onChange([tomorrow, tomorrow], ['', ''])
					break
				case mappingArr.thisweek:
					onChange([weekStart, weekEnd], ['', ''])
					break
				case mappingArr.alldate:
				default:
					onChange(null, ['', ''])
					break
			}
		}
	}
	return (
		<Flex vertical gap={4} className={classes.layout}>
			{label && (
				<span>
					{label} {isRequired && <span className="error">*</span>}
				</span>
			)}
			<RangePicker
				allowClear
				{...(value && { value: value })}
				className={classes.wrapper}
				prefix={<IconCalendarWeekFilled />}
				suffixIcon={<IconChevronDown />}
				separator={<ArrowRightOutlined style={{ fontSize: 16 }} />}
				panelRender={(panelNode) => (
					<div>
						<div className={classes.customHeaderContainer}>
							<Flex className={classes.customHeader}>
								{arr.map((item) => (
									<CButton
										key={item.value}
										ctype={active[item.active] ? 'success' : 'disabled'}
										onClick={() => handleOnChange(item.value)}
									>
										{item.label}
									</CButton>
								))}
							</Flex>
						</div>
						{panelNode}
					</div>
				)}
				style={{
					borderRadius: 16,
					background: '#f4f8fc',
					height: 44,
					...style,
				}}
				status={status}
				{...props}
			/>
			{error && <span className="error">{error}</span>}
		</Flex>
	)
}

export default memo(CDatePickerRanger) as React.FC<CDatePickerRangerProps>
