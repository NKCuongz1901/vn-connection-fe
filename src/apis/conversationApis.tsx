import axios from '../axios'

import { CONVERSATION_ROUTES } from '@/routes'

export const sendMessageById = async (payload: any) => {
	const url = CONVERSATION_ROUTES.sendById

	return await axios.post(url, payload)
}
