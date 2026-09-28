'use client'

import { memo } from 'react'
import { IconChevronRight } from '@tabler/icons-react'

import BookCard from '@/Components/Book/BookCard'
import BookEmptyState from '@/Components/Book/BookEmptyState'
import { BookCardItem } from '@/interface/Book/book.interface'

import classes from './BookRail.module.scss'

type BookRailProps = {
	title: string
	total?: number
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

/** Horizontal or list section of book cards with a total count and a see-all shortcut. */
function BookRail({
	title,
	total,
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
				<div className={classes.sectionTitle}>
					{title}
					{total ? <span className={classes.sectionTotal}>{total}</span> : null}
				</div>
				{seeAllPath && onSeeAll ? (
					<button
						type="button"
						className={classes.seeAll}
						onClick={() => onSeeAll(seeAllPath)}
						aria-label={`See all ${title}`}
					>
						<IconChevronRight size={18} stroke={2} />
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
			) : loading ? (
				<div className={classes.empty}>Loading…</div>
			) : (
				<BookEmptyState title={emptyText} compact />
			)}
		</section>
	)
}

export type { BookRailProps }
export default memo(BookRail)
