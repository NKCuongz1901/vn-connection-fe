import axios from '../../axios'
import { BOOK_ROUTES } from '@/routes'
import {
	StreakAchievement,
	StreakCalendarData,
	StreakLeaderboardPeriod,
	StreakMission,
	StreakMissions,
	StreakProfile,
} from '@/interface/Book/streak.interface'

import { parseApiObject } from './bookApis'

const STREAK = `${BOOK_ROUTES.book}/streak`

export const getStreakProfile = async () => axios.get(STREAK)

export const parseStreakProfile = (res: unknown) =>
	parseApiObject<StreakProfile>(res)

export const getStreakMissions = async () => axios.get(`${STREAK}/missions`)

export const parseStreakMissions = (res: unknown): StreakMissions => {
	const data = res as {
		results?: {
			object?: { rows?: StreakMission[]; today_progress?: StreakAchievement | null }
		}
	}
	const object = data?.results?.object
	return {
		missions: (object?.rows || []).filter((item) => item.is_active !== false),
		today: object?.today_progress || null,
	}
}

/** Dates are YYYY-MM-DD (inclusive) */
export const getStreakCalendar = async (startDate: string, endDate: string) =>
	axios.get(`${STREAK}/achievements/calendar`, {
		params: { start_date: startDate, end_date: endDate },
	})

export const parseStreakCalendar = (res: unknown): StreakCalendarData => {
	const object = parseApiObject<{ calendar_data?: StreakCalendarData }>(res)
	return object?.calendar_data || {}
}

export const getStreakLeaderboard = async (
	period: StreakLeaderboardPeriod,
	params: { limit?: number; offset?: number } = {},
) =>
	axios.get(`${STREAK}/leaderboard`, {
		params: { period, limit: 50, offset: 0, ...params },
	})
