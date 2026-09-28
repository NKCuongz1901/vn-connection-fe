import { convertParams } from '@/ultis/object'
import axios from '../../axios'
import { BOOK_ROUTES } from '@/routes'
import {
	BookApiItem,
	BookCardItem,
	BookCategory,
	BookLanguage,
	BookListQuery,
	BookReview,
	BookReviewStatistics,
	ContinueReadingApiItem,
} from '@/interface/Book/book.interface'
import { formatListeningTime, pickBookDuration } from '@/Variable/book.variable'

const languageName = (code: string) => {
	try {
		return (
			new Intl.DisplayNames(['en'], { type: 'language' }).of(code) ||
			code.toUpperCase()
		)
	} catch {
		return code.toUpperCase()
	}
}

// One language reads "Vietnamese only"; more than one reads "Multi-language"
export const languageLabelFromCodes = (codes?: string[]) => {
	if (!codes?.length) return undefined
	const unique = Array.from(
		new Set(codes.map((code) => code.split('-')[0].toLowerCase())),
	)
	return unique.length > 1 ? 'Multi-language' : `${languageName(unique[0])} only`
}

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

	const duration = pickBookDuration(item.book_duration, undefined, item.est_duration)

	return {
		id,
		title: item.title || 'Untitled',
		author: item.author || '',
		coverImage: item.cover_image,
		category: item.category?.[0],
		rating: item.review_summary?.overall_rating,
		durationLabel: duration ? formatListeningTime(duration) : undefined,
		languageLabel: languageLabelFromCodes(item.language),
		viewCount: item.total_view_count,
		isFavourited: item.is_favourited,
		shareLink: item.share_link,
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
	const duration = pickBookDuration(book?.book_duration, undefined, book?.est_duration)

	return {
		id,
		title: book?.title || 'Untitled',
		author: book?.author || '',
		coverImage: book?.cover_image,
		category: book?.category?.[0],
		rating: book?.review_summary?.overall_rating,
		progressLabel: maxPages ? `Page ${currentPage}/${maxPages}` : undefined,
		durationLabel: duration ? formatListeningTime(duration) : undefined,
		languageLabel: languageLabelFromCodes(book?.language),
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

export const toggleFavouriteBook = async (bookId: string) => {
	return axios.post(`${BOOK_ROUTES.favourite}/${bookId}`)
}

export const getBookReviews = async (
	bookId: string,
	params: { limit?: number; offset?: number } = {},
) => {
	return axios.get(`${BOOK_ROUTES.book}/${bookId}/reviews`, {
		params: { sortBy: 'newest', limit: 20, offset: 0, ...params },
	})
}

export const parseBookReviewStatistics = (
	res: unknown,
): BookReviewStatistics | null => {
	const data = res as { results?: { statistics?: BookReviewStatistics } }
	return data?.results?.statistics || null
}

export const getMyBookReview = async (bookId: string) => {
	return axios.get(`${BOOK_ROUTES.book}/${bookId}/my-review`)
}

export const createBookReview = async (payload: {
	book_id: string
	content_rating: number
	comment?: string
}) => {
	return axios.post(BOOK_ROUTES.review, payload)
}

export const updateBookReview = async (
	reviewId: string,
	payload: {
		content_rating?: number
		comment?: string
	},
) => {
	return axios.put(`${BOOK_ROUTES.review}/${reviewId}`, payload)
}

export const parseBookReview = (res: unknown): BookReview | null => {
	const parsed = parseApiObject<BookReview>(res)
	if (parsed?.id) return parsed
	const data = res as { results?: BookReview | null }
	return data?.results?.id ? data.results : null
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

export const quickTranslateWord = async (payload: {
	word: string
	sourceLanguage: string
	targetLanguage: string
	book_id?: string
}) => {
	return axios.post(BOOK_ROUTES.quickTranslate, payload)
}

export const getReadingSearchVocab = async (params: {
	book_id?: string
	source_language?: string
	limit?: number
	offset?: number
} = {}) => {
	return axios.get(BOOK_ROUTES.readingSearchVocab, {
		params: convertParams(params),
	})
}

export const deleteReadingSearchVocabWord = async (sourceVocabId: string) => {
	return axios.delete(`${BOOK_ROUTES.readingSearchVocab}/${sourceVocabId}`)
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
