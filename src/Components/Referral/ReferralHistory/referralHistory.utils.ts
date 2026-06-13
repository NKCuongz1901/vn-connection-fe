import { getDateInfo } from '@/ultis/date'

export type ReferralHistoryStatusType = 'reward' | 'profile' | 'pending'

export interface ReferralWalletHistoryInvitee {
	id?: string
	name?: string
	avatar?: string
	blocked_type?: string | null
}

export interface ReferralWalletHistoryItem {
	id: string
	user_id?: string
	invitee_id?: string
	phone?: string | null
	amount?: number
	type?: string
	label?: 'PENDING' | 'DONE' | null
	status?: boolean
	created_at?: string
	invitee?: ReferralWalletHistoryInvitee | null
}

export interface ReferralHistoryStatusResult {
	type: ReferralHistoryStatusType
	amount?: number
}

export function getInviteeDisplayName(item: ReferralWalletHistoryItem): string {
	const name = item.invitee?.name?.trim()
	if (name) return name
	if (item.phone) return item.phone
	return '—'
}

export function getInviteeAvatar(item: ReferralWalletHistoryItem): string {
	return item.invitee?.avatar || ''
}

export function formatReferralDate(createdAt?: string): string {
	if (!createdAt) return '—'
	return getDateInfo(createdAt).dmy
}

export function getReferralHistoryStatus(
	item: ReferralWalletHistoryItem,
): ReferralHistoryStatusResult {
	if (item.label === 'PENDING') {
		return { type: 'pending' }
	}

	if (item.status === true) {
		return { type: 'reward', amount: item.amount ?? 0 }
	}

	if (item.label === 'DONE') {
		return { type: 'profile' }
	}

	return { type: 'pending' }
}
