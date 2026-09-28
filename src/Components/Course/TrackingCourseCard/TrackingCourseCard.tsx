'use client'

import { memo } from 'react'
import dayjs from 'dayjs'
import { IconClock } from '@tabler/icons-react'

import { TrackingCourse } from '@/interface/Course/Course.interface'
import { mappingLanguageCode } from '@/Variable/common.variable'
import { formatNumberString } from '@/ultis/string'

import classes from './TrackingCourseCard.module.scss'

type TrackingCourseCardProps = {
	tracking: TrackingCourse
	onClick?: () => void
}

const formatScore = (score: number | null) => `${score ?? 0}%`

const formatNextExercise = (iso: string | null) => {
	if (!iso) return ''
	const date = dayjs(iso)
	const time = date.format('h:mmA')
	if (date.isSame(dayjs(), 'day')) return `Today, ${time}`
	if (date.isSame(dayjs().add(1, 'day'), 'day')) return `Tomorrow, ${time}`
	return `${date.format('DD/MM')}, ${time}`
}

const getLanguageLabel = (code?: string) => {
	if (!code) return ''
	const match = Object.entries(mappingLanguageCode).find(
		([, languageCode]) => languageCode === code,
	)
	return match?.[0] || code
}

/** Progress card for a purchased course: scores, ranking, next slot. */
function TrackingCourseCard({ tracking, onClick }: TrackingCourseCardProps) {
	const { course } = tracking
	const language = getLanguageLabel(course.supported_language?.[0])
	const nextExercise = formatNextExercise(tracking.next_exercise)
	const ranking = formatNumberString(tracking.class_ranking)
	const classSize = formatNumberString(course.learner_joined)
	const yesterdayTone =
		tracking.yesterday_score != null && tracking.yesterday_score >= 50
			? 'action'
			: 'error'
	const lastWeekTone =
		tracking.last_week_score != null && tracking.last_week_score >= 50
			? 'action'
			: 'error'

	return (
		<div
			className={classes.card}
			onClick={onClick}
			role={onClick ? 'button' : undefined}
		>
			<div className={classes.content}>
				<div className={classes.artwork}>
					<img
						src={course.avatar}
						alt=""
						className={classes.avatar}
						width={120}
						height={120}
					/>
				</div>

				<div className={classes.textFrame}>
					<div className={classes.totalScore}>
						<div className={classes.title}>
							<p className={classes.courseType}>{course.type}</p>
							{language ? (
								<>
									<span className={classes.titleDivider} />
									<p className={classes.language}>{language}</p>
								</>
							) : null}
						</div>
						<div className={classes.scoreBlock}>
							<p className={classes.scoreLabel}>Your total score:</p>
							<p className={classes.totalValue}>
								{formatScore(tracking.total_score)}
							</p>
							<p className={classes.ranking}>
								Your ranking{' '}
								<span className={classes.rankingValue}>{ranking}</span>
								{classSize ? ` of ${classSize}` : ''}
							</p>
						</div>
					</div>

					<div className={classes.columnDivider} />

					<div className={classes.history}>
						<div className={classes.historyItem}>
							<p className={classes.historyLabel}>Yesterday</p>
							<p className={classes[yesterdayTone]}>
								{formatScore(tracking.yesterday_score)}
							</p>
						</div>
						<div className={classes.historyItem}>
							<p className={classes.historyLabel}>Last week</p>
							<p className={classes[lastWeekTone]}>
								{formatScore(tracking.last_week_score)}
							</p>
						</div>
					</div>
				</div>
			</div>

			<div className={classes.nextExercise}>
				<div className={classes.nextExerciseInner}>
					<div className={classes.nextTitle}>
						<IconClock
							size={20}
							stroke={1.5}
							color="#0f1729"
							className={classes.clockIcon}
						/>
						<p>Next exercise</p>
					</div>
					{nextExercise ? (
						<span className={classes.nextDate}>{nextExercise}</span>
					) : null}
				</div>
			</div>
		</div>
	)
}

export default memo(TrackingCourseCard)
