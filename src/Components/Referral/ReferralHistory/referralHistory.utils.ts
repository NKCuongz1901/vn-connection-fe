import { getDateInfo } from '@/ultis/date'

export type ReferralOverviewMonth = {
	month: string
	points: number
}

export type ReferralOverviewYear = {
	year: number
	points: number
	months: ReferralOverviewMonth[]
}

export type ReferralOverviewData = {
	all_time_points: number
	years: ReferralOverviewYear[]
	redeemable_months: ReferralOverviewMonth[]
	minimum_redeem_points: number
	point_value_vnd: number
}

export interface ReferralYearStat {
	year: number
	total: number
}

export interface ReferralRefByMonthStat {
	label: string
	value: number
}

/** Formats API month key like 2026-03 into Mar 2026. */
function formatMonthKeyLabel(monthKey: string): string {
	const [year, month] = monthKey.split('-').map(Number)
	if (!year || !month) return monthKey

	const date = new Date(year, month - 1, 1)
	if (Number.isNaN(date.getTime())) return monthKey

	return date.toLocaleString('en-US', { month: 'short', year: 'numeric' })
}

/** Converts overview years into modal year stats. */
export function buildAllYearsModalData(
	years: ReferralOverviewYear[] = [],
	allTimePoints = 0,
): { years: ReferralYearStat[]; total: number } {
	const yearStats = [...years]
		.map(({ year, points }) => ({
			year,
			total: Number(points) || 0,
		}))
		.sort((a, b) => b.year - a.year)

	return {
		years: yearStats,
		total: Number(allTimePoints) || 0,
	}
}

/** Builds month cards for the selected year filter. */
export function buildRefByMonthStats(
	years: ReferralOverviewYear[] = [],
	options?: {
		selectedYear?: number | null
		allTimePoints?: number
	},
): ReferralRefByMonthStat[] {
	const selectedYear = options?.selectedYear ?? null
	const allTimePoints = Number(options?.allTimePoints) || 0

	const filteredYears =
		selectedYear == null
			? years
			: years.filter((item) => item.year === selectedYear)

	const allMonths = filteredYears.flatMap(({ months }) =>
		(months ?? []).map((month) => ({
			label: formatMonthKeyLabel(month.month),
			value: Number(month.points) || 0,
			sortKey: month.month,
		})),
	)

	if (!allMonths.length) {
		return [{ label: 'Total', value: selectedYear == null ? allTimePoints : 0 }]
	}

	allMonths.sort((a, b) => (a.sortKey < b.sortKey ? 1 : -1))

	const recentMonths = allMonths.slice(0, 2)
	const yearPoints =
		selectedYear == null
			? allTimePoints
			: Number(
					filteredYears.find((item) => item.year === selectedYear)?.points,
				) || 0

	return [
		...recentMonths.map(({ label, value }) => ({ label, value })),
		{ label: 'Total', value: yearPoints },
	]
}

/** Normalizes referral-overview API payload. */
export function normalizeReferralOverview(payload: any): ReferralOverviewData {
	const object = payload?.object || payload || {}

	return {
		all_time_points: Number(object.all_time_points) || 0,
		years: Array.isArray(object.years)
			? object.years.map((year: any) => ({
					year: Number(year.year) || 0,
					points: Number(year.points) || 0,
					months: Array.isArray(year.months)
						? year.months.map((month: any) => ({
								month: String(month.month || ''),
								points: Number(month.points) || 0,
							}))
						: [],
				}))
			: [],
		redeemable_months: Array.isArray(object.redeemable_months)
			? object.redeemable_months.map((month: any) => ({
					month: String(month.month || ''),
					points: Number(month.points) || 0,
				}))
			: [],
		minimum_redeem_points: Number(object.minimum_redeem_points) || 0,
		point_value_vnd: Number(object.point_value_vnd) || 0,
	}
}

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
