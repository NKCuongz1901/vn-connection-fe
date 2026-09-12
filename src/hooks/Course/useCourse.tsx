import {
	getCourseList,
	getReferralGlobal,
	getTrackingCourse,
} from '@/apis/courseApis'
import { useModal } from '@/context/ModalContext'
import {
	Course,
	CourseListRes,
	TrackingCourse,
	TrackingCourseRes,
} from '@/interface/Course/Course.interface'
import { getReferralCode } from '@/ultis/string'
import { useEffect, useState } from 'react'

export default function useCourse() {
	const { openError } = useModal()
	const [listCourse, setListCourse] = useState<Course[]>([])
	const [myPurchasedCourse, setMyPurchasedCourse] = useState<Course[]>([])
	const [trackingCourse, setTrackingCourse] = useState<TrackingCourse[]>([])
	const [referralGlobalLink, setReferralGlobalLink] = useState<string>('')
	const [referralGlobalCode, setReferralGlobalCode] = useState<string>('')
	const [loading, setloading] = useState({
		listCourse: true,
		myPurchasedCourse: true,
		trackingCourse: true,
		referralGlobal: true,
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

	useEffect(() => {
		handleGetListCourse()
		handleGetMyPurchasedCourse()
		handleGetTrackingCourse()
		handleGetReferralGlobal()
	}, [])

	return {
		loading,
		listCourse,
		myPurchasedCourse,
		trackingCourse,
		referralGlobalLink,
		referralGlobalCode,
	}
}
