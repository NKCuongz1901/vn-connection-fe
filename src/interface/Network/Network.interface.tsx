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
