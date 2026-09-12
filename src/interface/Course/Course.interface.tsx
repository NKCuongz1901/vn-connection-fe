import { PaginationProps } from '../common/common.interface'

export type CourseType = 'DICTATION' | 'WRITING' | 'SPEAKING'

export type CourseLearningType =
	| 'ai_feedback'
	| 'online'
	| 'learn_with_classmates'

export interface CourseSlotPrototype {
	day_index: number
	max_joined: number
	start_time_utc: string
	end_time_utc: string
	schedule_slot_id: string
}

export interface CourseCustomData {
	language_type: string
	learning_type: CourseLearningType[]
	about_description: string
	learning_estimate: string
	course_description: string
	schedule_description: string
	recommended_time_in_minutes?: number
}

export interface CourseOwner {
	id: string
	name: string
	avatar: string
	total_course: number
	total_learners: number
}

export interface UserCourse {
	[key: string]: unknown
}

export interface Course {
	id: string
	name: string
	duration_days: number
	start_date: string
	avatar: string
	supported_language: string[]
	price: string
	about: string
	conversation_id: string
	owner_id: string
	custom_data: CourseCustomData
	type: CourseType
	is_verified: boolean
	slot_prototype: CourseSlotPrototype[]
	created_at: string
	updated_at: string
	deleted_at: string | null
	owner: CourseOwner
	userCourse: UserCourse | null
	on_going_lang: string[]
	users_online: number
	learner_joined: number
	review_rating: number
	review_count: number
}

export interface CourseListRes {
	code: number
	results: {
		objects: {
			count: number
			rows: Course[]
		}
	}
	pagination: PaginationProps
}
