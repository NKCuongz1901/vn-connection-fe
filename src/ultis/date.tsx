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
