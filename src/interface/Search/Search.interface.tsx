import { PaginationProps } from '../common/common.interface'

export interface LocalProps {
	id: string
	name: string
	avatar: string
	phone: string
	longitude_local: number
	latitude_local: number
	address_local: string
	gender: 'MALE' | 'FEMALE' | 'OTHER'
	language: string
	age: number
	languages_can_speak_array: string[]
	online_time: string
	country_code: string
	i_am_from: string
}

export interface LocalResProps {
	code: number
	results: {
		objects: {
			count: number
			rows: LocalProps[]
		}
	}
	pagination: PaginationProps
}

export interface EventInAppProps {
	start_time_date: string
	end_time_date: string
	id: string
	origin_id: string
	parent_id: any
	user_id: string
	message_id: any
	conversation_id: any
	category_id: any
	is_root: boolean
	title: string
	title_en: string
	address: string
	address_en: string
	area_name: any
	description: string
	menu_price: string
	ticket_entrance: string
	ticket_entrance_type: string
	type: string
	limit_participant: any
	expect_participant: number
	image: any
	thumbnails: string[]
	categories: string[]
	timezone: number
	timezone_name: string
	start_time: string
	end_time: string
	repeat_type: {
		days: any[]
		type: string
		current_repeat: number
		amount_of_repeat: number
	}
	history_repeat: any[]
	position: {
		crs: {
			type: string
			properties: {
				name: string
			}
		}
		type: string
		coordinates: [number, number]
	}
	longitude: number
	latitude: number
	radius_limit: any
	amount_of_like: number
	amount_of_comment: number
	amount_of_participant: number
	amount_of_report: number
	share_link: string
	is_change_address: boolean
	is_last_event: boolean
	created_at: string
	updated_at: string
	away: number
}
export interface EventInAppResProps {
	code: number
	results: {
		objects: {
			count: number
			rows: EventInAppProps[]
		}
	}
	pagination: PaginationProps
}
