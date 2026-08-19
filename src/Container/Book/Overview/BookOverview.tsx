'use client'

import { memo } from 'react'

import BookCard from '@/Components/Book/BookCard/BookCard'
import { useBookLibrary } from '@/context/BookLibraryContext'
import { BookCardItem } from '@/interface/Book/book.interface'
import { getUserInfo } from '@/ultis/storage'
import { useLocalePath } from '@/ultis/route'
import {
	BOOK_SEE_ALL,
	bookDetailPath,
	bookReadPath,
} from '@/Variable/book.variable'

import classes from './BookOverview.module.scss'

type RailProps = {
	title: string
	seeAllPath: string
	books: BookCardItem[]
	loading: boolean
	emptyText: string
	onSeeAll: (path: string) => void
	onOpen: (id: string) => void
}

function BookRail({
	title,
	seeAllPath,
	books,
	loading,
	emptyText,
	onSeeAll,
	onOpen,
}: RailProps) {
	return (
		<section className={classes.section}>
			<div className={classes.sectionHead}>
				<div className={classes.sectionTitle}>{title}</div>
				<button
					type="button"
					className={classes.seeAll}
					onClick={() => onSeeAll(seeAllPath)}
				>
					See all
				</button>
			</div>
			{books.length ? (
				<div className={classes.rail}>
					{books.map((book) => (
						<BookCard
							key={book.id}
							book={book}
							variant="rail"
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

function BookOverview() {
	const { onChangeRoute } = useLocalePath()
	const {
		reader,
		level,
		loading,
		continueReading,
		allBooks,
		topPicks,
		recentlyAdded,
		popularNow,
	} = useBookLibrary()

	const name = reader?.name || getUserInfo('name') || ''

	return (
		<div className={classes.page}>
			<div>
				<div className={classes.greeting}>Hi{name ? ` ${name}` : ''}</div>
				<div className={classes.hint}>
					Books & Audio · level {level}
				</div>
			</div>

			<BookRail
				title="Continue reading"
				seeAllPath={BOOK_SEE_ALL.continue.path}
				books={continueReading}
				loading={loading}
				emptyText="No books in progress"
				onSeeAll={onChangeRoute}
				onOpen={(id) => {
					const item = continueReading.find((book) => book.id === id)
					onChangeRoute(
						bookReadPath(id, {
							chapter: item?.chapterId,
							page: item?.page || 1,
							mode: 'read',
						}),
					)
				}}
			/>
			<BookRail
				title={`All books (${level})`}
				seeAllPath={BOOK_SEE_ALL.all.path}
				books={allBooks}
				loading={loading}
				emptyText="No books for this level"
				onSeeAll={onChangeRoute}
				onOpen={(id) => onChangeRoute(bookDetailPath(id))}
			/>
			<BookRail
				title="Top picks for you"
				seeAllPath={BOOK_SEE_ALL['top-pick'].path}
				books={topPicks}
				loading={loading}
				emptyText="No top picks yet"
				onSeeAll={onChangeRoute}
				onOpen={(id) => onChangeRoute(bookDetailPath(id))}
			/>
			<BookRail
				title="Recently added"
				seeAllPath={BOOK_SEE_ALL.recent.path}
				books={recentlyAdded}
				loading={loading}
				emptyText="No recent books"
				onSeeAll={onChangeRoute}
				onOpen={(id) => onChangeRoute(bookDetailPath(id))}
			/>

			<section className={classes.section}>
				<div className={classes.sectionHead}>
					<div className={classes.sectionTitle}>Popular now</div>
					<button
						type="button"
						className={classes.seeAll}
						onClick={() => onChangeRoute(BOOK_SEE_ALL.popular.path)}
					>
						See all
					</button>
				</div>
				{popularNow.length ? (
					<div className={classes.popularList}>
						{popularNow.map((book) => (
							<BookCard
								key={book.id}
								book={book}
								variant="row"
								onClick={() => onChangeRoute(bookDetailPath(book.id))}
							/>
						))}
					</div>
				) : (
					<div className={classes.empty}>
						{loading ? 'Loading…' : 'No popular books yet'}
					</div>
				)}
			</section>
		</div>
	)
}

export default memo(BookOverview)
