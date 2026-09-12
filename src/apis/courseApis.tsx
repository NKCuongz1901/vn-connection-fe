import { COURSE_ROUTES } from '@/routes'
import axios from '../axios'
import { convertParams } from '@/ultis/object'

export const getCourseList = async ({
	params = {},
}: {
	params?: { [key: string]: any }
}) => {
	return await axios.get(COURSE_ROUTES.baseUrl, {
		params: convertParams(params),
	})
}
