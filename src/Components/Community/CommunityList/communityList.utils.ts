import { isArray } from '@/ultis/array'

export const getCommunityRole = (item: any) =>
	item?.userRole || item?.membership_type || ''

export const isCommunityJoined = (item: any) => {
	const role = getCommunityRole(item)
	if (role === 'OWNER' || role === 'ADMIN' || role === 'MEMBER') return true
	return isArray(item?.users_in_conversation, 1)
}
