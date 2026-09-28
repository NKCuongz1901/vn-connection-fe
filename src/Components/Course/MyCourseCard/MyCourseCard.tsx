'use client'

import { memo } from 'react'
import dayjs from 'dayjs'
import clsx from 'clsx'

import CourseStarIcon from '@/svg/Course/CourseStarIcon'
import { Course } from '@/interface/Course/Course.interface'
import { formatNumberString } from '@/ultis/string'

import classes from './MyCourseCard.module.scss'

type MyCourseCardProps = {
	course: Course
	onClick?: () => void
	onReview?: () => void
}

const formatCoursePrice = (price: string) => {
	const formatted = formatNumberString(price)
	if (!formatted) return ''
	return `${formatted} đ`
}

const getDaysLeft = (course: Course) => {
	const userCourse = course.userCourse
	const start =
		userCourse?.day_started || userCourse?.last_payment_at || course.start_date
	if (!start) return course.duration_days
	const elapsed = dayjs()
		.startOf('day')
		.diff(dayjs(start).startOf('day'), 'day')
	return Math.max(course.duration_days - elapsed, 0)
}

const getStatusBadge = (course: Course) => {
	const status = course.userCourse?.status
	if (status === 'complete') {
		return { label: 'Completed', tone: 'completed' as const }
	}
	if (status === 'inactive') {
		return { label: 'Inactive', tone: 'inactive' as const }
	}
	const daysLeft = getDaysLeft(course)
	return { label: `${daysLeft} days left`, tone: 'active' as const }
}

function MyCourseCard({ course, onClick, onReview }: MyCourseCardProps) {
	const userCourse = course.userCourse
	const purchaseDate = userCourse?.last_payment_at || userCourse?.created_at
	const dateLabel = purchaseDate ? dayjs(purchaseDate).format('DD/MM/YYYY') : ''
	const badge = getStatusBadge(course)
	const showReview =
		userCourse?.status === 'complete' || userCourse?.status === 'active'

	const handleReview = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.stopPropagation()
		onReview?.()
	}

	return (
		<div
			className={classes.card}
			onClick={onClick}
			role={onClick ? 'button' : undefined}
		>
			<div className={classes.header}>
				<p className={classes.date}>{dateLabel}</p>
				<span className={clsx(classes.badge, classes[badge.tone])}>
					{badge.label}
				</span>
			</div>

			<div className={classes.divider} />

			<div className={classes.content}>
				<div className={classes.info}>
					<p className={classes.title}>{course.type}</p>
					<p className={classes.instructor}>
						{course.owner?.name || 'UniVini AI'}
					</p>
					<div className={classes.price}>
						<span>{formatCoursePrice(course.price)}</span>
						<span className={classes.dot} />
						<span>{course.duration_days} days</span>
					</div>
				</div>
				<img
					src={course.avatar}
					alt=""
					className={classes.avatar}
					width={64}
					height={64}
				/>
			</div>

			{showReview ? (
				<>
					<div className={classes.divider} />
					<button
						type="button"
						className={classes.reviewBtn}
						onClick={handleReview}
					>
						<CourseStarIcon fill="#0f1729" width={16} height={16} />
						<span>Review course</span>
					</button>
				</>
			) : null}
		</div>
	)
}

export default memo(MyCourseCard)
