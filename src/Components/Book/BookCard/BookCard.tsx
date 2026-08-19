'use client'

import { memo } from 'react'

import CImage from '@/Components/Custom/CImage/CImage'
import { BookCardItem } from '@/interface/Book/book.interface'
import { TYPE_SIZE_IMAGE } from '@/Variable/image.variable'

import classes from './BookCard.module.scss'

type BookCardProps = {
	book: BookCardItem
	variant?: 'tile' | 'rail' | 'row'
	onClick?: () => void
}

function formatRating(rating?: number) {
	if (!rating) return null
	return rating.toFixed(1)
}

function BookCard({ book, variant = 'tile', onClick }: BookCardProps) {
	const rating = formatRating(book.rating)

	if (variant === 'row') {
		return (
			<button type="button" className={classes.row} onClick={onClick}>
				<div className={classes.rowCover}>
					{book.coverImage ? (
						<CImage
							src={book.coverImage}
							sizeType={TYPE_SIZE_IMAGE.small}
							alt=""
						/>
					) : null}
				</div>
				<div>
					<div className={classes.rowTitle}>{book.title}</div>
					<div className={classes.rowMeta}>
						{[book.author, book.category, rating ? `★ ${rating}` : null]
							.filter(Boolean)
							.join(' · ')}
					</div>
				</div>
			</button>
		)
	}

	return (
		<button
			type="button"
			className={variant === 'rail' ? classes.rail : classes.tile}
			onClick={onClick}
		>
			<div className={classes.cover}>
				{book.coverImage ? (
					<CImage
						src={book.coverImage}
						sizeType={TYPE_SIZE_IMAGE.small}
						alt=""
					/>
				) : null}
			</div>
			<div className={classes.title}>{book.title}</div>
			<div className={classes.meta}>{book.progressLabel || book.author}</div>
		</button>
	)
}

export default memo(BookCard)
