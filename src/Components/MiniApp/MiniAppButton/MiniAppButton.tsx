import clsx from 'clsx'
import { memo } from 'react'
import { Tooltip } from 'antd'

import classes from './MiniAppButton.module.scss'

export type MiniAppButtonSize = 'sm' | 'lg'

type MiniAppButtonProps = {
	label: string
	icon: React.ReactNode
	background: string
	onClick?: () => void
	className?: string
	disabled?: boolean
	size?: MiniAppButtonSize
	badge?: string
}

function MiniAppButton({
	label,
	icon,
	background,
	onClick,
	className,
	disabled,
	size = 'sm',
	badge,
}: MiniAppButtonProps) {
	const button = (
		<button
			type="button"
			className={clsx(classes.wrapper, classes[size], className)}
			onClick={onClick}
			disabled={disabled}
		>
			<span className={classes.iconWrap}>
				<span className={classes.iconBox} style={{ background }}>
					<span className={classes.icon}>{icon}</span>
				</span>
				{badge ? <span className={classes.badge}>{badge}</span> : null}
			</span>
			<span className={classes.label}>{label}</span>
		</button>
	)

	if (!disabled) return button

	return (
		<Tooltip
			title={<div>This mini app is available in the UniVini app</div>}
			color="green"
		>
			<span className={classes.tooltipWrap}>{button}</span>
		</Tooltip>
	)
}

export default memo(MiniAppButton)
