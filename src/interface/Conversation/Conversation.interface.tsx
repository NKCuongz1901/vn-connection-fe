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
	last_message?: {
		id: string
		created_at: string
		sender_id?: string
		sender?: {
			id: string
			name: string
			avatar: string
			is_deleted?: boolean
		}
	}
	is_read?: boolean
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
		gender: string
		visibility: string
		online_time: string
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

export type MessageBlockType = 'ONE_DAY' | 'THREE_DAYS' | 'FOREVER'

export interface AdminDeleteMessageParams {
	id: string
	is_report_spam?: boolean
	is_delete_all_from_user?: boolean
	is_ban_user?: boolean
	type_block?: MessageBlockType
	title?: string
	content?: string
}

// Chat Location
export interface ChatLocationMetadataProps {
	level: number
	source: string
	country_code: string
	country_name: string
	google_types: string[]
	backfilled_at: string
	resolved_title: string
	google_place_id: string
	formatted_address: string
}

export interface ChatLocationMessageReaderProps {
	last_read_message_id: string
	user_id: string
}

export interface ChatLocationLastMessageProps {
	id: string
	conversation_id: string
	related_conversation_id: string | null
	post_id: string | null
	parent_id: string | null
	forward_message_id: string | null
	sender_id: string
	actor_id: string | null
	dating_id: string | null
	entity_id: string | null
	entity_type: string | null
	pin_message_at: string | null
	content: string
	content_en: string
	moderation_status: string
	text_to_speech: string | null
	speech_to_text: string | null
	type: string
	message_local_id: string
	created_at_unix_timestamp: string
	created_at: string
	updated_at: string
	edited_at: string | null
	sender: {
		id: string
		avatar: string
		name: string
		is_verified: boolean | null
		is_regular: boolean
	}
	dating: any
	medias: any[]
	is_hidden_by_bad_word: boolean
}

export interface ChatLocationItemProps {
	id: string
	title: string
	avatar: string
	metadata: {
		chat_location: ChatLocationMetadataProps
	}
	created_at: string
	amount_of_user: number
	message_readers: ChatLocationMessageReaderProps[]
	last_message: ChatLocationLastMessageProps | null
	is_read: boolean
	amount_of_user_online: number
	avatars: string[]
}

export interface MiniChatItemProps {
	id: string
	title: string
	avatar: string
	amount_of_user: number
	amount_of_message: number
	created_at: string
	users_in_conversation: {
		id: string
		user_id: string
		is_accept_notification: boolean
	}[]
	message_readers: ChatLocationMessageReaderProps[]
	last_message: ChatLocationLastMessageProps | null
	is_read: boolean
	amount_of_user_online: number
}
