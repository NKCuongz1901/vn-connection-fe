'use client'

import clsx from 'clsx'
import { memo } from 'react'

import HandIcon from '@/svg/Talkroom/HandIcon'
import { HostMicState } from '@/ultis/talkRoom'

import classes from './DetailTalkroomListenerPanel.module.scss'

type BeSpeakerButtonProps = {
	state: HostMicState
	hasRaiseHand?: boolean
	onClick?: () => void
}

/** Listener be-speaker / cancel-speaker pill button. */
function BeSpeakerButton({
	state,
	hasRaiseHand = false,
	onClick,
}: BeSpeakerButtonProps) {
	const isDisabled = state === 'disabled'
	const label = hasRaiseHand ? 'Cancel speaker' : 'Be speaker'

	return (
		<button
			type="button"
			className={clsx(classes.beSpeakerButton, {
				[classes.beSpeakerButtonDisabled]: isDisabled,
				[classes.beSpeakerButtonCancel]: hasRaiseHand && !isDisabled,
			})}
			disabled={isDisabled}
			onClick={onClick}
			aria-label={isDisabled ? 'Be speaker unavailable' : label}
		>
			<HandIcon width={24} height={24} fill={hasRaiseHand ? '#0F1729' : '#ffffff'} />
			<span className={classes.beSpeakerButtonLabel}>{label}</span>
		</button>
	)
}

export default memo(BeSpeakerButton)
