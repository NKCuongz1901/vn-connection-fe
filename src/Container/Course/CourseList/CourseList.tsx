'use client'

import { useState } from 'react'
import { IconArrowLeft } from '@tabler/icons-react'
import { Skeleton } from 'antd'

import CourseCard from '@/Components/Course/CourseCard/CourseCard'
import CourseReferralModal from '@/Components/Course/CourseReferralModal/CourseReferralModal'
import useCourse from '@/hooks/Course/useCourse'
import useCourseReferralCapture from '@/hooks/Course/useCourseReferralCapture'
import { mainRoutes } from '@/routes/MainRoutes'
import { arrayFrom } from '@/ultis/array'
import { useLocalePath } from '@/ultis/route'

import classes from './CourseList.module.scss'

function CourseList() {
	const { onChangeRoute } = useLocalePath()
	useCourseReferralCapture()
	const { loading, listCourse, referralGlobalLink, referralGlobalCode } =
		useCourse()
	const [referralModalOpen, setReferralModalOpen] = useState(false)
	const count = listCourse.length

	const handleBack = () => {
		onChangeRoute(mainRoutes.courseOverview)
	}

	return (
		<div className={classes.container}>
			<button type="button" className={classes.heading} onClick={handleBack}>
				<IconArrowLeft
					size={20}
					color="#0f1729"
					stroke={1.5}
					className={classes.backIcon}
				/>
				<p className={classes.title}>UniVini Course: Learn smarter, faster</p>
				<span className={classes.badge}>{count}</span>
			</button>

			<div className={classes.list}>
				{loading.listCourse && !count
					? arrayFrom(3).map((_, index) => (
							<Skeleton.Input
								key={index}
								active
								className={classes.skeleton}
								block
							/>
						))
					: listCourse.map((course) => (
							<CourseCard
								key={course.id}
								course={course}
								onClick={() =>
									onChangeRoute(`${mainRoutes.course}/${course.id}`)
								}
								onShare={() => setReferralModalOpen(true)}
							/>
						))}
			</div>

			<CourseReferralModal
				open={referralModalOpen}
				onClose={() => setReferralModalOpen(false)}
				referralCode={referralGlobalCode}
				shareLink={referralGlobalLink}
			/>
		</div>
	)
}

export default CourseList
