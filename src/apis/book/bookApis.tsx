import { convertParams } from '@/ultis/object'
import axios from '../../axios'
import { BOOK_ROUTES } from '@/routes'
import {
	BookApiItem,
	BookCardItem,
	BookCategory,
	BookLanguage,
	BookListQuery,
	ContinueReadingApiItem,
} from '@/interface/Book/book.interface'

export const parseApiList = <T,>(res: unknown): T[] => {
	const data = res as { results?: any }
	const results = data?.results
	const rows = results?.objects?.rows
	if (Array.isArray(rows)) return rows
	if (Array.isArray(results?.objects)) return results.objects
	if (Array.isArray(results?.object)) return results.object
	if (Array.isArray(results)) return results
	if (Array.isArray(res)) return res as T[]
	return []
}

export const parseApiObject = <T,>(res: unknown): T | null => {
	const data = res as { results?: any }
	const results = data?.results
	const object = results?.object
	if (object && typeof object === 'object' && !Array.isArray(object)) {
		return object as T
	}
	if (
		results?.objects &&
		typeof results.objects === 'object' &&
		!Array.isArray(results.objects) &&
		!Array.isArray(results.objects.rows)
	) {
		return results.objects as T
	}
	return null
}

export const mapBookCard = (item?: BookApiItem | null): BookCardItem | null => {
	const id = item?.id
	if (!id) return null

	return {
		id,
		title: item.title || 'Untitled',
		author: item.author || '',
		coverImage: item.cover_image,
		category: item.category?.[0],
		rating: item.review_summary?.overall_rating,
	}
}

export const mapContinueReadingCard = (
	item?: ContinueReadingApiItem | null,
): BookCardItem | null => {
	const book = item?.book
	const id = book?.id || item?.book_id
	if (!id) return null

	const chapters = item?.chapters || []
	const currentPage = chapters.reduce((sum, chapter) => {
		const pages =
			chapter.progress_by_language?.map((row) => row.current_page || 0) || []
		return sum + (pages.length ? Math.max(...pages) : 0)
	}, 0)
	const maxPages = chapters.reduce(
		(sum, chapter) => sum + (chapter.max_pages || 0),
		0,
	)

	const resume = [...chapters].reverse().find((chapter) => {
		const pages =
			chapter.progress_by_language?.map((row) => row.current_page || 0) || []
		return (pages.length ? Math.max(...pages) : 0) > 0
	}) || chapters[0]
	const resumePages =
		resume?.progress_by_language?.map((row) => row.current_page || 0) || []

	return {
		id,
		title: book?.title || 'Untitled',
		author: book?.author || '',
		coverImage: book?.cover_image,
		category: book?.category?.[0],
		rating: book?.review_summary?.overall_rating,
		progressLabel: maxPages ? `Page ${currentPage}/${maxPages}` : undefined,
		chapterId: resume?.chapter_id || resume?.chapter?.id,
		page: resumePages.length ? Math.max(...resumePages) : 1,
	}
}

export const getBookListV2 = async (params: BookListQuery = {}) => {
	return axios.get(BOOK_ROUTES.bookListV2, {
		params: convertParams(params),
	})
}

export const getContinueReadingBooks = async (params: BookListQuery = {}) => {
	return axios.get(BOOK_ROUTES.continueReading, {
		params: convertParams(params),
	})
}

export const getTopPickBooks = async (params: BookListQuery = {}) => {
	return axios.get(BOOK_ROUTES.topPick, {
		params: convertParams(params),
	})
}

export const getRecentlyAddedBooks = async (params: BookListQuery = {}) => {
	return axios.get(BOOK_ROUTES.recentlyAdded, {
		params: convertParams(params),
	})
}

export const getPopularNowBooks = async (params: BookListQuery = {}) => {
	return axios.get(BOOK_ROUTES.popularNow, {
		params: convertParams(params),
	})
}

export const getBookCategories = async () => {
	return axios.get(BOOK_ROUTES.category, {
		params: convertParams({
			fields: ['$all'],
			where: { type: 'BOOK' },
		}),
	})
}

export const mapCategoryList = (res: unknown): BookCategory[] =>
	parseApiList<BookCategory>(res).filter((item) => item.title)

export const parseListTotal = (res: unknown, fallback = 0) => {
	const data = res as { results?: any; pagination?: { total?: number } }
	return (
		data?.results?.objects?.count ??
		data?.pagination?.total ??
		fallback
	)
}

export const getBookDetail = async (id: string) => {
	return axios.get(`${BOOK_ROUTES.book}/${id}`)
}

export const getAudioList = async (params: BookListQuery = {}) => {
	return axios.get(BOOK_ROUTES.audioList, {
		params: convertParams(params),
	})
}

export const updateReadingProgress = async (payload: {
	book_id: string
	chapter_id: string
	current_page: number
	audio_minute?: number
	language_code?: string
}) => {
	return axios.post(BOOK_ROUTES.updateReadingProgress, payload)
}

export const getReadingProgress = async (bookId: string) => {
	return axios.get(`${BOOK_ROUTES.readingProgress}/${bookId}`)
}

export const getBookLanguagesVariant = async () => {
	return axios.get(BOOK_ROUTES.languagesVariant)
}

export const parseBookLanguages = (res: unknown): BookLanguage[] => {
	const object = parseApiObject<{ languages?: BookLanguage[] }>(res)
	if (Array.isArray(object?.languages)) {
		return object.languages.filter((item) => item.code)
	}
	return parseApiList<BookLanguage>(res).filter((item) => item.code)
}

export const findBookLanguage = (
	languages: BookLanguage[],
	code?: string | null,
) => {
	if (!code) return undefined
	const lower = code.toLowerCase()
	return (
		languages.find((item) => item.code?.toLowerCase() === lower) ||
		languages.find((item) => item.code?.toLowerCase().startsWith(lower.split('-')[0])) ||
		languages.find((item) => lower.startsWith(item.code?.toLowerCase() || ''))
	)
}
