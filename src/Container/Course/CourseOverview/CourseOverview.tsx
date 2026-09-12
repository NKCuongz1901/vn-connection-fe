import React from 'react'
import classes from './CourseOverview.module.scss'
import useCourse from '@/hooks/Course/useCourse'
import ShareCourse from '@/Components/Course/ShareCourse/ShareCourse'
import CourseList from '@/Components/Course/CourseList/CourseList'
import MyCourseList from '@/Components/Course/MyCourseList/MyCourseList'
import TrackingCourseList from '@/Components/Course/TrackingCourseList/TrackingCourseList'

function CourseOverview() {
	const { loading, listCourse, myPurchasedCourse, trackingCourse } = useCourse()
	const hasPurchasedCourse = myPurchasedCourse.length > 0

	const _renderTopSection = () => {
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
						/>
					</div>
					<div className={classes.myCourseList}>
						<MyCourseList
							courses={myPurchasedCourse}
							loading={loading.myPurchasedCourse}
						/>
					</div>
				</div>
			</div>
		)
	}
	const _renderBottomSection = () => {
		return (
			<div className={classes.bottomSection}>
				<ShareCourse />
				<CourseList courses={listCourse} loading={loading.listCourse} />
			</div>
		)
	}
	return (
		<div className={classes.container}>
			{_renderTopSection()}
			{_renderBottomSection()}
		</div>
	)
}

export default CourseOverview
