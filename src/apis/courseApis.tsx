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

export const getTrackingCourse = async () => {
	return await axios.get(COURSE_ROUTES.trackingCourse)
}

export const getReferralGlobal = async () => {
	return await axios.post(COURSE_ROUTES.referralGlobal)
}

export const getCourseDetail = async (id: string) => {
	return await axios.get(COURSE_ROUTES.courseDetail(id))
}
