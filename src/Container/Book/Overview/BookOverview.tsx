'use client'

import { memo } from 'react'

import BookRail from '@/Components/Book/BookRail'
import { useBookLibrary } from '@/context/BookLibraryContext'
import { getUserInfo } from '@/ultis/storage'
import { useLocalePath } from '@/ultis/route'
import {
	BOOK_SEE_ALL,
	bookDetailPath,
	bookReadPath,
} from '@/Variable/book.variable'

import classes from './BookOverview.module.scss'

/** Library home: greeting + book rails from BookLibraryContext. */
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
			<BookRail
				title="Popular now"
				seeAllPath={BOOK_SEE_ALL.popular.path}
				books={popularNow}
				loading={loading}
				emptyText="No popular books yet"
				layout="list"
				onSeeAll={onChangeRoute}
				onOpen={(id) => onChangeRoute(bookDetailPath(id))}
			/>
		</div>
	)
}

export default memo(BookOverview)
