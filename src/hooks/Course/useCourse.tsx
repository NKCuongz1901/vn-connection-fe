import { getCourseList, getTrackingCourse } from '@/apis/courseApis'
import { useModal } from '@/context/ModalContext'
import {
	Course,
	CourseListRes,
	TrackingCourse,
	TrackingCourseRes,
} from '@/interface/Course/Course.interface'
import { useEffect, useState } from 'react'

export default function useCourse() {
	const { openError } = useModal()
	const [listCourse, setListCourse] = useState<Course[]>([])
	const [myPurchasedCourse, setMyPurchasedCourse] = useState<Course[]>([])
	const [trackingCourse, setTrackingCourse] = useState<TrackingCourse[]>([])
	const [loading, setloading] = useState({
		listCourse: false,
		myPurchasedCourse: false,
		trackingCourse: false,
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

	useEffect(() => {
		handleGetListCourse()
		handleGetMyPurchasedCourse()
		handleGetTrackingCourse()
	}, [])

	return {
		loading,
		listCourse,
		myPurchasedCourse,
		trackingCourse,
	}
}
