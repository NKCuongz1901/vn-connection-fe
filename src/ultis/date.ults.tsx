import dayjs from 'dayjs'

interface getDateInfoOptionsProps {
	type?: string
}
export const getDateInfo = (
	date: string | Date,
	_options?: getDateInfoOptionsProps,
) => {
	const d = date ? dayjs(date) : dayjs()
	return {
		day: d.date(), // số ngày trong tháng
		weekday: d.format('ddd'), // Thứ bằng tiếng Anh
		month: d.format('MMM'), // tháng (0-based)
		time: d.format('HH:mm'),
		time12h: d.format('hh:mm A'),
		dmy: d.format('DD/MM/YYYY'),
	}
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
		return { value: Math.ceil(diffInSeconds), unit: 'second' }
	}

	const diffInMinutes = diffInSeconds / 60
	if (diffInMinutes < 60) {
		return { value: Math.ceil(diffInMinutes), unit: 'minute' }
	}

	const diffInHours = diffInMinutes / 60
	if (diffInHours < 24) {
		return { value: Math.ceil(diffInHours), unit: 'hour' }
	}

	// const diffInDays = diffInHours / 24
	return { value: target.format('DD/MM/YY'), unit: '' }
}

export const getAge = (dateString: string) => {
	if (!dateString) return ''
	return dayjs().diff(dayjs(dateString), 'year')
}
