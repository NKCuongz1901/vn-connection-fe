'use client'

import { Popover } from 'antd'
import clsx from 'clsx'
import { memo, useMemo, useState } from 'react'

import { formatScheduleTimeDisplay } from '@/ultis/talkRoomSchedule'

import classes from './CTimeSlotSelect.module.scss'

export type CTimeSlotSelectProps = {
	value?: string | null
	options?: string[]
	disabled?: boolean
	readOnly?: boolean
	placeholder?: string
	onChange?: (value: string) => void
}

const CTimeSlotSelect = ({
	value,
	options = [],
	disabled,
	readOnly,
	placeholder = '00:00',
	onChange,
}: CTimeSlotSelectProps) => {
	const [open, setOpen] = useState(false)
	const isInactive = disabled || readOnly

	const displayText = useMemo(() => {
		if (!value) return placeholder
		return formatScheduleTimeDisplay(value)
	}, [placeholder, value])

	const panelContent = (
		<div className={classes.panel}>
			{options.map((item) => (
				<div
					key={item}
					className={clsx(classes.option, {
						[classes.optionActive]: value === item,
					})}
					onClick={() => {
						onChange?.(item)
						setOpen(false)
					}}
				>
					{formatScheduleTimeDisplay(item)}
				</div>
			))}
		</div>
	)

	if (isInactive) {
		return (
			<div
				className={clsx(classes.wrapper, {
					[classes.readonly]: readOnly,
					[classes.inactive]: disabled && !readOnly,
				})}
			>
				<span
					className={clsx(classes.value, {
						[classes.placeholder]: !value,
					})}
				>
					{displayText}
				</span>
			</div>
		)
	}

	return (
		<Popover
			trigger="click"
			placement="bottom"
			open={open}
			onOpenChange={setOpen}
			overlayClassName={classes.popover}
			arrow={false}
			content={panelContent}
		>
			<div className={classes.wrapper}>
				<span
					className={clsx(classes.value, {
						[classes.placeholder]: !value,
					})}
				>
					{displayText}
				</span>
			</div>
		</Popover>
	)
}

export default memo(CTimeSlotSelect)
