export interface CategoriFavOptProps {
	id: string
	title: string
	image: string
	order: number
	updated_at: string
	[key: string]: any
}

interface UserProps {
	id: string
	avatar: string
	name: string
}

interface UserInConversationProps {
	id: string
	type: 'OWNER' | 'MEMBER' | 'ADMIN' // hoặc union khác nếu có thêm
	conversation_id: string
	user_id: string
	user: UserProps
}

export interface NetworkItemProps {
	id: string
	title: string
	avatar: string
	active_score: number
	amount_of_user: number
	category: string
	created_at: string
	users_in_conversation: UserInConversationProps[]
	userRole: 'OWNER' | 'MEMBER' | 'ADMIN' // tùy hệ thống có role nào
}

export interface NetworkOptProps {
	id: number
	name: string
	is_default: boolean
}

export interface NetworkClubProps {
	id: string
	title: string
	avatar: string
	active_score: number
	amount_of_user: number
	category: string
	created_at: string
	users_in_conversation: [
		{
			id: string
			type: 'MEMBER' | 'ADMIN' | 'OWNER'
			conversation_id: string
			user_id: string
			user: {
				id: string
				avatar: string
				name: string
			}
		},
	]
	cate: {
		id: string
		title: string
		group_id: number
	}
	userRole: 'MEMBER' | 'ADMIN' | 'OWNER'
}

export interface NetworkClubSuggestProps {
	id: string
	title: string
	avatar: string
	created_at: string // ISO date string
}

export interface NetworkClubSearchInAppProps {
	id: string
	title: string
	image: string
	count: number
}

export interface MatchingClubProps {
	id: string
	title: string
	avatar: string
	category: string // ví dụ: "Language exchange, Workshop, Camping"
	category_list: string[] // mảng ID của category
	address: string
	amount_of_user: number
	is_offline: boolean
	is_online: boolean
	longitude: number
	latitude: number
	users_in_conversation: UserInConversationProps[] | any[]
	membership_type: string // ví dụ: "OWNER"
	away: number // khoảng cách, đơn vị có thể là km
}

export interface MatchingUserProps {
	id: string
	name: string
	avatar: string
	phone: string
	longitude_local: number
	latitude_local: number
	address_local: string
	gender: 'MALE' | 'FEMALE' | 'OTHER'
	language: string // mã ngôn ngữ, ví dụ: 'jp', 'en', 'vi'
	age: number
	languages_can_speak_array: string[]
	online_time: string // timestamp dạng string (epoch)
	i_am_interested_in: string // ví dụ: "Language exchange"
}
