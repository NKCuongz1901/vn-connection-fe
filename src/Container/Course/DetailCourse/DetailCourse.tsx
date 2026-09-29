'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { IconArrowLeft } from '@tabler/icons-react'
import { Skeleton } from 'antd'

import ContributeIdeaModal from '@/Components/Course/ContributeIdeaModal'
import CourseDetail, {
	CourseDetailAction,
} from '@/Components/Course/CourseDetail/CourseDetail'
import CourseDiscountModal from '@/Components/Course/CourseDiscountModal'
import CourseLanguageModal from '@/Components/Course/CourseLanguageModal'
import CourseReferralModal from '@/Components/Course/CourseReferralModal/CourseReferralModal'
import ModalReport from '@/Components/Custom/ModalReport'
import useCourse from '@/hooks/Course/useCourse'
import { mainRoutes } from '@/routes/MainRoutes'
import {
	canStartFreeTrial,
	isCourseEnrolled,
} from '@/ultis/courseEnrollment'
import { useLocalePath } from '@/ultis/route'
import { getCourseReportIssueTypes } from '@/Variable/common.variable'

import classes from './DetailCourse.module.scss'

/** Actions that need a learning language first, as in the app. */
type PendingLanguageAction = 'buy' | 'trial' | null

function DetailCourse({ id }: { id: string }) {
	const { locale, onChangeRoute } = useLocalePath()
	const {
		courseDetail,
		loading,
		referralGlobalLink,
		referralGlobalCode,
		handleReportCourse,
		handleContributeIdea,
		paymentInforCourse,
		handleGetPaymentLink,
		handleStartFreeTrial,
	} = useCourse(id)
	const [referralModalOpen, setReferralModalOpen] = useState(false)
	const [reportOpen, setReportOpen] = useState(false)
	const [contributeOpen, setContributeOpen] = useState(false)
	const [languageOpen, setLanguageOpen] = useState(false)
	const [discountOpen, setDiscountOpen] = useState(false)
	const [selectedLanguageCode, setSelectedLanguageCode] = useState('')
	const pendingActionRef = useRef<PendingLanguageAction>(null)

	useEffect(() => {
		setSelectedLanguageCode(courseDetail?.userCourse?.target_language || '')
	}, [courseDetail?.userCourse?.target_language])
	const courseIssueTypes = useMemo(
		() => getCourseReportIssueTypes(locale as string),
		[locale],
	)
	const reportHeaderTitle =
		locale === 'vi' ? 'Cho chúng tôi biết vấn đề của bạn' : 'Tell us your issue'

	const isEnrolled = isCourseEnrolled(courseDetail, paymentInforCourse)
	const trialAvailable = !isEnrolled && canStartFreeTrial(courseDetail)
	const isFirstPaymentDiscount =
		paymentInforCourse?.is_first_payment_discount === true
	const primaryAction: CourseDetailAction = isEnrolled
		? 'classroom'
		: trialAvailable
			? 'trial'
			: isFirstPaymentDiscount
				? 'discount'
				: 'buy'

	const handleBack = () => {
		onChangeRoute(mainRoutes.courseOverview)
	}

	/** Starts OnePay checkout; the server applies any first-course discount. */
	const startPayment = (languageCode: string) => {
		if (!id || !languageCode) return
		setDiscountOpen(false)
		handleGetPaymentLink(id, languageCode, locale as string)
	}

	const runAction = (action: 'buy' | 'trial', languageCode: string) => {
		if (action === 'trial') {
			handleStartFreeTrial(id, languageCode)
			return
		}
		if (isFirstPaymentDiscount) {
			setDiscountOpen(true)
			return
		}
		startPayment(languageCode)
	}

	/** Asks for the learning language first when none is chosen yet. */
	const requireLanguage = (action: 'buy' | 'trial') => {
		if (selectedLanguageCode) {
			runAction(action, selectedLanguageCode)
			return
		}
		pendingActionRef.current = action
		setLanguageOpen(true)
	}

	/**
	 * The classroom exists only in the app for now, so the web sends the
	 * learner to the page that opens or installs it.
	 */
	const handleGoToClassroom = () => {
		onChangeRoute(`open-app?type=course&id=${encodeURIComponent(id)}`)
	}

	const handlePrimaryAction = () => {
		if (primaryAction === 'classroom') {
			handleGoToClassroom()
			return
		}
		requireLanguage(primaryAction === 'trial' ? 'trial' : 'buy')
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
						paymentInforCourse={paymentInforCourse || null}
						selectedLanguageCode={selectedLanguageCode}
						primaryAction={primaryAction}
						onShare={() => setReferralModalOpen(true)}
						onReport={() => setReportOpen(true)}
						onContribute={() => setContributeOpen(true)}
						onSelectLanguage={() => {
							pendingActionRef.current = null
							setLanguageOpen(true)
						}}
						onPrimaryAction={handlePrimaryAction}
						isBusy={loading.paymentLink || loading.freeTrial}
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
			<CourseLanguageModal
				open={languageOpen}
				onClose={() => {
					pendingActionRef.current = null
					setLanguageOpen(false)
				}}
				supportedLanguage={courseDetail?.supported_language || []}
				initialSelectedCode={selectedLanguageCode}
				onConfirm={(code) => {
					setSelectedLanguageCode(code)
					setLanguageOpen(false)
					const action = pendingActionRef.current
					pendingActionRef.current = null
					if (action && code) runAction(action, code)
				}}
			/>
			<CourseDiscountModal
				open={discountOpen}
				onClose={() => setDiscountOpen(false)}
				paymentInfor={paymentInforCourse}
				onPayNow={() => startPayment(selectedLanguageCode)}
				isPaying={loading.paymentLink}
			/>
		</div>
	)
}

export default DetailCourse
