import { convertParams } from '@/ultis/object'
import axios from '../axios'
import { REFERRAL_ROUTES } from '@/routes'

export type ReferralLeaderboardPeriod = 'monthly' | 'yearly' | 'all_time'

export const getLeaderBoard = async (params?: {
	period?: ReferralLeaderboardPeriod
	page?: number
	limit?: number
}) => {
	const url = REFERRAL_ROUTES.leaderBoard
	return await axios.get(url, {
		params: convertParams({
			period: params?.period || 'monthly',
			page: params?.page || 1,
			limit: params?.limit || 30,
		}),
	})
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

export const getWalletHistoryOverview = async () => {
	const url = REFERRAL_ROUTES.walletHistoryOverview
	return await axios.get(url)
}


export type AddBankAccountPayload = {
	bank_name: string
	account_holder_name: string
	account_number: string
	email: string
	phone: string
}

/** Saves bank account details for referral redeem. */
export const addBankAccount = async (payload: AddBankAccountPayload) => {
	const url = REFERRAL_ROUTES.addBankAccount
	return await axios.put(url, payload)
}

/** Fetches current user's redeem request history. */
export const getMyRedeemRequests = async (params?: {
	page?: number
	limit?: number
}) => {
	const url = REFERRAL_ROUTES.myRedeemRequests
	return await axios.get(url, {
		params: convertParams({
			page: params?.page || 1,
			limit: params?.limit || 30,
		}),
	})
}

/** Creates a redeem request for the given points. */
export const createRedeemRequest = async (payload: { points: number }) => {
	const url = REFERRAL_ROUTES.createRedeemRequest
	return await axios.post(url, payload)
}
