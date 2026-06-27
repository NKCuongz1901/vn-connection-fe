'use client'

import { IconCheck } from '@tabler/icons-react'
import clsx from 'clsx'
import { memo } from 'react'

import type { BookingSlotsData } from '@/apis/talkRoomApis'
import CSwitch from '@/Components/Custom/CSwitch'
import CScheduleTimePicker from '@/Components/Custom/CScheduleTimePicker'
import {
	getScheduleEndTime,
	type ScheduleDayOption,
} from '@/ultis/talkRoomSchedule'

import classes from './ScheduleThisRoom.module.scss'

const SCHEDULE_DAILY_SUMMARY = '50 rooms out of 100 schedulable per day'

export type ScheduleDayState = {
	checked: boolean
	fromTime: string | null
}

export type ScheduleThisRoomProps = {
	enabled: boolean
	loading?: boolean
	readOnly?: boolean
	dayOptions: ScheduleDayOption[]
	bookingSlotsByDay: Record<string, BookingSlotsData>
	scheduleByDay: Record<string, ScheduleDayState>
	onToggleEnabled: (enabled: boolean) => void
	onToggleDay: (key: string) => void
	onChangeFromTime: (key: string, fromTime: string) => void
}

function ScheduleThisRoom({
	enabled,
	loading,
	readOnly = false,
	dayOptions,
	bookingSlotsByDay,
	scheduleByDay,
	onToggleEnabled,
	onToggleDay,
	onChangeFromTime,
}: ScheduleThisRoomProps) {
	const showDateList = enabled || readOnly

	return (
		<div
			className={clsx(classes.scheduleSection, {
				[classes.readOnly]: readOnly,
			})}
		>
			<div className={classes.divider} />

			<div className={classes.scheduleHeader}>
				<div className={classes.scheduleHeaderText}>
					<h3 className={classes.scheduleTitle}>Schedule this room</h3>
					<p className={classes.scheduleSubtitle}>{SCHEDULE_DAILY_SUMMARY}</p>
				</div>
				<CSwitch
					ctype="success"
					checked={enabled}
					disabled={readOnly}
					onChange={(checked) => onToggleEnabled(checked)}
				/>
			</div>

			{showDateList && (
				<div className={classes.dateList}>
					{dayOptions.map((day) => {
						const slots = bookingSlotsByDay[day.key]
						const state = scheduleByDay[day.key] ?? {
							checked: false,
							fromTime: null,
						}
						const isFull = readOnly ? false : (slots?.isFull ?? false)
						const isActive = readOnly
							? state.checked
							: state.checked && !isFull
						const fromTimeValue = isActive ? state.fromTime : null
						const toTimeValue =
							isActive && state.fromTime
								? getScheduleEndTime(day.date, state.fromTime).format('HH:mm')
								: null

						return (
							<div key={day.key} className={classes.dateRow}>
								<div className={classes.dateInfo}>
									<div className={classes.checkboxWrap}>
										<button
											type="button"
											className={clsx(classes.checkbox, {
												[classes.checkboxChecked]: isActive,
											})}
											disabled={readOnly || isFull || loading}
											onClick={() => onToggleDay(day.key)}
										>
											{isActive && (
												<IconCheck size={14} color="#fff" stroke={3} />
											)}
										</button>
									</div>
									<div className={classes.dateTexts}>
										<span className={classes.dateLabel}>{day.label}</span>
										<span className={classes.dateHint}>
											{readOnly && isActive
												? 'Scheduled'
												: slots?.availabilityText ??
													(loading ? 'Loading...' : '')}
										</span>
									</div>
								</div>

								<div className={classes.timeSection}>
									<div className={classes.timeGroup}>
										<span className={classes.timeLabel}>From:</span>
										<CScheduleTimePicker
											value={fromTimeValue}
											disabled={readOnly || !isActive || loading}
											onChange={(value) => onChangeFromTime(day.key, value)}
										/>
									</div>

									<div className={classes.timeGroup}>
										<span className={classes.timeLabel}>To:</span>
										<CScheduleTimePicker
											value={toTimeValue}
											readOnly
											disabled={readOnly || !isActive}
										/>
									</div>
								</div>
							</div>
						)
					})}
				</div>
			)}
		</div>
	)
}

export default memo(ScheduleThisRoom)
