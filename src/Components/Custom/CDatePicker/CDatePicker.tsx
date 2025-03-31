'use client'

import { IconCalendarWeekFilled, IconChevronDown } from '@tabler/icons-react'
import { DatePicker, Flex } from 'antd'
import { memo } from 'react'

import { CDatePickerProps } from '@/interface/CComponent/CComponent.interface'

import classes from './CDatePicker.module.scss'

const CDatePicker = (_props: CDatePickerProps) => {
	const { error, label, isRequired, style, ...props } = _props
	const status = error ? 'error' : ''
	return (
		<Flex vertical gap={4} className={classes.layout}>
			{label && (
				<span>
					{label} {isRequired && <span className="error">*</span>}
				</span>
			)}
			<DatePicker
				allowClear
				className={classes.wrapper}
				prefix={<IconCalendarWeekFilled />}
				suffixIcon={<IconChevronDown />}
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

export default memo(CDatePicker)
