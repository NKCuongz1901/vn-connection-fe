'use client'

import { useCallback, useEffect, useState } from 'react'

import {
	getBookListV2,
	getContinueReadingBooks,
	getPopularNowBooks,
	getRecentlyAddedBooks,
	getTopPickBooks,
	mapBookCard,
	mapContinueReadingCard,
	parseApiList,
} from '@/apis/book/bookApis'
import { useBookLibrary } from '@/context/BookLibraryContext'
import {
	BookApiItem,
	BookCardItem,
	ContinueReadingApiItem,
} from '@/interface/Book/book.interface'
import {
	BookSeeAllKind,
	toBookListLevel,
} from '@/Variable/book.variable'

const LIST_LIMIT = 20

const compactCards = (items: Array<BookCardItem | null>) =>
	items.filter((item): item is BookCardItem => Boolean(item))

export default function useBookSeeAll(kind: BookSeeAllKind) {
	const { level, category } = useBookLibrary()
	const [books, setBooks] = useState<BookCardItem[]>([])
	const [page, setPage] = useState(1)
	const [loading, setLoading] = useState(true)
	const [loadingMore, setLoadingMore] = useState(false)
	const [hasMore, setHasMore] = useState(false)

	const load = useCallback(
		async (nextPage: number, append: boolean) => {
			if (append) setLoadingMore(true)
			else setLoading(true)

			try {
				const params: {
					page: number
					limit: number
					level?: string
					category?: string
				} = {
					page: nextPage,
					limit: LIST_LIMIT,
				}

				if (kind !== 'continue') {
					params.level = toBookListLevel(level)
				}
				if (kind === 'all' && category) {
					params.category = category
				}

				let res: unknown
				if (kind === 'continue') {
					res = await getContinueReadingBooks(params)
				} else if (kind === 'top-pick') {
					res = await getTopPickBooks(params)
				} else if (kind === 'recent') {
					res = await getRecentlyAddedBooks(params)
				} else if (kind === 'popular') {
					res = await getPopularNowBooks(params)
				} else {
					res = await getBookListV2(params)
				}

				const rows =
					kind === 'continue'
						? compactCards(
								parseApiList<ContinueReadingApiItem>(res).map(
									mapContinueReadingCard,
								),
							)
						: compactCards(
								parseApiList<BookApiItem>(res).map(mapBookCard),
							)

				setBooks((prev) => (append ? [...prev, ...rows] : rows))
				setPage(nextPage)
				setHasMore(rows.length === LIST_LIMIT)
			} catch {
				if (!append) {
					setBooks([])
					setHasMore(false)
				}
			} finally {
				setLoading(false)
				setLoadingMore(false)
			}
		},
		[category, kind, level],
	)

	useEffect(() => {
		load(1, false)
	}, [kind, level, category, load])

	const loadMore = useCallback(() => {
		if (loading || loadingMore || !hasMore) return
		load(page + 1, true)
	}, [hasMore, load, loading, loadingMore, page])

	return {
		books,
		loading,
		loadingMore,
		hasMore,
		loadMore,
		level,
	}
}
