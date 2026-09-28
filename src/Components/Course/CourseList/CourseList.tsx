'use client'

import { memo } from 'react'
import { Skeleton } from 'antd'
import { IconChevronRight } from '@tabler/icons-react'

import CourseCard from '@/Components/Course/CourseCard/CourseCard'
import { Course } from '@/interface/Course/Course.interface'
import { arrayFrom } from '@/ultis/array'

import classes from './CourseList.module.scss'

type CourseListProps = {
	courses: Course[]
	loading?: boolean
	onCourseClick?: (course: Course) => void
	onShare?: (course: Course) => void
	onSeeAll?: () => void
}

/** Catalog list: heading, count badge, and CourseCards. */
function CourseList({
	courses,
	loading,
	onCourseClick,
	onShare,
	onSeeAll,
}: CourseListProps) {
	const count = courses.length

	return (
		<div className={classes.wrapper}>
			<div className={classes.heading}>
				<button
					type="button"
					className={classes.titleRow}
					onClick={onSeeAll}
					disabled={!onSeeAll}
				>
					<p className={classes.title}>UniVini Course: Learn smarter, faster</p>
					<span className={classes.badge}>{count}</span>
					<IconChevronRight size={16} color="#0f1729" stroke={1.8} />
				</button>
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
							<CourseCard
								key={course.id}
								course={course}
								onClick={
									onCourseClick ? () => onCourseClick(course) : undefined
								}
								onShare={onShare ? () => onShare(course) : undefined}
							/>
						))}
			</div>
		</div>
	)
}

export default memo(CourseList)
