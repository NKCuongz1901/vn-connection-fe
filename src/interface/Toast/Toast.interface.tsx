export const TOAST_SOURCE_TYPE = {
	MESSAGE_DELETE_REASON: 'message_delete_reason',
} as const

export interface ToastModel {
	id: string
	user_id: string
	title: string
	content: string
	is_read: boolean
	source_type: string
}
