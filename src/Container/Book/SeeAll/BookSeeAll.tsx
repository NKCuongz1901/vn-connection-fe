'use client'

import { memo } from 'react'
import { IconChevronLeft, IconSearch } from '@tabler/icons-react'

import { BookCard, BookEmptyState } from '@/Components/Book'
import useBookSeeAll from '@/hooks/Book/useBookSeeAll'
import { useLocalePath } from '@/ultis/route'
import {
	BOOK_ROOT,
	BOOK_SEARCHABLE_KINDS,
	BOOK_SEE_ALL,
	BookSeeAllKind,
	bookDetailPath,
	bookReadPath,
} from '@/Variable/book.variable'

import classes from './BookSeeAll.module.scss'

type BookSeeAllProps = {
	kind: BookSeeAllKind
	categoryId?: string
}

function BookSeeAll({ kind, categoryId }: BookSeeAllProps) {
	const { onChangeRoute } = useLocalePath()
	const {
		books,
		total,
		loading,
		loadingMore,
		hasMore,
		loadMore,
		level,
		search,
		setSearch,
		categoryTitle,
	} = useBookSeeAll(kind, { categoryId })
	const searchable = BOOK_SEARCHABLE_KINDS.includes(kind)
	const title =
		kind === 'category'
			? categoryTitle || 'Category'
			: kind === 'all'
				? `${BOOK_SEE_ALL.all.title} (${level})`
				: BOOK_SEE_ALL[kind].title

	return (
		<div className={classes.page}>
			<div className={classes.head}>
				<button
					type="button"
					className={classes.back}
					onClick={() => onChangeRoute(BOOK_ROOT)}
					aria-label="Back"
				>
					<IconChevronLeft size={20} />
				</button>
				<div className={classes.headCopy}>
					<div className={classes.titleRow}>
						<div className={classes.title}>{title}</div>
						{total ? (
							<span className={classes.badge}>{total}</span>
						) : null}
					</div>
					{kind !== 'continue' ? (
						<div className={classes.level}>Level {level}</div>
					) : null}
				</div>
			</div>

			{searchable ? (
				<label className={classes.search}>
					<IconSearch size={20} stroke={1.5} />
					<input
						type="search"
						value={search}
						onChange={(event) => setSearch(event.target.value)}
						placeholder="Search by keywords"
					/>
				</label>
			) : null}

			{loading ? (
				<div className={classes.loading}>Loading…</div>
			) : books.length ? (
				<>
					<div className={classes.grid}>
						{books.map((book) => (
							<BookCard
								key={book.id}
								book={book}
								variant="tile"
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
				<BookEmptyState />
			)}
		</div>
	)
}

export default memo(BookSeeAll)
