'use client'

import { IconArrowLeft } from '@tabler/icons-react'
import { Skeleton } from 'antd'

import MyCourseCard from '@/Components/Course/MyCourseCard/MyCourseCard'
import useCourse from '@/hooks/Course/useCourse'
import { mainRoutes } from '@/routes/MainRoutes'
import { arrayFrom } from '@/ultis/array'
import { useLocalePath } from '@/ultis/route'

import classes from './MyCourseList.module.scss'

function MyCourseList() {
	const { onChangeRoute } = useLocalePath()
	const { loading, myPurchasedCourse } = useCourse()
	const count = myPurchasedCourse.length

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
				<p className={classes.title}>My paid courses</p>
				<span className={classes.badge}>{count}</span>
			</button>

			<div className={classes.list}>
				{loading.myPurchasedCourse && !count
					? arrayFrom(3).map((_, index) => (
							<Skeleton.Input
								key={index}
								active
								className={classes.skeleton}
								block
							/>
						))
					: myPurchasedCourse.map((course) => (
							<MyCourseCard
								key={course.id}
								course={course}
								onClick={() =>
									onChangeRoute(`${mainRoutes.course}/${course.id}`)
								}
							/>
						))}
			</div>
		</div>
	)
}

export default MyCourseList
