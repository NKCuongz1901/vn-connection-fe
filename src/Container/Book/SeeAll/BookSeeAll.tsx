'use client'

import { memo } from 'react'

import BookCard from '@/Components/Book/BookCard/BookCard'
import useBookSeeAll from '@/hooks/Book/useBookSeeAll'
import { useLocalePath } from '@/ultis/route'
import {
	BOOK_ROOT,
	BOOK_SEE_ALL,
	BookSeeAllKind,
	bookDetailPath,
	bookReadPath,
} from '@/Variable/book.variable'

import classes from './BookSeeAll.module.scss'

type BookSeeAllProps = {
	kind: BookSeeAllKind
}

function BookSeeAll({ kind }: BookSeeAllProps) {
	const { onChangeRoute } = useLocalePath()
	const { books, loading, loadingMore, hasMore, loadMore, level } =
		useBookSeeAll(kind)
	const meta = BOOK_SEE_ALL[kind]
	const title = kind === 'all' ? `${meta.title} (${level})` : meta.title

	return (
		<div className={classes.page}>
			<button
				type="button"
				className={classes.back}
				onClick={() => onChangeRoute(BOOK_ROOT)}
			>
				← Back
			</button>
			<div className={classes.title}>{title}</div>

			{loading ? (
				<div className={classes.empty}>Loading…</div>
			) : books.length ? (
				<>
					<div
						className={
							kind === 'popular' ? classes.rows : classes.grid
						}
					>
						{books.map((book) => (
							<BookCard
								key={book.id}
								book={book}
								variant={kind === 'popular' ? 'row' : 'tile'}
								onClick={() => {
									if (kind === 'continue') {
										onChangeRoute(
											bookReadPath(book.id, {
												chapter: book.chapterId,
												page: book.page || 1,
												mode: 'read',
											}),
										)
										return
									}
									onChangeRoute(bookDetailPath(book.id))
								}}
							/>
						))}
					</div>
					{hasMore ? (
						<button
							type="button"
							className={classes.more}
							onClick={loadMore}
							disabled={loadingMore}
						>
							{loadingMore ? 'Loading…' : 'Load more'}
						</button>
					) : null}
				</>
			) : (
				<div className={classes.empty}>No books yet</div>
			)}
		</div>
	)
}

export default memo(BookSeeAll)
