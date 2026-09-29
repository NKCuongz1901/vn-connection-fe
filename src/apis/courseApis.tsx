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

export type ContributeIdeaPayload = {
	feature_title: string
	why_need_this: string
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

export const handleContributeIdea = async (payload: ContributeIdeaPayload) => {
	const { feature_title, why_need_this } = payload
	return await axios.post(COURSE_ROUTES.contributeIdea, {
		feature_title,
		why_need_this,
	})
}

/**
 * Payment details for a course. With target_language the server also records
 * the language on the learner's unpaid enrollment, which is the language the
 * OnePay IPN enrolls them in (webhook.service.ts falls back to the course's
 * first language only when none was recorded).
 */
export const getPaymentInforCourse = async (
	id: string,
	target_language?: string,
) => {
	return await axios.get(COURSE_ROUTES.getPaymentInforCourse(id), {
		params: target_language ? { target_language } : undefined,
	})
}

/**
 * The OnePay checkout URL. return_url is the website page OnePay sends the
 * learner back to; the server accepts only UniVini web origins.
 */
export const handlePaymentLink = async (
	course_id: string,
	return_url?: string,
) => {
	return await axios.post(COURSE_ROUTES.paymentLink, {
		course_id,
		...(return_url ? { return_url } : {}),
	})
}

/** Starts the 3-day free trial of a course (UD-380). */
export const startCourseFreeTrial = async (
	course_id: string,
	target_language?: string,
) => {
	return await axios.post(COURSE_ROUTES.freeTrial(course_id), {
		...(target_language ? { target_language } : {}),
	})
}

/** The signed-in learner's REF link for one course. */
export const getCourseShareLink = async (course_id: string) => {
	return await axios.post(COURSE_ROUTES.shareCourse(course_id))
}

/** Records the sharer of a per-course REF link for this learner. */
export const registerCourseReferral = async (
	course_id: string,
	invite_code: string,
) => {
	return await axios.post(COURSE_ROUTES.referralRegister, {
		course_id,
		invite_code,
	})
}

/** Records the sharer of the global REF link for every course not bought yet. */
export const registerGlobalCourseReferral = async (invite_code: string) => {
	return await axios.post(COURSE_ROUTES.referralGlobalRegister, {
		invite_code,
	})
}
