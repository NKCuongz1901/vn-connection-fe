import dayjs from 'dayjs'

interface getDateInfoOptionsProps {
	type?: string
	format?: string
}
export const getDateInfo = (
	date: string | Date | number,
	_options?: getDateInfoOptionsProps,
) => {
	let parsedDate: dayjs.ConfigType = date

	if (typeof date === 'string') {
		const asNumber = Number(date)
		if (!Number.isNaN(asNumber)) {
			parsedDate = asNumber
		}
	}

	const d = parsedDate ? dayjs(parsedDate) : dayjs()
	return {
		day: d.date(), // số ngày trong tháng
		weekday: d.format('ddd'), // Thứ bằng tiếng Anh
		month: d.format('MMM'), // tháng (0-based)
		time: d.format('HH:mm'),
		time12h: d.format('hh:mm A'),
		dmy: d.format('DD/MM/YYYY'),
	}
}
export const getDateFormat = (
	date: string | Date | number,
	_options?: getDateInfoOptionsProps,
) => {
	const { format } = _options || {}
	let parsedDate: dayjs.ConfigType = date

	if (typeof date === 'string') {
		const asNumber = Number(date)
		if (!Number.isNaN(asNumber)) {
			parsedDate = asNumber
		}
	}

	const d = parsedDate ? dayjs(parsedDate) : dayjs()
	if (format) {
		return d.format(format)
	}
	return d.date() // số ngày trong tháng
}

export const getDiffFromNow = ({
	input,
}: {
	input: dayjs.ConfigType
}): { value: number | string; unit?: string } => {
	const now = dayjs()
	const target = dayjs(input)
	const diffInSeconds = now.diff(target, 'second', true)
	if (diffInSeconds < 60) {
		return { value: 'a few', unit: 'second' }
	}

	const diffInMinutes = diffInSeconds / 60
	if (diffInMinutes < 60) {
		return { value: Math.floor(diffInMinutes), unit: 'minute' }
	}

	const diffInHours = diffInMinutes / 60
	if (diffInHours < 24) {
		return { value: Math.floor(diffInHours), unit: 'hour' }
	}

	if (diffInHours < 24 * 4) {
		const diffInDays = diffInHours / 24
		return { value: Math.floor(diffInDays), unit: 'day' }
	}

	// const diffInDays = diffInHours / 24
	return { value: target.format('DD/MM/YY'), unit: '' }
}

export const getAge = (dateString: string) => {
	if (!dateString) return ''
	return dayjs().diff(dayjs(dateString), 'year')
}

export const parseDayFromIsNewDate = (created) => {
	if (!created) return ''

	const d = dayjs(created)

	if (d.isSame(dayjs(), 'day')) {
		return `Today, ${d.format('HH:mm')}`
	}

	return d.format('MMMM, DD YYYY HH:mm')
}

export const formatLastOnlineShort = (ts?: string | number | null): string => {
	if (ts === undefined || ts === null || ts === '') return ''
	const target = dayjs(typeof ts === 'string' ? Number(ts) : ts)
	if (!target.isValid()) return ''

	const now = dayjs()
	const sec = now.diff(target, 'second')
	if (sec < 60) return '1 min'

	const min = now.diff(target, 'minute')
	if (min < 60) return min === 1 ? '1 min' : `${min} mins`

	const hr = now.diff(target, 'hour')
	if (hr < 24) return hr === 1 ? '1 hr' : `${hr} hrs`

	const days = now.diff(target, 'day')
	if (days > 30) return ''
	if (days < 1) return '1 day'
	return days === 1 ? '1 day' : `${days} days`
}

export const isSameDay = (start_time: string, end_time: string) =>
	dayjs(Number(start_time)).isSame(dayjs(Number(end_time)), 'day')
