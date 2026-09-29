import React, { useState } from 'react'
import { Skeleton } from 'antd'
import classes from './CourseOverview.module.scss'
import useCourse from '@/hooks/Course/useCourse'
import { mainRoutes } from '@/routes/MainRoutes'
import { useLocalePath } from '@/ultis/route'
import ShareCourse from '@/Components/Course/ShareCourse/ShareCourse'
import CourseList from '@/Components/Course/CourseList/CourseList'
import MyCourseList from '@/Components/Course/MyCourseList/MyCourseList'
import TrackingCourseList from '@/Components/Course/TrackingCourseList/TrackingCourseList'
import CourseReferralModal from '@/Components/Course/CourseReferralModal/CourseReferralModal'
import useCourseReferralCapture from '@/hooks/Course/useCourseReferralCapture'

function CourseOverview() {
	const {
		loading,
		listCourse,
		myPurchasedCourse,
		trackingCourse,
		referralGlobalLink,
		referralGlobalCode,
	} = useCourse()
	const { onChangeRoute } = useLocalePath()
	// The global REF link opens the Course pages (UNIWEB-696).
	useCourseReferralCapture()
	const [referralModalOpen, setReferralModalOpen] = useState(false)
	const isPurchasedReady = !loading.myPurchasedCourse
	const hasPurchasedCourse = myPurchasedCourse.length > 0

	// The web has no classroom yet, so a course card opens the course detail,
	// which offers Go to classroom for a course the learner has.
	const openCourse = (courseId?: string) => {
		if (!courseId) return
		onChangeRoute(`${mainRoutes.course}/${courseId}`)
	}

	const _renderTopSection = () => {
		if (!isPurchasedReady) {
			return (
				<div className={classes.topSection}>
					<Skeleton.Input active className={classes.topSkeleton} block />
				</div>
			)
		}
		if (!hasPurchasedCourse) {
			return (
				<div className={classes.topSection}>
					<div className={classes.bannerWrapper} />
				</div>
			)
		}
		return (
			<div className={classes.topSection}>
				<div className={classes.myCourseWrapper}>
					<div className={classes.myTrackingList}>
						<TrackingCourseList
							items={trackingCourse}
							loading={loading.trackingCourse}
							onItemClick={(item) => openCourse(item.course?.id)}
						/>
					</div>
					<div className={classes.myCourseList}>
						<MyCourseList
							courses={myPurchasedCourse}
							loading={loading.myPurchasedCourse}
							onCourseClick={(course) => openCourse(course.id)}
							onSeeAll={() => onChangeRoute(mainRoutes.courseMyCourse)}
						/>
					</div>
				</div>
			</div>
		)
	}
	const _renderBottomSection = () => {
		return (
			<div className={classes.bottomSection}>
				<ShareCourse onShare={() => setReferralModalOpen(true)} />
				<CourseList
					courses={listCourse}
					loading={loading.listCourse}
					onSeeAll={() => onChangeRoute(mainRoutes.courseList)}
					onShare={() => setReferralModalOpen(true)}
					onCourseClick={(course) => openCourse(course.id)}
				/>
			</div>
		)
	}
	return (
		<div className={classes.container}>
			{_renderTopSection()}
			{_renderBottomSection()}
			<CourseReferralModal
				open={referralModalOpen}
				onClose={() => setReferralModalOpen(false)}
				referralCode={referralGlobalCode}
				shareLink={referralGlobalLink}
			/>
		</div>
	)
}

export default CourseOverview
