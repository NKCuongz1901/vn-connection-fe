import clsx from 'clsx'
import classes from './MiniAppButton.module.scss'
import { memo } from 'react'

type MiniAppButtonProps = {
	label: string
	icon: React.ReactNode
	background: string
	onClick?: () => void
	className?: string
	disabled?: boolean
}

function MiniAppButton({
	label,
	icon,
	background,
	onClick,
	className,
	disabled,
}: MiniAppButtonProps) {
	return (
		<button
			type="button"
			className={clsx(classes.wrapper, className)}
			onClick={onClick}
			disabled={disabled}
		>
			<div className={classes.iconBox} style={{ background }}>
				<span className={classes.icon}>{icon}</span>
			</div>
			<span className={classes.label}>{label}</span>
		</button>
	)
}

export default memo(MiniAppButton)
