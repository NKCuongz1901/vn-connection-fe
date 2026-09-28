'use client'

import { memo } from 'react'

import ShareIcon from '@/svg/FriendSvg/ShareIcon'
import CourseStarIcon from '@/svg/Course/CourseStarIcon'
import { Course, CourseLearningType } from '@/interface/Course/Course.interface'
import { formatNumberString } from '@/ultis/string'

import classes from './CourseCard.module.scss'

const LEARNING_TYPE_LABEL: Record<CourseLearningType, string> = {
	ai_feedback: 'UniVini AI feedback',
	online: 'Online',
	learn_with_classmates: 'Learn with Human Tutors & Classmates',
}

type CourseCardProps = {
	course: Course
	onClick?: () => void
	onShare?: () => void
}

const formatCoursePrice = (price: string) => {
	const formatted = formatNumberString(price)
	if (!formatted) return ''
	return `${formatted} đ`
}

const MetaRow = ({ items }: { items: string[] }) => {
	if (!items.length) return null

	return (
		<div className={classes.metaRow}>
			{items.map((item, index) => (
				<span key={`${item}-${index}`} className={classes.metaItem}>
					{index > 0 ? <span className={classes.divider} /> : null}
					{item}
				</span>
			))}
		</div>
	)
}

function CourseCard({ course, onClick, onShare }: CourseCardProps) {
	const { custom_data } = course
	const learningTypes = custom_data?.learning_type || []
	const featureTags = [
		custom_data?.language_type,
		...learningTypes
			.filter((type) => type !== 'online')
			.map((type) => LEARNING_TYPE_LABEL[type]),
	].filter(Boolean) as string[]
	const scheduleTags = [
		custom_data?.learning_estimate,
		learningTypes.includes('online') ? LEARNING_TYPE_LABEL.online : null,
	].filter(Boolean) as string[]
	const rating = course.review_rating ? course.review_rating.toFixed(1) : '0'
	const reviewCount = course.review_count || 0

	const handleShare = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.stopPropagation()
		onShare?.()
	}

	return (
		<div
			className={classes.card}
			onClick={onClick}
			role={onClick ? 'button' : undefined}
		>
			<div className={classes.body}>
				<div className={classes.info}>
					<img
						src={course.avatar}
						alt=""
						className={classes.avatar}
						width={64}
						height={64}
					/>
					<div className={classes.infoText}>
						<p className={classes.title}>{course.name}</p>
						<div className={classes.details}>
							<div className={classes.review}>
								<CourseStarIcon width={12} height={12} />
								<span className={classes.rating}>{rating}</span>
								<span className={classes.reviewCount}>
									({reviewCount} reviews)
								</span>
							</div>
							<MetaRow items={featureTags} />
							<MetaRow items={scheduleTags} />
						</div>
					</div>
				</div>

				<div className={classes.footer}>
					<div className={classes.price}>
						<span>{formatCoursePrice(course.price)}</span>
						<span className={classes.dot} />
						<span>{course.duration_days} days</span>
					</div>
					<div className={classes.footerRight}>
						<p className={classes.enrolled}>
							<span className={classes.enrolledCount}>
								{course.learner_joined}
							</span>
							{` Learners enrolled`}
						</p>
						<button
							type="button"
							className={classes.shareBtn}
							onClick={handleShare}
							aria-label="Share course"
						>
							<ShareIcon fill="#006b35" />
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}

export default memo(CourseCard)
