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

export type UserCourseStatus = 'inactive' | 'complete' | 'active'

export type UserCoursePaymentStatus = 'purchased' | 'pending' | 'refunded'

export interface UserCourse {
	id: string
	course_id: string
	user_id: string
	payment_status: UserCoursePaymentStatus | string
	target_language: string
	native_language: string
	status: UserCourseStatus | string
	type: string
	transaction_no: string | null
	onboarding_sheet_count: number
	intro_streak_open_count: number
	day_without_submission_count: number
	last_processed_date: string | null
	last_language_translate_in_ai_feedback: string | null
	last_payment_at: string | null
	day_started: string | null
	created_at: string
	updated_at: string
	is_read_tomorrow: boolean
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

export type TrackingCourseInfo = Pick<
	Course,
	| 'id'
	| 'name'
	| 'duration_days'
	| 'start_date'
	| 'avatar'
	| 'supported_language'
	| 'price'
	| 'about'
	| 'conversation_id'
	| 'owner_id'
	| 'custom_data'
	| 'type'
	| 'is_verified'
	| 'slot_prototype'
	| 'created_at'
	| 'updated_at'
	| 'learner_joined'
>

export interface TrackingCourse {
	course: TrackingCourseInfo
	yesterday_score: number | null
	last_week_score: number | null
	total_score: number
	class_ranking: number
	next_exercise: string | null
	is_current_slot_open: boolean
	current_slot: CourseSlotPrototype | null
}

export interface TrackingCourseRes {
	code: number
	results: {
		object: TrackingCourse[]
	}
}

export interface PaymentInforCourse {
	is_purchased: boolean
	course_id: string
	original_price: number | null
	final_price: number | null
	is_first_payment_discount: boolean | null
	discount_percentage: number | null
	transaction_ref: string | null
}
