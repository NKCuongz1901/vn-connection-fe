import dayjs, { Dayjs } from 'dayjs'

export const TALK_ROOM_DURATION_MINUTES = 20
export const SCHEDULE_DAY_COUNT = 4

export type ScheduleDayOption = {
	key: string
	date: Dayjs
	label: string
	scheduleAtParam: string
}

export const buildScheduleDayOptions = (): ScheduleDayOption[] => {
	const today = dayjs().startOf('day')

	return Array.from({ length: SCHEDULE_DAY_COUNT }, (_, offset) => {
		const date = today.add(offset, 'day')
		let label = date.format('DD/MM')

		if (offset === 0) label = 'Today'
		if (offset === 1) label = 'Tomorrow'

		return {
			key: date.format('YYYY-MM-DD'),
			date,
			label,
			scheduleAtParam: date.startOf('day').toISOString(),
		}
	})
}

export const formatScheduleTimeDisplay = (time?: string | Dayjs | null) => {
	if (!time) return '00:00'

	if (typeof time === 'string') {
		const parsed = dayjs(time, ['HH:mm', 'hh:mmA', 'h:mmA'], true)
		return parsed.isValid() ? parsed.format('hh:mmA').toUpperCase() : '00:00'
	}

	return time.isValid() ? time.format('hh:mmA').toUpperCase() : '00:00'
}

export const getScheduleEndTime = (date: Dayjs, fromTime: string) => {
	const from = dayjs(`${date.format('YYYY-MM-DD')} ${fromTime}`, 'YYYY-MM-DD HH:mm')
	return from.add(TALK_ROOM_DURATION_MINUTES, 'minute')
}

export const buildScheduleAtIso = (date: Dayjs, fromTime: string) => {
	const [hours, minutes] = fromTime.split(':').map(Number)
	return date.hour(hours).minute(minutes).second(0).millisecond(0).toISOString()
}

export const generateDefaultTimeSlots = () => {
	const slots: string[] = []
	for (let hour = 6; hour < 24; hour += 1) {
		for (let minute = 0; minute < 60; minute += TALK_ROOM_DURATION_MINUTES) {
			slots.push(
				`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
			)
		}
	}
	return slots
}

export const mergeBookingTimeSlots = (timeSlots: string[]) => {
	if (timeSlots.length > 0) return timeSlots
	return generateDefaultTimeSlots()
}
