'use client'

import { memo } from 'react'

import CImage from '@/Components/Custom/CImage/CImage'
import { BookCardItem } from '@/interface/Book/book.interface'
import { TYPE_SIZE_IMAGE } from '@/Variable/image.variable'

import BookPopularCard from './BookPopularCard'
import BookRating, { formatRating } from './BookRating'
import classes from './BookCard.module.scss'

type BookCardProps = {
	book: BookCardItem
	variant?: 'tile' | 'rail' | 'row' | 'popular'
	/** popular variant only: show the share button */
	showShare?: boolean
	onClick?: () => void
}

function MetaLine({ parts, rating }: { parts: (string | undefined)[]; rating?: number }) {
	const text = parts.filter(Boolean).join(' · ')
	const hasRating = Boolean(formatRating(rating))
	return (
		<>
			{text}
			{text && hasRating ? ' · ' : null}
			<BookRating rating={rating} />
		</>
	)
}

function BookCard({
	book,
	variant = 'tile',
	showShare,
	onClick,
}: BookCardProps) {
	if (variant === 'popular') {
		return <BookPopularCard book={book} showShare={showShare} onClick={onClick} />
	}

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
						<MetaLine
							parts={[
								book.author,
								book.category,
								book.durationLabel,
								book.languageLabel,
							]}
							rating={book.rating}
						/>
					</div>
					{book.progressLabel ? (
						<div className={classes.rowProgress}>{book.progressLabel}</div>
					) : null}
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
			<div className={classes.title} title={book.title}>
				{book.title}
			</div>
			<div className={classes.meta}>
				<MetaLine
					parts={[book.author, book.durationLabel, book.languageLabel]}
					rating={book.rating}
				/>
			</div>
			{book.progressLabel ? (
				<div className={classes.progress}>{book.progressLabel}</div>
			) : null}
		</button>
	)
}

export default memo(BookCard)
