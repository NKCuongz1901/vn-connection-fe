import { convertParams } from '@/ultis/object'
import axios from '../axios'
import { REFERRAL_ROUTES } from '@/routes'

export const getLeaderBoard = async () => {
	const url = REFERRAL_ROUTES.leaderBoard
	return await axios.get(url)
}

export const getWalletHistoryGroupByMonth = async () => {
	const url = REFERRAL_ROUTES.walletHistoryGroupByMonth
	return await axios.get(url)
}

export const getWalletHistoryandInvite = async (params: {
	page?: number
	limit?: number
	fields?: any
}) => {
	const url = REFERRAL_ROUTES.walletHistory
	return await axios.get(url, {
		params: convertParams(params),
	})
}
