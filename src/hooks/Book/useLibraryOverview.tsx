'use client'

import { useCallback, useEffect, useState } from 'react'

import {
	getBookCategories,
	getBookLanguagesVariant,
	getBookListV2,
	getContinueReadingBooks,
	getPopularNowBooks,
	getRecentlyAddedBooks,
	getTopPickBooks,
	mapBookCard,
	mapCategoryList,
	mapContinueReadingCard,
	parseApiList,
	parseApiObject,
	parseBookLanguages,
} from '@/apis/book/bookApis'
import {
	getReaderProfile,
	updateBookLanguageLearning,
	updateBookLanguageNative,
	updateLastSelectedLevel,
} from '@/apis/book/readerApis'
import {
	BookApiItem,
	BookCardItem,
	BookCategory,
	BookLanguage,
	ContinueReadingApiItem,
	ReaderProfile,
} from '@/interface/Book/book.interface'
import {
	BOOK_CATEGORIES,
	BookLevel,
	DEFAULT_LEARNING_LANG,
	DEFAULT_NATIVE_LANG,
	FALLBACK_BOOK_LANGUAGES,
	normalizeBookLevel,
	toBookListLevel,
	toLastSelectedLevel,
} from '@/Variable/book.variable'

const OVERVIEW_LIMIT = 10

const fallbackCategories: BookCategory[] = BOOK_CATEGORIES.map((title) => ({
	id: title,
	title,
}))

const compactCards = (items: Array<BookCardItem | null>) =>
	items.filter((item): item is BookCardItem => Boolean(item))

const settledList = <T,>(
	result: PromiseSettledResult<unknown>,
	mapItem: (row: T) => BookCardItem | null,
) => {
	if (result.status !== 'fulfilled') return []
	return compactCards(parseApiList<T>(result.value).map(mapItem))
}

export default function useLibraryOverview() {
	const [level, setLevelState] = useState<BookLevel>('A1')
	const [category, setCategoryState] = useState<string | null>(null)
	const [reader, setReader] = useState<ReaderProfile | null>(null)
	const [categories, setCategories] =
		useState<BookCategory[]>(fallbackCategories)
	const [continueReading, setContinueReading] = useState<BookCardItem[]>([])
	const [allBooks, setAllBooks] = useState<BookCardItem[]>([])
	const [topPicks, setTopPicks] = useState<BookCardItem[]>([])
	const [recentlyAdded, setRecentlyAdded] = useState<BookCardItem[]>([])
	const [popularNow, setPopularNow] = useState<BookCardItem[]>([])
	const [languages, setLanguages] = useState<BookLanguage[]>(
		FALLBACK_BOOK_LANGUAGES,
	)
	const [loading, setLoading] = useState(true)

	const loadRails = useCallback(
		async (nextLevel: BookLevel, nextCategory: string | null) => {
			const listParams = {
				page: 1,
				limit: OVERVIEW_LIMIT,
				level: toBookListLevel(nextLevel),
			}
			const allBooksParams = nextCategory
				? { ...listParams, category: nextCategory }
				: listParams

			const [continueRes, allRes, topRes, recentRes, popularRes] =
				await Promise.allSettled([
					getContinueReadingBooks({
						page: 1,
						limit: OVERVIEW_LIMIT,
					}),
					getBookListV2(allBooksParams),
					getTopPickBooks(listParams),
					getRecentlyAddedBooks(listParams),
					getPopularNowBooks(listParams),
				])

			setContinueReading(
				settledList<ContinueReadingApiItem>(
					continueRes,
					mapContinueReadingCard,
				),
			)
			setAllBooks(settledList<BookApiItem>(allRes, mapBookCard))
			setTopPicks(settledList<BookApiItem>(topRes, mapBookCard))
			setRecentlyAdded(settledList<BookApiItem>(recentRes, mapBookCard))
			setPopularNow(settledList<BookApiItem>(popularRes, mapBookCard))
		},
		[],
	)

	useEffect(() => {
		let cancelled = false

		const init = async () => {
			setLoading(true)
			try {
				const [profileRes, categoryRes, languageRes] = await Promise.allSettled([
					getReaderProfile(),
					getBookCategories(),
					getBookLanguagesVariant(),
				])

				let nextLevel: BookLevel = 'A1'
				if (profileRes.status === 'fulfilled') {
					const profile = parseApiObject<ReaderProfile>(profileRes.value)
					if (!cancelled && profile) {
						setReader(profile)
						nextLevel = normalizeBookLevel(profile.last_selected_level)
					}
				}

				if (categoryRes.status === 'fulfilled') {
					const rows = mapCategoryList(categoryRes.value)
					if (!cancelled) {
						setCategories(rows.length ? rows : fallbackCategories)
					}
				}

				if (languageRes.status === 'fulfilled') {
					const rows = parseBookLanguages(languageRes.value)
					if (!cancelled && rows.length) {
						setLanguages(rows)
					}
				}

				if (!cancelled) {
					setLevelState(nextLevel)
					await loadRails(nextLevel, null)
				}
			} finally {
				if (!cancelled) {
					setLoading(false)
				}
			}
		}

		init()

		return () => {
			cancelled = true
		}
	}, [loadRails])

	const setLevel = useCallback(
		async (nextLevel: BookLevel) => {
			if (nextLevel === level) return
			setLevelState(nextLevel)
			setLoading(true)
			try {
				await Promise.allSettled([
					updateLastSelectedLevel(toLastSelectedLevel(nextLevel)),
					loadRails(nextLevel, category),
				])
			} finally {
				setLoading(false)
			}
		},
		[category, level, loadRails],
	)

	const setCategory = useCallback(
		async (nextCategory: string | null) => {
			const value = nextCategory === category ? null : nextCategory
			setCategoryState(value)
			setLoading(true)
			try {
				await loadRails(level, value)
			} finally {
				setLoading(false)
			}
		},
		[category, level, loadRails],
	)

	const setBookLanguages = useCallback(
		async (learningCode: string, nativeCode: string) => {
			await Promise.allSettled([
				updateBookLanguageLearning(learningCode),
				updateBookLanguageNative(nativeCode),
			])
			setReader((prev) => ({
				...(prev || {}),
				book_language_learning: learningCode,
				book_language_native: nativeCode,
			}))
		},
		[],
	)

	return {
		level,
		setLevel,
		category,
		setCategory,
		reader,
		categories,
		languages,
		setBookLanguages,
		learningLang: reader?.book_language_learning || DEFAULT_LEARNING_LANG,
		nativeLang: reader?.book_language_native || DEFAULT_NATIVE_LANG,
		continueReading,
		allBooks,
		topPicks,
		recentlyAdded,
		popularNow,
		loading,
	}
}
