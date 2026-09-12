'use client'

import { memo } from 'react'
import { Skeleton } from 'antd'

import MyCourseCard from '@/Components/Course/MyCourseCard/MyCourseCard'
import { Course } from '@/interface/Course/Course.interface'
import { arrayFrom } from '@/ultis/array'

import classes from './MyCourseList.module.scss'

type MyCourseListProps = {
	courses: Course[]
	loading?: boolean
	onCourseClick?: (course: Course) => void
	onReview?: (course: Course) => void
}

function MyCourseList({
	courses,
	loading,
	onCourseClick,
	onReview,
}: MyCourseListProps) {
	const count = courses.length

	return (
		<div className={classes.wrapper}>
			<div className={classes.heading}>
				<div className={classes.titleRow}>
					<p className={classes.title}>My paid courses</p>
					<span className={classes.badge}>{count}</span>
				</div>
			</div>

			<div className={classes.list}>
				{loading && !count
					? arrayFrom(3).map((_, index) => (
							<Skeleton.Input
								key={index}
								active
								className={classes.skeleton}
								block
							/>
						))
					: courses.map((course) => (
							<MyCourseCard
								key={course.id}
								course={course}
								onClick={
									onCourseClick ? () => onCourseClick(course) : undefined
								}
								onReview={onReview ? () => onReview(course) : undefined}
							/>
						))}
			</div>
		</div>
	)
}

export default memo(MyCourseList)
