/**
 * Course slot times arrive as UTC wall-clock "HH:mm" strings. Like the app
 * (course_slot_time.dart), they are placed on today's UTC date and shown in the
 * viewer's own time zone.
 */

const pad = (value: number) => String(value).padStart(2, '0')

/** Parses a UTC "HH:mm" to a local Date on the reference day, or null. */
export const parseUtcHmToLocal = (
	hm?: string | null,
	referenceDate: Date = new Date(),
): Date | null => {
	if (!hm) return null
	const [hourText, minuteText] = hm.split(':')
	if (minuteText === undefined) return null
	const hour = Number(hourText)
	const minute = Number(minuteText)
	if (!Number.isInteger(hour) || !Number.isInteger(minute)) return null
	return new Date(
		Date.UTC(
			referenceDate.getUTCFullYear(),
			referenceDate.getUTCMonth(),
			referenceDate.getUTCDate(),
			hour,
			minute,
		),
	)
}

/** Formats a Date as local "HH:mm". */
export const formatLocalHm = (date: Date) =>
	`${pad(date.getHours())}:${pad(date.getMinutes())}`

/** A UTC "HH:mm" range as local "HH:mm - HH:mm", or '' when neither parses. */
export const formatUtcHmRange = (
	startHm?: string | null,
	endHm?: string | null,
	referenceDate: Date = new Date(),
) => {
	const start = parseUtcHmToLocal(startHm, referenceDate)
	const end = parseUtcHmToLocal(endHm, referenceDate)
	if (!start && !end) return ''
	return `${start ? formatLocalHm(start) : ''} - ${end ? formatLocalHm(end) : ''}`
}
