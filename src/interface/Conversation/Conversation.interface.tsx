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
