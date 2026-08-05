'use client'

import clsx from 'clsx'
import { memo } from 'react'

import HostMicOffIcon from '@/svg/Talkroom/HostMicOffIcon'
import HostMicOnIcon from '@/svg/Talkroom/HostMicOnIcon'
import { HostMicState } from '@/ultis/talkRoom'

import classes from './DetailTalkroomListenerPanel.module.scss'

type HostMicButtonProps = {
	state: HostMicState
	size?: 'sm' | 'md'
	onClick?: () => void
}

/** Host mic control with disabled, off, and on visual states. */
function HostMicButton({ state, size = 'md', onClick }: HostMicButtonProps) {
	const isDisabled = state === 'disabled'
	const iconSize = size === 'sm' ? '18' : '24'

	return (
		<button
			type="button"
			className={clsx(classes.micButton, classes[`micButton--${state}`], {
				[classes.micButtonSm]: size === 'sm',
				[classes.micButtonMd]: size === 'md',
			})}
			disabled={isDisabled}
			onClick={onClick}
			aria-label={
				state === 'on'
					? 'Turn microphone off'
					: state === 'off'
						? 'Turn microphone on'
						: 'Microphone unavailable'
			}
		>
			{state === 'disabled' ? (
				<HostMicOffIcon
					width={Number(iconSize)}
					height={Number(iconSize)}
					fill="#94a3b8"
				/>
			) : state === 'on' ? (
				<HostMicOnIcon
					width={Number(iconSize)}
					height={Number(iconSize)}
					fill="#ffffff"
				/>
			) : (
				<HostMicOffIcon
					width={Number(iconSize)}
					height={Number(iconSize)}
					fill="#ffffff"
				/>
			)}
		</button>
	)
}

export default memo(HostMicButton)
