import type { ReactNode } from 'react'

export interface ReferralTutorialStepItem {
	step: number
	content: ReactNode
}

export const REFERRAL_TUTORIAL_STEPS: ReferralTutorialStepItem[] = [
	{
		step: 1,
		content: 'Share your invite link',
	},
	{
		step: 2,
		content: 'Earn 1 point when a friend completes 50% their profile',
	},
	{
		step: 3,
		content: 'Redeem your points for rewards from our collection',
	},
]
