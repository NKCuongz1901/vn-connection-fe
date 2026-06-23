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
