'use client'

import { memo, useState } from 'react'
import { Dropdown } from 'antd'
import { IconChevronDown, IconDeviceMobileMessage } from '@tabler/icons-react'

import ContributeIcon from '@/svg/Course/ContributeIcon'
import CourseStarIcon from '@/svg/Course/CourseStarIcon'
import FlagIcon from '@/svg/FlagIcon'
import InfoCircleIcon from '@/svg/InfoCircleIcon'
import Messenger from '@/svg/Messenger'
import MoreSvg from '@/svg/MoreIcon'
import ShareIcon from '@/svg/FriendSvg/ShareIcon'
import TickCircleIcon from '@/svg/TickCircleIcon'
import {
	Course,
	CourseLearningType,
	CourseSlotPrototype,
	PaymentInforCourse,
} from '@/interface/Course/Course.interface'
import { formatNumberString } from '@/ultis/string'
import { OVERVIEW_GUEST_CHAT_ROOMS } from '@/Variable/overviewGuestChatRooms.variable'

import classes from './CourseDetail.module.scss'

const LEARNING_TYPE_LABEL: Record<CourseLearningType, string> = {
	ai_feedback: 'UniVini AI Feedback',
	online: 'Online',
	learn_with_classmates: 'Learn with Human Tutors & Classmates',
}

const TARGET_LANGUAGE_TEXT =
	'Please select the language you want to learn before proceeding with the course payment.'

const ABOUT_WARNING_TEXT =
	'If you miss 9 days of submissions during the 90-day course, you’ll be removed from the class.'

const SHARE_TICKER_TEXT = 'Share & earn 10% per sale'

type CourseDetailProps = {
	course: Course
	paymentInforCourse: PaymentInforCourse
	selectedLanguageCode?: string
	onShare?: () => void
	onReport?: () => void
	onContribute?: () => void
	onSelectLanguage?: () => void
}

const formatCoursePrice = (price: string) => {
	const formatted = formatNumberString(price)
	if (!formatted) return ''
	return `${formatted} đ`
}

const formatSlotTime = (time: string) => {
	if (!time) return ''
	if (time === '24:00') return '00:00'
	const [hour, minute] = time.split(':')
	return `${hour.padStart(2, '0')}:${(minute || '00').padStart(2, '0')}`
}

/** Builds a display range from UTC start/end, e.g. "01:00 - 01:30". */
const formatSlotRange = (slot: CourseSlotPrototype) => {
	const start = formatSlotTime(slot.start_time_utc)
	const end = formatSlotTime(slot.end_time_utc)
	if (!start || !end) return ''
	return `${start} - ${end}`
}

const splitSlotColumns = (slots: CourseSlotPrototype[]) => {
	const mid = Math.ceil(slots.length / 2)
	return [slots.slice(0, mid), slots.slice(mid)]
}

