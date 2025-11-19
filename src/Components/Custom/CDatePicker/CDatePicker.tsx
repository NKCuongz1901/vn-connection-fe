'use client'

import { IconChevronDown } from '@tabler/icons-react'
import { DatePicker, DatePickerProps, Flex } from 'antd'
import { memo } from 'react'

import CalenderIcon from '@/svg/CalenderIcon'
import classes from './CDatePicker.module.scss'
interface CDatePickerOthersProps {
	label?: string
	error?: string
	isRequired?: boolean
}
interface CDatePickerProps extends CDatePickerOthersProps, DatePickerProps {}
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
				prefix={<CalenderIcon fill="#7987A4" />}
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

export default memo(CDatePicker) as React.FC<CDatePickerProps>
