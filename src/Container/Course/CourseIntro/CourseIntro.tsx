'use client'

import { memo, useEffect } from 'react'
import { motion } from 'framer-motion'

import TickCircleIcon from '@/svg/TickCircleIcon'
import useCourseReferralCapture from '@/hooks/Course/useCourseReferralCapture'
import { mainRoutes } from '@/routes/MainRoutes'
import { useLocalePath } from '@/ultis/route'

import classes from './CourseIntro.module.scss'

const REDIRECT_DELAY_MS = 2000

const FEATURES = [
	{
		id: 'tutors',
		iconSrc: '/images/course/tutors.png',
		iconBg: '#e7f5e9',
		parts: [
			{ text: 'Learn & talk with ' },
			{ text: 'Human Tutors ', highlight: true },
			{ text: 'every day' },
		],
	},
	{
		id: 'ai-feedback',
		iconSrc: '/images/course/ai-feedback.png',
		iconBg: '#e1f5fe',
		parts: [
			{ text: 'Complete daily exercises & get ' },
			{ text: 'instant AI feedback', highlight: true },
		],
	},
	{
		id: 'progress',
		iconSrc: '/images/course/progress.png',
		iconBg: '#fff5eb',
		parts: [
			{ text: 'Track your learning progress throughout' },
			{ text: ' 90 days', highlight: true },
		],
	},
] as const

const contentVariants = {
	hidden: { opacity: 0 },
	show: {
		opacity: 1,
		transition: { staggerChildren: 0.2, delayChildren: 0.1 },
	},
}

const featuresVariants = {
	hidden: { opacity: 0 },
	show: {
		opacity: 1,
		transition: { staggerChildren: 0.15 },
	},
}

const itemVariants = {
	hidden: { opacity: 0 },
	show: {
		opacity: 1,
		transition: { duration: 0.45, ease: 'easeOut' as const },
	},
}

/** Full-page Course intro splash; redirects to Course overview after a short delay. */
function CourseIntro() {
	const { onChangeRoute } = useLocalePath()
	// A global REF link may land here; keep it before the redirect drops it.
	useCourseReferralCapture()

	useEffect(() => {
		const timer = window.setTimeout(() => {
			onChangeRoute(mainRoutes.courseOverview)
		}, REDIRECT_DELAY_MS)

		return () => window.clearTimeout(timer)
	}, [onChangeRoute])

	return (
		<div className={classes.page}>
			<motion.div
				className={classes.content}
				variants={contentVariants}
				initial="hidden"
				animate="show"
			>
				<motion.div className={classes.heading} variants={itemVariants}>
					<p className={classes.brand}>UniVini</p>
					<div className={classes.title}>
						<span className={classes.titlePrimary}>90-DAY</span>
						<span className={classes.titleSecondary}>COURSES</span>
					</div>
				</motion.div>

				<motion.div
					className={classes.features}
					variants={featuresVariants}
				>
					{FEATURES.map((feature) => (
						<motion.div
							key={feature.id}
							className={classes.feature}
							variants={itemVariants}
						>
							<div
								className={classes.illustration}
								style={{ background: feature.iconBg }}
							>
								<img
									src={feature.iconSrc}
									alt=""
									className={classes.illustrationImg}
									width={64}
									height={64}
								/>
								<span className={classes.tick}>
									<TickCircleIcon fill="#1B8024" width={20} height={20} />
								</span>
							</div>
							<p className={classes.featureText}>
								{feature.parts.map((part, index) =>
									part.highlight ? (
										<span key={index} className={classes.featureHighlight}>
											{part.text}
										</span>
									) : (
										<span key={index}>{part.text}</span>
									),
								)}
							</p>
						</motion.div>
					))}
				</motion.div>
			</motion.div>
		</div>
	)
}

export default memo(CourseIntro)