function CourseDetail({
	course,
	paymentInforCourse,
	selectedLanguageCode,
	onShare,
	onReport,
	onContribute,
	onSelectLanguage,
}: CourseDetailProps) {
	const { custom_data, slot_prototype, owner } = course
	const learningTypes = custom_data?.learning_type || []
	const scheduleDescription = custom_data?.schedule_description || ''
	const aboutDescription = custom_data?.about_description || ''
	const courseDescription = custom_data?.course_description || ''
	const slots = slot_prototype || []
	const [leftSlots, rightSlots] = splitSlotColumns(slots)
	const rating = course.review_rating ? course.review_rating.toFixed(1) : '0'
	const reviewCount = course.review_count || 0
	const featureLine = [
		custom_data?.language_type,
		learningTypes.includes('ai_feedback')
			? LEARNING_TYPE_LABEL.ai_feedback
			: null,
	]
		.filter(Boolean)
		.join(' | ')
	const classmateLine = learningTypes.includes('learn_with_classmates')
		? LEARNING_TYPE_LABEL.learn_with_classmates
		: ''
	const selectedLanguage = OVERVIEW_GUEST_CHAT_ROOMS.find(
		(item) => item.code?.toLowerCase() === selectedLanguageCode?.toLowerCase(),
	)
	const [moreOpen, setMoreOpen] = useState(false)
	const moreItems = [
		{
			key: 'contribute',
			icon: <ContributeIcon />,
			label: 'Contribute ideas',
			onClick: onContribute,
		},
		{
			key: 'share',
			icon: <ShareIcon fill="#48546B" />,
			label: 'Share',
			onClick: onShare,
		},
		{
			key: 'report',
			icon: <FlagIcon fill="#48546B" />,
			label: 'Report',
			onClick: onReport,
		},
	]

	const handleMoreItem = (onClick?: () => void) => {
		setMoreOpen(false)
		onClick?.()
	}

	return (
		<div className={classes.wrapper}>
			<section className={classes.hero}>
				<div className={classes.cover}>
					<img
						src={course.avatar}
						alt=""
						className={classes.coverImage}
						width={392}
						height={220}
					/>
					<Dropdown
						open={moreOpen}
						onOpenChange={setMoreOpen}
						trigger={['click']}
						placement="bottomRight"
						dropdownRender={() => (
							<div className={classes.moreMenu}>
								{moreItems.map((item) => (
									<button
										key={item.key}
										type="button"
										className={classes.moreItem}
										onClick={() => handleMoreItem(item.onClick)}
									>
										<span className={classes.moreIcon}>{item.icon}</span>
										<span className={classes.moreLabel}>{item.label}</span>
									</button>
								))}
							</div>
						)}
					>
						<button
							type="button"
							className={classes.moreBtn}
							aria-label="More actions"
						>
							<MoreSvg width={20} height={20} fill="#0f1729" />
						</button>
					</Dropdown>
				</div>

				<div className={classes.heroBody}>
					<div className={classes.titleBlock}>
						<h1 className={classes.courseName}>{course.name}</h1>
						<div className={classes.rating}>
							<CourseStarIcon width={16} height={16} />
							<span className={classes.ratingValue}>{rating}</span>
							<span className={classes.reviewCount}>
								({reviewCount} reviews)
							</span>
						</div>
						<div className={classes.metaRow}>
							<div className={classes.price}>
								<span>{formatCoursePrice(course.price)}</span>
								<span className={classes.priceDot} />
								<span>{course.duration_days} days</span>
							</div>
							<span className={classes.metaDivider} />
							<p className={classes.enrolled}>
								<span className={classes.enrolledCount}>
									{course.learner_joined}
								</span>
								{` Learners enrolled`}
							</p>
						</div>
					</div>

					<button type="button" className={classes.ticker} onClick={onShare}>
						<div className={classes.tickerTrack}>
							{Array.from({ length: 6 }).map((_, index) => (
								<span key={index} className={classes.tickerItem}>
									{SHARE_TICKER_TEXT}
									<ShareIcon fill="#1b8024" />
								</span>
							))}
						</div>
					</button>

					<div className={classes.ctaRow}>
						<div className={classes.practice}>
							<div className={classes.practiceIcon}>
								<IconDeviceMobileMessage
									size={20}
									stroke={1.5}
									color="#48546b"
								/>
							</div>
							<div className={classes.practiceText}>
								<p className={classes.practiceLabel}>Practice every day</p>
								<p className={classes.practiceValue}>
									{learningTypes.includes('online')
										? LEARNING_TYPE_LABEL.online
										: custom_data?.learning_estimate || 'Online'}
								</p>
							</div>
						</div>
						<button
							type="button"
							className={`${classes.buyBtn} ${
								selectedLanguageCode ? classes.buyBtnActive : ''
							}`}
							disabled={!selectedLanguageCode}
						>
							{paymentInforCourse?.is_first_payment_discount === true
								? 'Get discount'
								: 'Buy now'}
						</button>
					</div>
				</div>
			</section>

			{owner ? (
				<section className={classes.card}>
					<div className={classes.owner}>
						<img
							src={owner.avatar}
							alt=""
							className={classes.ownerAvatar}
							width={48}
							height={48}
						/>
						<div className={classes.ownerInfo}>
							<div className={classes.ownerNameRow}>
								<p className={classes.ownerName}>{owner.name}</p>
								<TickCircleIcon fill="#006b35" width={16} height={16} />
							</div>
							{featureLine ? (
								<p className={classes.ownerFeature}>{featureLine}</p>
							) : null}
							{classmateLine ? (
								<p className={classes.ownerFeature}>{classmateLine}</p>
							) : null}
							<div className={classes.ownerStats}>
								<p>
									Course Sold <span>{owner.total_course}</span>
								</p>
								<p>
									Learners <span>{owner.total_learners}</span>
								</p>
							</div>
						</div>
						<button
							type="button"
							className={classes.messageBtn}
							aria-label="Message instructor"
						>
							<Messenger fill="#fff" />
						</button>
					</div>
				</section>
			) : null}

			<section className={classes.card}>
				<div className={classes.cardHeader}>
					<h2 className={classes.cardTitle}>Target language</h2>
					<p className={classes.cardText}>{TARGET_LANGUAGE_TEXT}</p>
				</div>
				<div className={classes.languageBody}>
					<button
						type="button"
						className={classes.languageTrigger}
						onClick={onSelectLanguage}
					>
						{selectedLanguage ? (
							<span className={classes.languageValue}>
								{selectedLanguage.flag ? (
									<img
										src={selectedLanguage.flag}
										alt=""
										className={classes.languageFlag}
									/>
								) : null}
								<span>{selectedLanguage.name}</span>
							</span>
						) : (
							<span className={classes.languagePlaceholder}>
								Select language to learn
							</span>
						)}
						<IconChevronDown size={20} stroke={1.5} color="#94a3b8" />
					</button>
				</div>
			</section>

			{scheduleDescription || slots.length ? (
				<section className={classes.card}>
					<div className={classes.cardHeader}>
						<h2 className={classes.cardTitle}>Schedule</h2>
						{scheduleDescription ? (
							<p className={classes.cardText}>{scheduleDescription}</p>
						) : null}
					</div>
					{slots.length ? (
						<div className={classes.scheduleBody}>
							<div className={classes.scheduleHeader}>Everyday</div>
							<div className={classes.scheduleGrid}>
								{[leftSlots, rightSlots].map((column, columnIndex) => (
									<div key={columnIndex} className={classes.scheduleCol}>
										{column.map((slot) => {
											const range = formatSlotRange(slot)
											if (!range) return null
											return (
												<div
													key={slot.schedule_slot_id || range}
													className={classes.scheduleCell}
												>
													{range}
												</div>
											)
										})}
									</div>
								))}
							</div>
						</div>
					) : null}
				</section>
			) : null}

			<section className={classes.card}>
				<div className={classes.cardHeader}>
					<h2 className={classes.cardTitle}>Course Structure</h2>
					{courseDescription ? (
						<p className={classes.cardText}>{courseDescription}</p>
					) : null}
				</div>
				<div className={classes.structureBody}>
					<img
						src="/images/course/course_structure.png"
						alt="Exercise delivery, do and submit, feedback and reviewing"
						className={classes.structureImage}
						width={392}
						height={115}
					/>
				</div>
			</section>

			{aboutDescription ? (
				<section className={classes.card}>
					<div className={classes.cardHeader}>
						<h2 className={classes.cardTitle}>About</h2>
						<p className={classes.cardText}>{aboutDescription}</p>
					</div>
					<div className={classes.aboutBody}>
						<div className={classes.warning}>
							<InfoCircleIcon fill="#0067b8" width={16} height={16} />
							<p>{ABOUT_WARNING_TEXT}</p>
						</div>
					</div>
				</section>
			) : null}
		</div>
	)
}

export default memo(CourseDetail)
