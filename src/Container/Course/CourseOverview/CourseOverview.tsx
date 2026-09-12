import React from 'react'
import classes from './CourseOverview.module.scss'
import useCourse from '@/hooks/Course/useCourse'
import ShareCourse from '@/Components/Course/ShareCourse/ShareCourse'
import CourseList from '@/Components/Course/CourseList/CourseList'

function CourseOverview() {
	const { loading, listCourse } = useCourse()

	const _renderTopSection = () => {
		return (
			<div className={classes.topSection}>
				<div className={classes.bannerWrapper}></div>
			</div>
		)
	}
	const _renderBottomSection = () => {
		return (
			<div className={classes.bottomSection}>
				<ShareCourse />
				<CourseList
					courses={listCourse}
					loading={loading.listCourse}
				/>
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
