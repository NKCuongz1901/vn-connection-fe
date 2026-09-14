'use client'

import { memo } from 'react'
import clsx from 'clsx'

import classes from './BookEmptyState.module.scss'

type BookEmptyStateProps = {
	title?: string
	description?: string
	compact?: boolean
}

const DEFAULT_TITLE = 'There are no book yet!'
const DEFAULT_DESCRIPTION =
	'Please check back later. New items may be added soon.'

function BookEmptyState({
	title = DEFAULT_TITLE,
	description = DEFAULT_DESCRIPTION,
	compact = false,
}: BookEmptyStateProps) {
	return (
		<div className={clsx(classes.wrap, compact && classes.compact)}>
			<img
				src="/images/book/empty-books.png"
				alt=""
				width={80}
				height={80}
				className={classes.icon}
			/>
			<div className={classes.title}>{title}</div>
			<div className={classes.description}>{description}</div>
		</div>
	)
}

export default memo(BookEmptyState)
