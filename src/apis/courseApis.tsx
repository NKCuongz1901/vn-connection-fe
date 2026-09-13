import { COURSE_ROUTES } from '@/routes'
import axios from '../axios'
import { convertParams } from '@/ultis/object'

type CourseReportMedia = {
	url: string
	type: 'IMAGE' | 'VIDEO'
	duration: number
}

export type CourseReportPayload = {
	report_target_id: string
	issue_type: string
	email: string
	content: string
	medias?: CourseReportMedia[]
}

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

export const handleReportCourse = async (payload: CourseReportPayload) => {
	const { report_target_id, issue_type, email, content, medias } = payload
	return await axios.post(COURSE_ROUTES.reportCourse, {
		report_target_id,
		issue_type,
		email,
		content,
		medias: medias || [],
	})
}
