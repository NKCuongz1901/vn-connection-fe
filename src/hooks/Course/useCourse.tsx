import {
	ContributeIdeaPayload,
	CourseReportPayload,
	getCourseDetail,
	getCourseList,
	getReferralGlobal,
	getTrackingCourse,
	handleContributeIdea as contributeIdeaApi,
	handleReportCourse as reportCourseApi,
	getPaymentInforCourse,
	handlePaymentLink,
} from '@/apis/courseApis'
import { useModal } from '@/context/ModalContext'
import {
	Course,
	CourseListRes,
	PaymentInforCourse,
	TrackingCourse,
	TrackingCourseRes,
} from '@/interface/Course/Course.interface'
import { getReferralCode } from '@/ultis/string'
import { useCallback, useEffect, useState } from 'react'

export default function useCourse(id?: string) {
	const { openError } = useModal()
	const [listCourse, setListCourse] = useState<Course[]>([])
	const [myPurchasedCourse, setMyPurchasedCourse] = useState<Course[]>([])
	const [trackingCourse, setTrackingCourse] = useState<TrackingCourse[]>([])
	const [referralGlobalLink, setReferralGlobalLink] = useState<string>('')
	const [referralGlobalCode, setReferralGlobalCode] = useState<string>('')
	const [courseDetail, setCourseDetail] = useState<Course | null>(null)
	const [paymentInforCourse, setPaymentInforCourse] =
		useState<PaymentInforCourse | null>(null)
	const [paymentLink, setPaymentLink] = useState<string>('')
	const [loading, setloading] = useState({
		listCourse: true,
		myPurchasedCourse: true,
		trackingCourse: true,
		referralGlobal: true,
		courseDetail: true,
		paymentInforCourse: true,
		paymentLink: false,
	})

	const handleGetListCourse = async () => {
		try {
			setloading((prev) => ({ ...prev, listCourse: true }))
			const res = (await getCourseList({
				params: {
					offset: 0,
					limit: 30,
				},
			})) as unknown as CourseListRes
			const { code, results } = res || {}
			if (code === 200) {
				const { rows } = results?.objects || {}
				setListCourse(rows || [])
			}
		} catch (error) {
			openError(error)
		} finally {
			setloading((prev) => ({ ...prev, listCourse: false }))
		}
	}

	const handleGetMyPurchasedCourse = async () => {
		try {
			setloading((prev) => ({ ...prev, myPurchasedCourse: true }))
			const res = (await getCourseList({
				params: {
					is_purchased: true,
					offset: 0,
					limit: 30,
				},
			})) as unknown as CourseListRes
			const { code, results } = res || {}
			if (code === 200) {
				const { rows } = results?.objects || {}
				setMyPurchasedCourse(rows || [])
			}
		} catch (error) {
			openError(error)
		} finally {
			setloading((prev) => ({ ...prev, myPurchasedCourse: false }))
		}
	}

	const handleGetTrackingCourse = async () => {
		try {
			setloading((prev) => ({ ...prev, trackingCourse: true }))
			const res = (await getTrackingCourse()) as unknown as TrackingCourseRes
			const { code, results } = res || {}
			if (code === 200) {
				setTrackingCourse(results?.object || [])
			}
		} catch (error) {
			openError(error)
		} finally {
			setloading((prev) => ({ ...prev, trackingCourse: false }))
		}
	}

	const handleGetReferralGlobal = async () => {
		try {
			setloading((prev) => ({ ...prev, referralGlobal: true }))
			const res: any = await getReferralGlobal()
			const { code, results } = res || {}
			if (code === 200) {
				setReferralGlobalLink(results?.object?.share_link || '')
				setReferralGlobalCode(
					getReferralCode(results?.object?.share_link || ''),
				)
			}
		} catch (error) {
			openError(error)
		} finally {
			setloading((prev) => ({ ...prev, referralGlobal: false }))
		}
	}

	const handleGetCourseDetail = async (id: string) => {
		try {
			setloading((prev) => ({ ...prev, courseDetail: true }))
			const res: any = await getCourseDetail(id)
			const { code, results } = res || {}
			if (code === 200) {
				setCourseDetail(results?.object || null)
			}
		} catch (error) {
			openError(error)
		} finally {
			setloading((prev) => ({ ...prev, courseDetail: false }))
		}
	}

	/** Submits a course issue report. */
	const handleReportCourse = useCallback(
		async (payload: CourseReportPayload) => {
			try {
				return await reportCourseApi({
					report_target_id: payload.report_target_id || id || '',
					issue_type: payload.issue_type,
					email: payload.email,
					content: payload.content,
					medias: payload.medias || [],
				})
			} catch (error) {
				openError(error)
			}
		},
		[id, openError],
	)

	/** Submits a course feature idea. */
	const handleContributeIdea = useCallback(
		async (payload: ContributeIdeaPayload) => {
			try {
				return await contributeIdeaApi(payload)
			} catch (error) {
				openError(error)
			}
		},
		[openError],
	)

	const handleGetPaymentInforCourse = async (id: string) => {
		try {
			setloading((prev) => ({ ...prev, paymentInforCourse: true }))
			const res: any = await getPaymentInforCourse(id)
			const { code, results } = res || {}
			if (code === 200) {
				setPaymentInforCourse(results?.object || null)
			}
		} catch (error) {
			openError(error)
		} finally {
			setloading((prev) => ({ ...prev, paymentInforCourse: false }))
		}
	}

	/** Fetches the OnePay URL and redirects the browser to checkout. */
	const handleGetPaymentLink = async (course_id: string) => {
		try {
			setloading((prev) => ({ ...prev, paymentLink: true }))
			const res: any = await handlePaymentLink(course_id)
			const { code, results } = res || {}
			const url = results?.object?.payment_url || ''
			if (code === 200 && url) {
				window.location.href = url
				return
			}
		} catch (error) {
			openError(error)
		} finally {
			setloading((prev) => ({ ...prev, paymentLink: false }))
		}
	}

	useEffect(() => {
		handleGetListCourse()
		handleGetMyPurchasedCourse()
		handleGetTrackingCourse()
		handleGetReferralGlobal()
	}, [])

	useEffect(() => {
		if (!id) return
		handleGetCourseDetail(id)
		handleGetPaymentInforCourse(id)
	}, [id])

	return {
		// Data
		loading,
		listCourse,
		myPurchasedCourse,
		trackingCourse,
		referralGlobalLink,
		referralGlobalCode,
		courseDetail,
		paymentInforCourse,
		paymentLink,
		// Actions
		handleReportCourse,
		handleContributeIdea,
		handleGetPaymentLink,
	}
}
