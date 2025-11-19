'use client'

import { ArrowRightOutlined } from '@ant-design/icons'
import { IconCalendarWeekFilled, IconChevronDown } from '@tabler/icons-react'
import { DatePicker, Flex } from 'antd'
import { RangePickerProps } from 'antd/es/date-picker'
import dayjs from 'dayjs'
import { memo, ReactNode, useState } from 'react'

import CButton from '../CButton'
import classes from './CDatePickerRanger.module.scss'
import clsx from 'clsx'

const { RangePicker } = DatePicker

interface CDatePickerOthersProps {
	label?: string
	error?: string
	isRequired?: boolean
	isWhite?: boolean
	customRanger?: ReactNode
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
	const {
		error,
		label,
		isWhite,
		isRequired,
		style,
		value,
		customRanger,
		...props
	} = _props
	const status = error ? 'error' : ''

	const [open, setOpen] = useState(false)

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
		if (!onChange) return

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
			default:
				onChange(null, ['', ''])
				break
		}
	}

	return (
		<Flex
			vertical
			gap={4}
			className={clsx(classes.layout, {
				[classes.layoutWhite]: isWhite,
			})}
			style={{ position: 'relative' }} // important: để picker absolute chồng lên
		>
			{label && (
				<span>
					{label} {isRequired && <span className="error">*</span>}
				</span>
			)}

			{/* visible custom UI */}
			{customRanger && (
				<div
					onClick={() => setOpen(true)} // mở picker khi click vào customRanger
					style={{ display: 'inline-block', width: '100%', cursor: 'pointer' }}
				>
					{customRanger}
				</div>
			)}

			{/* Invisible but interactive RangePicker stacked on top */}
			<div
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					pointerEvents: 'none',
				}}
			>
				{/* wrapper để điều khiển pointerEvents riêng cho input vùng */}
				<div style={{ width: '100%', height: '100%', pointerEvents: 'auto' }}>
					<RangePicker
						allowClear
						open={open}
						onOpenChange={(o) => setOpen(o)}
						{...(value && { value })}
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
							// make it invisible but still interactive
							opacity: 0,
							position: 'relative',
							width: '100%',
							height: '100%',
							borderRadius: 16,
							background: 'transparent',
							...style,
						}}
						status={status}
						{...props}
					/>
				</div>
			</div>

			{error && <span className="error">{error}</span>}
		</Flex>
	)
}

export default memo(CDatePickerRanger) as React.FC<CDatePickerRangerProps>
