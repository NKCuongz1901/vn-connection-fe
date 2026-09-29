'use client'

import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { Select } from 'antd'
import clsx from 'clsx'

import {
	MyLibrarySort,
	getMyLibrary,
	mapContinueReadingCard,
	parseApiList,
	parseListTotal,
} from '@/apis/book/bookApis'
import { BookEmptyState } from '@/Components/Book'
import {
	BookCardItem,
	ContinueReadingApiItem,
} from '@/interface/Book/book.interface'
import { getDownloadedBookIds } from '@/ultis/bookDownload'
import { useLocalePath } from '@/ultis/route'
import { BOOK_ROOT, bookReadPath } from '@/Variable/book.variable'

import LibraryBookRow from './LibraryBookRow'
import classes from './BookMyLibrary.module.scss'

type LibraryTab = 'books' | 'favorites'
type LibraryView = 'progress' | 'downloaded'

const PAGE_SIZE = 20

const SORT_OPTIONS: { value: MyLibrarySort; label: string }[] = [
	{ value: 'newest', label: 'Newest' },
	{ value: 'oldest', label: 'Oldest' },
	{ value: 'a-z', label: 'A → Z' },
	{ value: 'z-a', label: 'Z → A' },
]

const EMPTY: Record<LibraryTab, Record<LibraryView, { title: string; description: string }>> = {
	books: {
		progress: {
			title: 'No books in progress yet',
			description: 'Books you start reading or listening to will be listed here.',
		},
		downloaded: {
			title: 'No downloaded books yet',
			description: 'Books you download on this browser will be listed here.',
		},
	},
	favorites: {
		progress: {
			title: 'No favourite books yet',
			description:
				'Your favourite books will be listed here. Keep exploring and enjoying books!',
		},
		downloaded: {
			title: 'No downloaded favourites yet',
			description: 'Favourite books you download on this browser will be listed here.',
		},
	},
}

// Downloaded ids are stored most recent first, so Newest keeps that order
const sortDownloaded = (rows: BookCardItem[], sort: MyLibrarySort) => {
	if (sort === 'oldest') return [...rows].reverse()
	if (sort === 'a-z' || sort === 'z-a') {
		const sorted = [...rows].sort((a, b) =>
			a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }),
		)
		return sort === 'a-z' ? sorted : sorted.reverse()
	}
	return rows
}

/** My Library: the reader's books and favourites, in progress or downloaded */
function BookMyLibrary() {
	const { onChangeRoute } = useLocalePath()
	const [tab, setTab] = useState<LibraryTab>('books')
	const [view, setView] = useState<LibraryView>('progress')
	const [sort, setSort] = useState<MyLibrarySort>('newest')
	const [books, setBooks] = useState<BookCardItem[]>([])
	const [total, setTotal] = useState(0)
	const [loading, setLoading] = useState(true)
	const [loadingMore, setLoadingMore] = useState(false)
	const requestSeq = useRef(0)

	const load = useCallback(
		async (offset: number) => {
			const seq = ++requestSeq.current
			const downloadedIds = view === 'downloaded' ? getDownloadedBookIds() : undefined
			if (downloadedIds && !downloadedIds.length) {
				setBooks([])
				setTotal(0)
				return
			}
			const res = await getMyLibrary({
				favorite: tab === 'favorites',
				sortBy: sort,
				bookIds: downloadedIds,
				limit: PAGE_SIZE,
				offset,
			})
			if (seq !== requestSeq.current) return
			let rows = parseApiList<ContinueReadingApiItem>(res)
				.map(mapContinueReadingCard)
				.filter((item): item is BookCardItem => Boolean(item))

			if (downloadedIds) {
				// With book_ids the API returns every requested book in the given
				// order and ignores favorite, sortBy and paging, so finish here
				if (tab === 'favorites') rows = rows.filter((item) => item.isFavourited)
				rows = sortDownloaded(rows, sort)
				setBooks(rows)
				setTotal(rows.length)
				return
			}

			setBooks((prev) => (offset ? [...prev, ...rows] : rows))
			setTotal(parseListTotal(res, rows.length))
		},
		[sort, tab, view],
	)

	useEffect(() => {
		setLoading(true)
		load(0)
			.catch(() => {
				setBooks([])
				setTotal(0)
			})
			.finally(() => setLoading(false))
	}, [load])

	const loadMore = async () => {
		if (loadingMore) return
		setLoadingMore(true)
		await load(books.length).catch(() => {})
		setLoadingMore(false)
	}

	const openBook = (book: BookCardItem) =>
		onChangeRoute(
			bookReadPath(book.id, { chapter: book.chapterId, page: book.page || 1, mode: 'read' }),
		)

	const empty = EMPTY[tab][view]

	return (
		<div className={classes.page}>
			<div className={classes.segment} role="tablist">
				{(
					[
						['books', 'Books'],
						['favorites', 'Favorites'],
					] as const
				).map(([key, label]) => (
					<button
						key={key}
						type="button"
						role="tab"
						aria-selected={tab === key}
						className={clsx(classes.segmentItem, { [classes.segmentActive]: tab === key })}
						onClick={() => setTab(key)}
					>
						{label}
					</button>
				))}
			</div>

			<div className={classes.body}>
				<div className={classes.subTabs} role="tablist">
					{(
						[
							['progress', 'In progress'],
							['downloaded', 'Downloaded'],
						] as const
					).map(([key, label]) => (
						<button
							key={key}
							type="button"
							role="tab"
							aria-selected={view === key}
							className={clsx(classes.subTab, { [classes.subTabActive]: view === key })}
							onClick={() => setView(key)}
						>
							{label}
						</button>
					))}
				</div>

				<div className={classes.toolbar}>
					<div className={classes.count}>BOOKS ({total})</div>
					<Select
						value={sort}
						options={SORT_OPTIONS}
						onChange={setSort}
						className={classes.sort}
						aria-label="Sort by"
					/>
				</div>

				{loading ? (
					<div className={classes.empty}>Loading…</div>
				) : books.length ? (
					<div className={classes.list}>
						{books.map((book) => (
							<LibraryBookRow
								// per tab, so the heart state starts from this list's data
								key={`${tab}-${view}-${book.id}`}
								book={book}
								downloaded={view === 'downloaded'}
								onOpen={() => openBook(book)}
								onFavouriteChange={(favourited) => {
									// an unfavourited book leaves the Favorites list
									if (tab === 'favorites' && !favourited) {
										setBooks((prev) => prev.filter((item) => item.id !== book.id))
										setTotal((prev) => Math.max(0, prev - 1))
									}
								}}
							/>
						))}
						{books.length < total ? (
							<button
								type="button"
								className={classes.more}
								onClick={loadMore}
								disabled={loadingMore}
							>
								{loadingMore ? 'Loading…' : 'Load more'}
							</button>
						) : null}
					</div>
				) : (
					<div className={classes.emptyWrap}>
						<BookEmptyState title={empty.title} description={empty.description} />
						<button
							type="button"
							className={classes.searchBtn}
							onClick={() => onChangeRoute(BOOK_ROOT)}
						>
							Search a book
						</button>
					</div>
				)}
			</div>
		</div>
	)
}

export default memo(BookMyLibrary)
