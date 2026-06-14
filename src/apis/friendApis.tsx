import { convertParams } from '@/ultis/object'
import axios from '../axios'

import { FRIEND_ROUTES } from '@/routes'
import { optionFriends } from '@/Variable/common.variable'
const urlFriendList = {
	[optionFriends[0].value]: FRIEND_ROUTES.myFriend,
	[optionFriends[1].value]: FRIEND_ROUTES.myRequest,
	[optionFriends[2].value]: FRIEND_ROUTES.mySent,
	option: FRIEND_ROUTES.name,
}
export const getFriends = async ({ params: _params }: { params?: any }) => {
	const { type, ...params } = _params || optionFriends[0].value

	const url = urlFriendList[type]

	return await axios.get(url, {
		params: convertParams(params),
	})
}

export const updateFriend = async ({
	payload,
	id,
}: {
	id: string
	payload?: any
}) => {
	const url = FRIEND_ROUTES.name + `/${id}`
	return await axios.put(url, payload)
}

export const deleteFriend = async ({ id }: { id: string }) => {
	const url = FRIEND_ROUTES.name + `/${id}`
	return await axios.delete(url)
}

export const addFriend = async (payload: any) => {
	const url = FRIEND_ROUTES.name
	return await axios.post(url, payload)
}

export const getMyFriendOnline = async (params: any) => {
	const url = FRIEND_ROUTES.myFriendOnline
	return await axios.get(url, {
		params: convertParams(params),
	})
}
