export const TOAST_SOURCE_TYPE = {
	MESSAGE_DELETE_REASON: 'message_delete_reason',
} as const

export interface ToastModel {
	id: string
	user_id?: string
	title: string
	content: string
	is_read: boolean
	source_type?: string
}

export type SocketToastEnvelope = {
	message?: string
	data?: Partial<ToastModel>
}

export const parseToastSocketPayload = (
	payload: unknown,
	myId?: string,
): ToastModel | null => {
	const envelope = payload as SocketToastEnvelope
	const raw = envelope?.data ?? (payload as Partial<ToastModel>)

	if (!raw || typeof raw !== 'object') return null

	const { id, user_id, title, content, is_read, source_type } = raw

	if (!id && !title && !content) return null
	if (user_id && myId && user_id !== myId) return null

	const resolvedSourceType =
		source_type ?? TOAST_SOURCE_TYPE.MESSAGE_DELETE_REASON

	if (resolvedSourceType !== TOAST_SOURCE_TYPE.MESSAGE_DELETE_REASON) return null

	return {
		id: id ?? '',
		user_id: user_id ?? myId,
		title: title ?? '',
		content: content ?? '',
		is_read: is_read ?? false,
		source_type: resolvedSourceType,
	}
}
