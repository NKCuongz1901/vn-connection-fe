'use client'

import clsx from 'clsx'
import { memo, type ReactNode } from 'react'

import classes from './TalkRoomHeaderActionButton.module.scss'

type TalkRoomHeaderActionButtonProps = {
	children: ReactNode
	onClick?: () => void
	ariaLabel: string
}

/** Alpha pill action button used in talk room stage header. */
function TalkRoomHeaderActionButton({
	children,
	onClick,
	ariaLabel,
}: TalkRoomHeaderActionButtonProps) {
	return (
		<button
			type="button"
			className={clsx(classes.button)}
			onClick={onClick}
			aria-label={ariaLabel}
		>
			{children}
		</button>
	)
}

export default memo(TalkRoomHeaderActionButton)
