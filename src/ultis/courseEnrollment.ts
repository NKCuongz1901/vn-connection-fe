import {
	Course,
	PaymentInforCourse,
	UserCourse,
} from '@/interface/Course/Course.interface'

/** Length of the free trial, the same 72 hours the server uses (UD-380). */
export const COURSE_TRIAL_HOURS = 72

export const isTrialEnrollment = (userCourse?: UserCourse | null) =>
	userCourse?.payment_status === 'trial'

/** When the free trial ends: 72 hours from last_payment_at on a trial row. */
export const getTrialEndsAt = (userCourse?: UserCourse | null) => {
	if (!isTrialEnrollment(userCourse) || !userCourse?.last_payment_at) return null
	const started = new Date(userCourse.last_payment_at)
	if (Number.isNaN(started.getTime())) return null
	return new Date(started.getTime() + COURSE_TRIAL_HOURS * 60 * 60 * 1000)
}

export const isTrialActive = (
	userCourse?: UserCourse | null,
	now: Date = new Date(),
) => {
	const endsAt = getTrialEndsAt(userCourse)
	return !!endsAt && now.getTime() < endsAt.getTime()
}

/**
 * The learner may study this course: bought, or inside a running free trial.
 * Same rule as the app's CourseDetailBottomBar isEnrolled.
 */
export const isCourseEnrolled = (
	course?: Course | null,
	paymentInfor?: PaymentInforCourse | null,
) => {
	if (paymentInfor?.is_purchased === true) return true
	const userCourse = course?.userCourse
	return userCourse?.payment_status === 'purchased' || isTrialActive(userCourse)
}

/**
 * The free trial is offered once per course, only while this account has
 * never had the course at all (no bought, trial or tutor enrollment), exactly
 * as the app decides it. The course detail returns userCourse only for those.
 */
export const canStartFreeTrial = (course?: Course | null) =>
	!!course && !course.userCourse

/** The website page OnePay sends a web checkout back to (UNIWEB-697). */
export const getCoursePaymentReturnUrl = (locale: string) => {
	if (typeof window === 'undefined') return ''
	return `${window.location.origin}/${locale}/course/payment-result`
}
