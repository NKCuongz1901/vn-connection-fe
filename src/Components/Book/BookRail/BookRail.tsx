'use client'

import { memo } from 'react'

import BookCard from '@/Components/Book/BookCard'
import { BookCardItem } from '@/interface/Book/book.interface'

import classes from './BookRail.module.scss'

type BookRailProps = {
	title: string
	seeAllPath?: string
	books: BookCardItem[]
	loading?: boolean
	emptyText?: string
	/** Horizontal scroll vs vertical list */
	layout?: 'rail' | 'list'
	cardVariant?: 'tile' | 'rail' | 'row'
	onSeeAll?: (path: string) => void
	onOpen: (id: string) => void
}

/** Horizontal or list section of book cards with optional See all. */
function BookRail({
	title,
	seeAllPath,
	books,
	loading = false,
	emptyText = 'No books yet',
	layout = 'rail',
	cardVariant,
	onSeeAll,
	onOpen,
}: BookRailProps) {
	const variant = cardVariant || (layout === 'list' ? 'row' : 'rail')

	return (
		<section className={classes.section}>
			<div className={classes.sectionHead}>
				<div className={classes.sectionTitle}>{title}</div>
				{seeAllPath && onSeeAll ? (
					<button
						type="button"
						className={classes.seeAll}
						onClick={() => onSeeAll(seeAllPath)}
					>
						See all
					</button>
				) : null}
			</div>
			{books.length ? (
				<div className={layout === 'list' ? classes.list : classes.rail}>
					{books.map((book) => (
						<BookCard
							key={book.id}
							book={book}
							variant={variant}
							onClick={() => onOpen(book.id)}
						/>
					))}
				</div>
			) : (
				<div className={classes.empty}>
					{loading ? 'Loading…' : emptyText}
				</div>
			)}
		</section>
	)
}

export type { BookRailProps }
export default memo(BookRail)
