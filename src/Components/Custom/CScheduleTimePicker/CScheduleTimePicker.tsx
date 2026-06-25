'use client'

import { TimePicker } from 'antd'
import clsx from 'clsx'
import dayjs, { Dayjs } from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { memo, useMemo } from 'react'

import { formatScheduleTimeDisplay } from '@/ultis/talkRoomSchedule'

import classes from './CScheduleTimePicker.module.scss'

dayjs.extend(customParseFormat)

export type CScheduleTimePickerProps = {
	value?: string | null
	disabled?: boolean
	readOnly?: boolean
	placeholder?: string
	minuteStep?: number
	onChange?: (value: string) => void
}

const parseTimeValue = (value?: string | null): Dayjs | null => {
	if (!value) return null
	const parsed = dayjs(value, 'HH:mm', true)
	return parsed.isValid() ? parsed : null
}

const CScheduleTimePicker = ({
	value,
	disabled,
	readOnly,
	placeholder = '00:00',
	minuteStep = 1,
	onChange,
}: CScheduleTimePickerProps) => {
	const timeValue = useMemo(() => parseTimeValue(value), [value])

	const displayText = useMemo(() => {
		if (!value) return placeholder
		return formatScheduleTimeDisplay(value)
	}, [placeholder, value])

	if (readOnly || disabled) {
		return (
			<div
				className={clsx(classes.readonly, {
					[classes.pickerDisabled]: disabled,
				})}
			>
				<span
					className={clsx(classes.readonlyValue, {
						[classes.readonlyPlaceholder]: !value,
					})}
				>
					{displayText}
				</span>
			</div>
		)
	}

	return (
		<TimePicker
			value={timeValue}
			format="hh:mmA"
			placeholder={placeholder}
			minuteStep={minuteStep}
			needConfirm={false}
			variant="borderless"
			allowClear={false}
			suffixIcon={null}
			className={classes.picker}
			onChange={(time) => {
				if (!time) return
				onChange?.(time.format('HH:mm'))
			}}
		/>
	)
}

export default memo(CScheduleTimePicker)
