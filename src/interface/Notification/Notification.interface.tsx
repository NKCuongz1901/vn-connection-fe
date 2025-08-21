export interface NotiItemProp {
	id: string
	user_id: string
	item_id: string | null
	title: string
	content: string
	image: string | null

	interacting_type: 'PUSH_BY_ADMIN'
	is_read: boolean
	extra_data:
		| {
				type: 'DISCUSS_IN_TOPIC'
				post_id: string
				category_id: string
		  }
		| false
	created_at: string // ISO date
	updated_at: string // ISO date
	deleted_at: string | null
	[key: string]: any
}
