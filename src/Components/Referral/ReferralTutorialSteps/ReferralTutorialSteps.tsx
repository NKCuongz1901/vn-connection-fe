'use client'

import { memo, useState } from 'react'

import ModalProfileComplete from '@/Components/Notification/ModalProfileComplete/ModalProfileComplete'
import { mainRoutes } from '@/routes/MainRoutes'
import { useLocalePath } from '@/ultis/route'

import {
	REFERRAL_TUTORIAL_STEPS,
	type ReferralTutorialStepItem,
} from './referralTutorialSteps.constants'
import classes from './ReferralTutorialSteps.module.scss'

type CompleteProfileData = {
	about_me?: boolean
	email_verified?: boolean
	profile_photo?: boolean
	interests?: boolean
	friend_about?: boolean
	languages?: boolean
	countries?: boolean
	reference_1?: boolean
	reference_2?: boolean
	point?: number
}

interface ReferralTutorialStepsProps {
	completeData?: CompleteProfileData
	onCompleteProfile?: () => void
}

function ReferralTutorialSteps({
	completeData,
	onCompleteProfile,
}: ReferralTutorialStepsProps) {
	const [openModalProfileComplete, setOpenModalProfileComplete] =
		useState(false)
	const { onChangeRoute } = useLocalePath()

	const handleOpenProfileCompleteModal = () => {
		setOpenModalProfileComplete(true)
	}

	const handleCompleteProfile = () => {
		setOpenModalProfileComplete(false)
		if (onCompleteProfile) {
			onCompleteProfile()
			return
		}
		onChangeRoute(mainRoutes.profile)
	}

	const renderStepContent = (item: ReferralTutorialStepItem) => {
		if (item.step === 2) {
			return (
				<>
					Earn 1 point when a friend completes{' '}
					<span
						className={classes.highlight}
						onClick={handleOpenProfileCompleteModal}
						onKeyDown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								handleOpenProfileCompleteModal()
							}
						}}
						role="button"
						tabIndex={0}
					>
						50%
					</span>{' '}
					their profile
				</>
			)
		}

		return item.content
	}

	return (
		<div className={classes.wrapper}>
			<div className={classes.header}>
				<h3 className={classes.title}>3 steps to receive rewards</h3>
				<p className={classes.description}>
					Guide your friends to complete the following steps to receive gifts
				</p>
			</div>
			<div className={classes.steps}>
				{REFERRAL_TUTORIAL_STEPS.map((item) => (
					<div key={item.step} className={classes.step}>
						<div className={classes.stepBadge}>{item.step}</div>
						<div className={classes.stepContent}>
							{renderStepContent(item)}
						</div>
					</div>
				))}
			</div>
			{openModalProfileComplete && (
				<ModalProfileComplete
					completeData={completeData}
					onClose={() => setOpenModalProfileComplete(false)}
					onCompleteProfile={handleCompleteProfile}
				/>
			)}
		</div>
	)
}

export default memo(ReferralTutorialSteps)
