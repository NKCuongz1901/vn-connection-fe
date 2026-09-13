'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import {
	getBookListV2,
	getContinueReadingBooks,
	getPopularNowBooks,
	getRecentlyAddedBooks,
	getTopPickBooks,
	mapBookCard,
	mapContinueReadingCard,
	parseApiList,
	parseListTotal,
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
const SEARCH_DEBOUNCE_MS = 300

const compactCards = (items: Array<BookCardItem | null>) =>
	items.filter((item): item is BookCardItem => Boolean(item))

type UseBookSeeAllOptions = {
	categoryId?: string
}

export default function useBookSeeAll(
	kind: BookSeeAllKind,
	options: UseBookSeeAllOptions = {},
) {
	const { level, categories } = useBookLibrary()
	const categoryId = options.categoryId || ''
	const [books, setBooks] = useState<BookCardItem[]>([])
	const [total, setTotal] = useState(0)
	const [page, setPage] = useState(1)
	const [search, setSearch] = useState('')
	const [debouncedSearch, setDebouncedSearch] = useState('')
	const [loading, setLoading] = useState(true)
	const [loadingMore, setLoadingMore] = useState(false)
	const [hasMore, setHasMore] = useState(false)

	const categoryTitle = useMemo(() => {
		if (kind !== 'category' || !categoryId) return ''
		const match = categories.find(
			(item) => item.id === categoryId || item.title === categoryId,
		)
		return match?.title || categoryId
	}, [categories, categoryId, kind])

	useEffect(() => {
		const timer = window.setTimeout(() => {
			setDebouncedSearch(search.trim())
		}, SEARCH_DEBOUNCE_MS)
		return () => window.clearTimeout(timer)
	}, [search])

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
					search_text?: string
				} = {
					page: nextPage,
					limit: LIST_LIMIT,
				}

				if (kind !== 'continue') {
					params.level = toBookListLevel(level)
				}
				if (kind === 'category' && categoryTitle) {
					params.category = categoryTitle
				}
				if (debouncedSearch) {
					params.search_text = debouncedSearch
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
				if (!append) {
					setTotal(parseListTotal(res, rows.length))
				}
			} catch {
				if (!append) {
					setBooks([])
					setHasMore(false)
					setTotal(0)
				}
			} finally {
				setLoading(false)
				setLoadingMore(false)
			}
		},
		[categoryTitle, debouncedSearch, kind, level],
	)

	useEffect(() => {
		load(1, false)
	}, [kind, level, categoryTitle, debouncedSearch, load])

	const loadMore = useCallback(() => {
		if (loading || loadingMore || !hasMore) return
		load(page + 1, true)
	}, [hasMore, load, loading, loadingMore, page])

	return {
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
	}
}
