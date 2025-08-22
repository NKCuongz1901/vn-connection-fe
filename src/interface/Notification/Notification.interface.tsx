export interface NotiItemProp {
	id: string
	user_id: string
	item_id: string | null
	title: string
	content: string
	image: string | null

	interacting_type: string
	is_read: boolean
	extra_data:
		| {
				type?: string
				post_id?: string
				category_id?: string
				kind?: string
		  }
		| false
	created_at: string // ISO date
	updated_at: string // ISO date
	deleted_at: string | null
	[key: string]: any
}
