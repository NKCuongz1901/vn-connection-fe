'use client'

import clsx from 'clsx'
import { memo } from 'react'

import classes from './CRadioItem.module.scss'

export type CRadioItemProps = {
	label: string
	checked?: boolean
	onClick?: () => void
}

const CRadioItem = ({ label, checked = false, onClick }: CRadioItemProps) => {
	return (
		<div
			className={classes.item}
			role="radio"
			aria-checked={checked}
			tabIndex={0}
			onClick={onClick}
			onKeyDown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault()
					onClick?.()
				}
			}}
		>
			<div className={classes.radioWrap}>
				<div
					className={clsx(classes.radio, {
						[classes.radioChecked]: checked,
					})}
				/>
			</div>
			<span
				className={clsx(classes.label, {
					[classes.labelChecked]: checked,
				})}
			>
				{label}
			</span>
		</div>
	)
}

export default memo(CRadioItem)
