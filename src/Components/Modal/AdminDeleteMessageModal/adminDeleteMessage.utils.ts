import { AdminDeleteMessageParams } from '@/interface/Conversation/Conversation.interface'

import { AdminDeleteSelection, BlockType } from './AdminDeleteMessageModal'

export type ReportContentItem = {
	title?: string
	content?: string
	label?: string
	description?: string
}

export const getReportReasonPayload = (item: ReportContentItem) => ({
	title: item.title || item.label || '',
	content: item.content || item.description || item.title || item.label || '',
})

export const buildAdminDeleteMessageParams = ({
	id,
	selection,
	reason,
}: {
	id: string
	selection: AdminDeleteSelection
	reason?: { title?: string; content?: string }
}): AdminDeleteMessageParams => ({
	id,
	is_report_spam: selection.isReportSpam || undefined,
	is_delete_all_from_user: selection.isDeleteAllFromUser || undefined,
	is_ban_user: selection.blockType ? true : undefined,
	type_block: selection.blockType || undefined,
	title: reason?.title,
	content: reason?.content,
})

export const getAdminDeleteMessageOptions = (senderName: string) => {
	const name = senderName?.trim() || 'this user'

	return [
		{
			key: 'report_spam',
			kind: 'toggle' as const,
			label: 'Report spam',
		},
		{
			key: 'delete_all',
			kind: 'toggle' as const,
			label: `Delete all message from ${name}`,
		},
		{
			key: 'ONE_DAY',
			kind: 'block' as const,
			blockType: 'ONE_DAY' as BlockType,
			label: `Block ${name} for 24h`,
		},
		{
			key: 'THREE_DAYS',
			kind: 'block' as const,
			blockType: 'THREE_DAYS' as BlockType,
			label: `Block ${name} for 3 days`,
		},
		{
			key: 'FOREVER',
			kind: 'block' as const,
			blockType: 'FOREVER' as BlockType,
			label: `Block ${name} permanently`,
		},
	]
}
