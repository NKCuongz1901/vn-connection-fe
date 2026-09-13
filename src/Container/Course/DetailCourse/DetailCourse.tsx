'use client'

import { useMemo, useState } from 'react'
import { IconArrowLeft } from '@tabler/icons-react'
import { Skeleton } from 'antd'

import ContributeIdeaModal from '@/Components/Course/ContributeIdeaModal'
import CourseDetail from '@/Components/Course/CourseDetail/CourseDetail'
import CourseReferralModal from '@/Components/Course/CourseReferralModal/CourseReferralModal'
import ModalReport from '@/Components/Custom/ModalReport'
import useCourse from '@/hooks/Course/useCourse'
import { mainRoutes } from '@/routes/MainRoutes'
import { useLocalePath } from '@/ultis/route'
import { getCourseReportIssueTypes } from '@/Variable/common.variable'

import classes from './DetailCourse.module.scss'

function DetailCourse({ id }: { id: string }) {
	const { locale, onChangeRoute } = useLocalePath()
	const {
		courseDetail,
		loading,
		referralGlobalLink,
		referralGlobalCode,
		handleReportCourse,
		handleContributeIdea,
	} = useCourse(id)
	const [referralModalOpen, setReferralModalOpen] = useState(false)
	const [reportOpen, setReportOpen] = useState(false)
	const [contributeOpen, setContributeOpen] = useState(false)
	const courseIssueTypes = useMemo(
		() => getCourseReportIssueTypes(locale as string),
		[locale],
	)
	const reportHeaderTitle =
		locale === 'vi'
			? 'Cho chúng tôi biết vấn đề của bạn'
			: 'Tell us your issue'

	const handleBack = () => {
		onChangeRoute(mainRoutes.courseOverview)
	}

	return (
		<div className={classes.wrapper}>
			<button type="button" className={classes.heading} onClick={handleBack}>
				<IconArrowLeft
					size={20}
					color="#0f1729"
					stroke={1.5}
					className={classes.backIcon}
				/>
				<p className={classes.title}>UniVini Course details</p>
			</button>

			<div className={classes.container}>
				{loading.courseDetail && !courseDetail ? (
					<Skeleton.Input active className={classes.skeleton} block />
				) : courseDetail ? (
					<CourseDetail
						course={courseDetail}
						onShare={() => setReferralModalOpen(true)}
						onReport={() => setReportOpen(true)}
						onContribute={() => setContributeOpen(true)}
					/>
				) : null}
			</div>

			<CourseReferralModal
				open={referralModalOpen}
				onClose={() => setReferralModalOpen(false)}
				referralCode={referralGlobalCode}
				shareLink={referralGlobalLink}
			/>
			<ModalReport
				open={reportOpen}
				onClose={() => setReportOpen(false)}
				title="Report"
				headerTitle={reportHeaderTitle}
				issueTypes={courseIssueTypes}
				maxMedia={1}
				data={{ report_target_id: courseDetail?.id || id }}
				onReport={handleReportCourse}
				message="You want to report this course?"
			/>
			<ContributeIdeaModal
				open={contributeOpen}
				onClose={() => setContributeOpen(false)}
				onSubmit={handleContributeIdea}
			/>
		</div>
	)
}

export default DetailCourse
