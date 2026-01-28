export interface CategoriFavOptProps {
	id: string
	title: string
	image?: string
	order?: number
	updated_at?: string
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
			user: UserProps
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

export interface ConversationProps {
	id: string
	parent_id: any
	host_id: string
	friend_id: any
	dating_id: any
	friend_dating_id: any
	last_message_id: string
	user_id_un_match: any
	category_id: string
	post_id: any
	lmb_business_id: any
	avatar: string
	thumbnail: string
	title: string
	amount_of_message: number
	amount_of_user: number
	amount_of_user_online: number
	active_score: number
	last_time_chat: string
	type: string
	about: string
	bio: string
	category: string
	category_list: string[]
	access_type: any
	kind: string
	is_stranger: boolean
	is_un_match: boolean
	share_link: string
	is_offline: boolean
	is_online: boolean
	address: string
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
	user_ids_move_to_older: any[]
	older_chat_type: string
	created_at_unix_timestamp: string
	created_at: string
	updated_at: string
	deleted_at: any
	last_message: {
		content: string
		type: string
		sender_id: string
		read_user_ids: string[]
		created_at_unix_timestamp: string
		created_at: string
	}
	post: any
	host: UserProps
	friend: any
	country_code?: string
	join: {
		id: string
		user_id: string
		inviter_id: any
		dating_id: any
		lmb_business_id: any
		conversation_id: string
		is_accept_notification: boolean
		amount_of_remind: number
		type: string
		status: boolean
		created_at_unix_timestamp: any
		created_at: string
		updated_at: string
	}
}

export interface ClubMemberProps {
	id: string
	type: string
	user_id: string
	is_accept_notification: boolean
	created_at: string
	user: {
		id: string
		avatar: string
		name: string
		is_verified: any
		country_code: string
		address_local: string
		profile: any
	}
	dating: any
}

interface IMediaProps {
	// nếu có media sau này thì có thể mở rộng ở đây
	[key: string]: any
}

export interface AnnouncementProps {
	id: string
	title: string
	description: string
	image: string | null
	parent_id: string | null
	user_id: string
	conversation_id: string
	amount_of_like: number
	amount_of_comment: number
	share_link: string
	type: string
	created_at: string
	updated_at: string
	user: UserProps
	medias: IMediaProps[]
	is_liked: boolean
}
