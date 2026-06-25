'use client'

import { IconCheck } from '@tabler/icons-react'
import clsx from 'clsx'
import { memo } from 'react'

import type { BookingSlotsData } from '@/apis/talkRoomApis'
import CSwitch from '@/Components/Custom/CSwitch'
import CTimeSlotSelect from '@/Components/Custom/CTimeSlotSelect'
import {
	getScheduleEndTime,
	mergeBookingTimeSlots,
	type ScheduleDayOption,
} from '@/ultis/talkRoomSchedule'

import classes from './ScheduleThisRoom.module.scss'

const SCHEDULE_DAILY_SUMMARY = '50 rooms out of 50'

export type ScheduleDayState = {
	checked: boolean
	fromTime: string | null
}

export type ScheduleThisRoomProps = {
	enabled: boolean
	loading?: boolean
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
	dayOptions,
	bookingSlotsByDay,
	scheduleByDay,
	onToggleEnabled,
	onToggleDay,
	onChangeFromTime,
}: ScheduleThisRoomProps) {
	return (
		<div className={classes.scheduleSection}>
			<div className={classes.divider} />

			<div className={classes.scheduleHeader}>
				<div className={classes.scheduleHeaderText}>
					<h3 className={classes.scheduleTitle}>Schedule this room</h3>
					<p className={classes.scheduleSubtitle}>{SCHEDULE_DAILY_SUMMARY}</p>
				</div>
				<CSwitch
					ctype="success"
					checked={enabled}
					onChange={(checked) => onToggleEnabled(checked)}
				/>
			</div>

			{enabled && (
				<div className={classes.dateList}>
					{dayOptions.map((day) => {
						const slots = bookingSlotsByDay[day.key]
						const state = scheduleByDay[day.key] ?? {
							checked: false,
							fromTime: null,
						}
						const isFull = slots?.isFull ?? false
						const isActive = state.checked && !isFull
						const timeOptions = mergeBookingTimeSlots(slots?.timeSlots ?? [])
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
											disabled={isFull || loading}
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
											{slots?.availabilityText ??
												(loading ? 'Loading...' : '')}
										</span>
									</div>
								</div>

								<div className={classes.timeSection}>
									<div className={classes.timeGroup}>
										<span className={classes.timeLabel}>From:</span>
										<CTimeSlotSelect
											value={fromTimeValue}
											options={timeOptions}
											disabled={!isActive || loading}
											onChange={(value) => onChangeFromTime(day.key, value)}
										/>
									</div>

									<div className={classes.timeGroup}>
										<span className={classes.timeLabel}>To:</span>
										<CTimeSlotSelect
											value={toTimeValue}
											readOnly
											disabled={!isActive}
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
