export type StreakProfile = {
	reader_id?: string
	current_streak?: number
	longest_streak?: number
	total_days_completed?: number
	streak_start_date?: string | null
	last_achievement_date?: string | null
	streak_goal?: number | null
	freeze_count?: number
	freeze_limit?: number
	freezes_remaining?: number
	freeze_reset_date?: string | null
	is_active?: boolean
}

export type StreakProgressTracking = {
	id?: string
	name?: string
	amount_required?: number
	amount_completed?: number
}

export type StreakAchievementType = 'MISSION_COMPLETED' | 'STREAKFREEZE'

export type StreakAchievement = {
	id?: string
	achievement_date?: string
	achievement_type?: StreakAchievementType
	mission_completed?: boolean
	progress_tracking?: StreakProgressTracking[]
}

export type StreakMission = {
	id?: string
	mission_name?: string
	mission_type?: 'READING' | 'LISTENING'
	amount_required?: number
	is_active?: boolean
}

export type StreakMissions = {
	missions: StreakMission[]
	today: StreakAchievement | null
}

export type StreakCalendarData = Record<string, StreakAchievement[]>

export type StreakLeaderboardPeriod = 'all_time' | 'weekly' | 'monthly' | 'yearly'

export type StreakLeaderboardRow = {
	id?: string
	reader_id?: string
	current_streak?: number
	longest_streak?: number
	total_days_completed?: number
	reader?: {
		id?: string
		user_id?: string
		name?: string
		avatar?: string | null
	}
}
