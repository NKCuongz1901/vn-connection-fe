'use client'

import { IconStarFilled } from '@tabler/icons-react'

import classes from './BookCard.module.scss'

export function formatRating(rating?: number) {
	if (!rating) return null
	return rating.toFixed(1)
}

/** Yellow star with the rating, shown only when the book has one */
function BookRating({ rating }: { rating?: number }) {
	const label = formatRating(rating)
	if (!label) return null
	return (
		<span className={classes.rating}>
			<IconStarFilled size={12} />
			{label}
		</span>
	)
}

export default BookRating
