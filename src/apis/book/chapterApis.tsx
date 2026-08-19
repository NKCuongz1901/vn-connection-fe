import { convertParams } from '@/ultis/object'
import axios from '../../axios'
import { BOOK_ROUTES } from '@/routes'
import {
	ChapterApiItem,
	ChapterAudio,
	ChapterContentPart,
	ChapterPage,
} from '@/interface/Book/book.interface'
import { parseApiList, parseApiObject } from './bookApis'

export const getChapterList = async (
	bookId: string,
	params: { page?: number; limit?: number } = {},
) => {
	return axios.get(BOOK_ROUTES.chapter, {
		params: convertParams({
			fields: ['$all'],
			where: { book_id: bookId },
			page: params.page || 1,
			limit: params.limit || 50,
		}),
	})
}

export const getChapterContentByPage = async (
	chapterId: string,
	page: number,
	language: string,
) => {
	return axios.get(
		`${BOOK_ROUTES.chapter}/${chapterId}/${page}/${encodeURIComponent(language)}`,
	)
}

export const parseChapterPage = (res: unknown): ChapterPage | null => {
	const object = parseApiObject<ChapterPage>(res)
	if (object?.content || object?.total_pages || object?.page_number) {
		return object
	}

	const data = res as { results?: ChapterPage }
	if (data?.results?.content || data?.results?.total_pages) {
		return data.results
	}

	const rows = parseApiList<ChapterPage>(res)
	return rows[0] || null
}

export const sortChapters = (chapters: ChapterApiItem[]) =>
	[...chapters].sort(
		(a, b) => (a.chapter_number || 0) - (b.chapter_number || 0),
	)

export const pickContentPart = (
	parts: ChapterContentPart[] | undefined,
	lang: string,
) => {
	if (!parts?.length) return undefined
	const lower = lang.toLowerCase()
	const exact = parts.find((part) => part.lang?.toLowerCase() === lower)
	if (exact) return exact
	const prefix = lower.split('-')[0]
	return (
		parts.find((part) => part.lang?.toLowerCase().startsWith(prefix)) ||
		parts[0]
	)
}

export const pickChapterAudio = (audios: ChapterAudio[], lang: string) => {
	const lower = lang.toLowerCase()
	const prefix = lower.split('-')[0]
	return (
		audios.find(
			(item) =>
				item.language?.toLowerCase() === lower ||
				item.language_variant?.toLowerCase() === lower,
		) ||
		audios.find(
			(item) =>
				item.language?.toLowerCase().startsWith(prefix) ||
				item.language_variant?.toLowerCase().startsWith(prefix),
		) ||
		audios.find((item) => item.url)
	)
}
