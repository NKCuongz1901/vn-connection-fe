'use client'

import { memo } from 'react'

import {
	REFERRAL_TUTORIAL_STEPS,
	type ReferralTutorialStepItem,
} from './referralTutorialSteps.constants'
import classes from './ReferralTutorialSteps.module.scss'

function renderStepContent(item: ReferralTutorialStepItem) {
	if (item.step === 2) {
		return (
			<>
				Earn 1 point when a friend completes{' '}
				<span className={classes.highlight}>50%</span> their profile
			</>
		)
	}

	return item.content
}

function ReferralTutorialSteps() {
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
		</div>
	)
}

export default memo(ReferralTutorialSteps)
