'use client'

import { memo } from 'react'
import { Skeleton } from 'antd'

import TrackingCourseCard from '@/Components/Course/TrackingCourseCard/TrackingCourseCard'
import { TrackingCourse } from '@/interface/Course/Course.interface'
import { arrayFrom } from '@/ultis/array'

import classes from './TrackingCourseList.module.scss'

type TrackingCourseListProps = {
	items: TrackingCourse[]
	loading?: boolean
	onItemClick?: (item: TrackingCourse) => void
}

function TrackingCourseList({
	items,
	loading,
	onItemClick,
}: TrackingCourseListProps) {
	return (
		<div className={classes.wrapper}>
			{loading && !items.length
				? arrayFrom(3).map((_, index) => (
						<Skeleton.Input
							key={index}
							active
							className={classes.skeleton}
							block
						/>
					))
				: items.map((item) => (
						<TrackingCourseCard
							key={item.course.id}
							tracking={item}
							onClick={onItemClick ? () => onItemClick(item) : undefined}
						/>
					))}
		</div>
	)
}

export default memo(TrackingCourseList)
