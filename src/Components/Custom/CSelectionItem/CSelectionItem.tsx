'use client'

import { IconCheck } from '@tabler/icons-react'
import clsx from 'clsx'
import { memo } from 'react'

import classes from './CSelectionItem.module.scss'

type CSelectionItemProps = {
	label: string
	checked?: boolean
	onClick?: () => void
}

const CSelectionItem = ({
	label,
	checked = false,
	onClick,
}: CSelectionItemProps) => {
	return (
		<div
			className={classes.item}
			role="checkbox"
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
			<div className={classes.checkboxWrap}>
				<div
					className={clsx(classes.checkbox, {
						[classes.checkboxChecked]: checked,
					})}
				>
					{checked && <IconCheck size={14} color="#fff" stroke={3} />}
				</div>
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

export default memo(CSelectionItem)
