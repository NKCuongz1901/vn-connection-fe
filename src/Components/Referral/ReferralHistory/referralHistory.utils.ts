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

export interface ReferralWalletHistoryMonthItem {
	month: string
	total_amount: number
}

export interface ReferralWalletHistoryYearGroup {
	year: number
	months: ReferralWalletHistoryMonthItem[]
}

export interface ReferralYearStat {
	year: number
	total: number
}

export interface ReferralRefByMonthStat {
	label: string
	value: number
}

function getMonthSortKey(year: number, monthName: string): number {
	const date = new Date(`${monthName} 1, ${year}`)
	return Number.isNaN(date.getTime()) ? 0 : date.getTime()
}

function formatMonthYearLabel(year: number, monthName: string): string {
	const date = new Date(`${monthName} 1, ${year}`)
	if (Number.isNaN(date.getTime())) return `${monthName} ${year}`

	return date.toLocaleString('en-US', { month: 'short', year: 'numeric' })
}

export function buildAllYearsModalData(
	groups: ReferralWalletHistoryYearGroup[] = [],
): { years: ReferralYearStat[]; total: number } {
	const years = groups
		.map(({ year, months }) => ({
			year,
			total: (months ?? []).reduce(
				(sum, month) => sum + (month.total_amount ?? 0),
				0,
			),
		}))
		.sort((a, b) => b.year - a.year)

	const total = years.reduce((sum, item) => sum + item.total, 0)

	return { years, total }
}

export function buildRefByMonthStats(
	groups: ReferralWalletHistoryYearGroup[] = [],
): ReferralRefByMonthStat[] {
	const allMonths = groups.flatMap(({ year, months }) =>
		(months ?? []).map((month) => ({
			label: formatMonthYearLabel(year, month.month),
			value: month.total_amount ?? 0,
			sortKey: getMonthSortKey(year, month.month),
		})),
	)

	if (!allMonths.length) {
		return [{ label: 'Total', value: 0 }]
	}

	allMonths.sort((a, b) => b.sortKey - a.sortKey)

	const recentMonths = allMonths.slice(0, 2)
	const total = allMonths.reduce((sum, item) => sum + item.value, 0)

	return [
		...recentMonths.map(({ label, value }) => ({ label, value })),
		{ label: 'Total', value: total },
	]
}
