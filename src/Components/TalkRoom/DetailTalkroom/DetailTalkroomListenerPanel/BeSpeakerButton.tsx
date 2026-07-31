'use client'

import clsx from 'clsx'
import { memo } from 'react'

import HandIcon from '@/svg/Talkroom/HandIcon'
import { HostMicState } from '@/ultis/talkRoom'

import classes from './DetailTalkroomListenerPanel.module.scss'

type BeSpeakerButtonProps = {
	state: HostMicState
	onClick?: () => void
}

/** Listener "Be speaker" pill button with disabled opacity per Figma. */
function BeSpeakerButton({ state, onClick }: BeSpeakerButtonProps) {
	const isDisabled = state === 'disabled'

	return (
		<button
			type="button"
			className={clsx(classes.beSpeakerButton, {
				[classes.beSpeakerButtonDisabled]: isDisabled,
			})}
			disabled={isDisabled}
			onClick={onClick}
			aria-label={isDisabled ? 'Be speaker unavailable' : 'Be speaker'}
		>
			<HandIcon width="24" height="24" fill="#ffffff" />
			<span className={classes.beSpeakerButtonLabel}>Be speaker</span>
		</button>
	)
}

export default memo(BeSpeakerButton)
