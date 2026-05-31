'use client'

import clsx from 'clsx'
import { memo } from 'react'

import classes from './CInterestTagPicker.module.scss'

type InterestItem = {
	id: string
	title: string
}

type CInterestTagPickerProps = {
	items?: InterestItem[]
	selected?: string[]
	onToggle?: (id: string) => void
	className?: string
	listClassName?: string
}

const CInterestTagPicker = ({
	items = [],
	selected = [],
	onToggle,
	className,
	listClassName,
}: CInterestTagPickerProps) => {
	if (!items.length) {
		return <div className={classes.empty}>No interests available</div>
	}

	return (
		<div className={clsx(classes.tagList, listClassName, className)}>
			{items.map((item) => {
				const isActive = selected.includes(item.id)
				return (
					<button
						key={item.id}
						type="button"
						className={clsx(classes.tag, {
							[classes.tagActive]: isActive,
						})}
						onClick={() => onToggle?.(item.id)}
					>
						{item.title}
					</button>
				)
			})}
		</div>
	)
}

export { classes as interestTagPickerClasses }
export default memo(CInterestTagPicker)
