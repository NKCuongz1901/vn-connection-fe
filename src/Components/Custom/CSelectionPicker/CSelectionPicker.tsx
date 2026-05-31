'use client'

import { memo, ReactNode } from 'react'

import classes from './CSelectionPicker.module.scss'

type CSelectionPickerProps = {
	title: string
	children: ReactNode
}

const CSelectionPicker = ({ title, children }: CSelectionPickerProps) => {
	return (
		<div className={classes.picker}>
			<div className={classes.header}>{title}</div>
			<div className={classes.list}>{children}</div>
		</div>
	)
}

export { classes as selectionPickerClasses }
export default memo(CSelectionPicker)
