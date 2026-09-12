import { getCourseList } from '@/apis/courseApis'
import { useModal } from '@/context/ModalContext'
import { Course, CourseListRes } from '@/interface/Course/Course.interface'
import { useEffect, useState } from 'react'

export default function useCourse() {
	const { openError } = useModal()
	const [listCourse, setListCourse] = useState<Course[]>([])
	const [myPurchasedCourse, setMyPurchasedCourse] = useState<Course[]>([])
	const [loading, setloading] = useState({
		listCourse: false,
		myPurchasedCourse: false,
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

	useEffect(() => {
		handleGetListCourse()
		handleGetMyPurchasedCourse()
	}, [])

	return {
		loading,
		listCourse,
		myPurchasedCourse,
	}
}
