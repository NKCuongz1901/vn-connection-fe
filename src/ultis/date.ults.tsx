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
	}
}
