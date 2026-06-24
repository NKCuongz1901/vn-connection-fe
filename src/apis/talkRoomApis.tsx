import { convertParams } from '@/ultis/object'
import axios from '../axios'
import { TALKROOM_ROUTES } from '@/routes'

export const getTalkRoomOverview = async ({
	params = {},
}: {
	params?: { [key: string]: any }
}) => {
	const url = TALKROOM_ROUTES.talkRoomOverview

	return await axios.get(url, {
		params: convertParams(params),
	})
}

export const getMyTalkRoomAnalysis = async ({
	params = {},
}: {
	params?: { [key: string]: any }
}) => {
	const url = TALKROOM_ROUTES.myTalkRoomAnalysis

	return await axios.get(url, {
		params: convertParams(params),
	})
}
