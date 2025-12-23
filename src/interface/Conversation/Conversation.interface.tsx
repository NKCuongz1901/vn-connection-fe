interface User {
	id: string
	avatar: string
	name: string
}

interface UserInConversation {
	id: string
	type: string
	conversation_id: string
	user_id: string
	amount_of_remind: number
	user: User
}

export interface ConversationChatRoomProps {
	id: string
	title: string
	avatar: string
	amount_of_user: number
	amount_of_user_online: number
	amount_of_message: number
	created_at: string
	access_type: any
	users_in_conversation: UserInConversation[]
	host: any
	friend: any
}

export interface MemberProps {
	id: string
	type: string
	user_id: string
	is_accept_notification: boolean
	created_at: string
	user: {
		id: string
		avatar: string
		name: string
		age: number
		birthday: string
		is_verified: boolean
		country_code: string
		address_local: string
		blocked_at: any
		profile: any
	} | null
	dating: any
}

export interface ReactionPtops {
	id: string
	emoji: string
	image_url: string
	label: string
	is_active: boolean
	created_at: string
	updated_at: string
	deleted_at: any
}

export interface LanguageProps {
	id: string
	name: string
	code: string
	flag: string
	native_name: string | null
	native_code: string | null
	order: number
	created_at: string
	updated_at: string
	deleted_at: string | null
}
