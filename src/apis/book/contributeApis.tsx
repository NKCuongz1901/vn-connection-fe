import axios from '../../axios'
import axiosBase from 'axios'
import { BOOK_ROUTES } from '@/routes'
import { BookApiItem } from '@/interface/Book/book.interface'

import { parseApiObject } from './bookApis'

/** Book status tabs of My contributed books and the approved_status they send */
export type ContributedTab = 'all' | 'approved' | 'under_review' | 'rejected'

export const CONTRIBUTED_TAB_STATUS: Record<ContributedTab, string | undefined> = {
	all: undefined,
	approved: 'approved',
	// the API calls "has chapters, none rejected, some not approved yet" inprogress
	under_review: 'inprogress',
	rejected: 'rejected',
}

export type ContributedSort = 'newest' | 'oldest' | 'a-z' | 'z-a'

export type ContributedBook = BookApiItem & {
	approved_status?: 'approved' | 'under_review' | 'inprogress' | 'rejected' | null
	published_status?: string | null
}

export const getMyContributedBooks = async (params: {
	tab: ContributedTab
	search?: string
	sortBy?: ContributedSort
	level?: string
	category?: string
	limit?: number
	offset?: number
}) => {
	const { tab, search, sortBy = 'newest', level, category, limit = 20, offset = 0 } = params
	return axios.get(`${BOOK_ROUTES.book}/my-distributed`, {
		params: {
			sortBy,
			limit,
			offset,
			...(CONTRIBUTED_TAB_STATUS[tab] ? { approved_status: CONTRIBUTED_TAB_STATUS[tab] } : {}),
			...(search ? { search_text: search } : {}),
			...(level ? { level } : {}),
			...(category ? { category } : {}),
		},
	})
}

export type ContributeBookPayload = {
	cover_image: string
	title: string
	author: string
	summary: string
	level: string
	category: string[]
	language: string[]
	/** create only: single or bilingual */
	language_type?: 'single' | 'bilingual'
}

export const createContributedBook = async (payload: ContributeBookPayload) =>
	axios.post(BOOK_ROUTES.book, payload)

export const updateContributedBook = async (id: string, payload: ContributeBookPayload) => {
	// the language type is fixed once the book exists
	const { language_type: _languageType, ...rest } = payload
	return axios.put(`${BOOK_ROUTES.book}/${id}`, rest)
}

export const deleteContributedBook = async (id: string) =>
	axios.delete(`${BOOK_ROUTES.book}/${id}`)

export type BookLanguageOption = {
	type?: 'single' | 'bilingual'
	code?: string
	name?: string
}

/** Languages a book can be written in: single languages and English pairs */
export const getContributeLanguages = async () => {
	const res = await axios.get(`${BOOK_ROUTES.book}/languages`)
	return (
		parseApiObject<{ languages?: BookLanguageOption[] }>(res)?.languages || []
	).filter((item) => item.code)
}

/** A chapter of the reader's own book (GET chapter/my-book/:book_id) */
export type ContributedChapter = {
	id?: string
	book_id?: string
	title?: string
	description?: string | null
	cover_image?: string | null
	chapter_number?: number
	total_pages?: number
	approved_status?: 'approved' | 'inprogress' | 'rejected' | null
	published_status?: 'published' | 'unpublished' | null
}

export const getMyBookChapters = async (bookId: string) =>
	axios.get(`${BOOK_ROUTES.chapter}/my-book/${bookId}`, { params: { limit: 100, offset: 0 } })

export type CreateChapterPayload = {
	book_id: string
	doc_url: string
	title?: string
	summary?: string
	thumbnail?: string
}

/** One-language chapter: the API reads the text from the docx and sends it for review */
export const createSingleLanguageChapter = async (payload: CreateChapterPayload) =>
	axios.post(`${BOOK_ROUTES.chapter}/create-single-language`, payload)

/** Only approved chapters can be published */
export const publishChapters = async (ids: string[]) =>
	axios.post(`${BOOK_ROUTES.chapter}/publish-single-language`, { ids })

export const unpublishChapters = async (ids: string[]) =>
	axios.post(`${BOOK_ROUTES.chapter}/unpublish-single-language`, { ids })

export const deleteChapter = async (id: string) =>
	axios.delete(`${BOOK_ROUTES.chapter}/single-language/${id}`)

export type UpdateChapterPayload = Partial<Omit<CreateChapterPayload, 'book_id'>>

/** Edit a one-language chapter; a new docx sends it for review again */
export const updateSingleLanguageChapter = async (id: string, payload: UpdateChapterPayload) =>
	axios.put(`${BOOK_ROUTES.chapter}/update-single-language/${id}`, payload)

// Multilingual books belong to UniVini accounts, which use the published-chapter
// endpoints: the English docx is translated and voiced for every language.

export type CreateMultilingualChapterPayload = {
	book_id: string
	english_doc_url: string
	title?: string
	summary?: string
	thumbnail?: string
}

export const createMultilingualChapter = async (payload: CreateMultilingualChapterPayload) =>
	axios.post(`${BOOK_ROUTES.chapter}/create-published`, payload)

/** One language (and accent) of a multilingual chapter: its translated text and audio */
export type ChapterLanguageFile = {
	id?: string
	language?: string
	language_variant?: string | null
	status?: string
	url?: string | null
	doc_url?: string | null
	error?: string | null
	duration?: number | null
}

/** Translation and audio progress of a multilingual chapter */
export type ChapterProcessStatus = {
	percentage_complete?: number
	ready_to_publish?: boolean
	failed_audios?: number
	audio_details?: ChapterLanguageFile[]
}

export const getChapterProcessStatus = async (id: string) =>
	axios.get(`${BOOK_ROUTES.chapter}/${id}/status`)

export const publishMultilingualChapters = async (ids: string[]) =>
	axios.post(`${BOOK_ROUTES.chapter}/publish/list`, { ids })

export const unpublishMultilingualChapter = async (id: string) =>
	axios.post(`${BOOK_ROUTES.chapter}/${id}/unpublish`)

export const deleteMultilingualChapter = async (id: string) =>
	axios.delete(`${BOOK_ROUTES.chapter}/${id}`)

const axiosUpload = axiosBase.create()

/** Upload a .docx through a pre-signed URL and return its public URL */
export const uploadChapterDocument = async (file: File) => {
	const res = (await axios.post('files/pre-signed-url', {
		fileType: 'document',
		fileSize: file.size,
		fileName: file.name,
	})) as { results?: { object?: { result_url?: string; upload_url?: string } } }
	const { result_url, upload_url } = res?.results?.object || {}
	if (!upload_url || !result_url) throw new Error('no upload url')
	await axiosUpload.put(upload_url, file, {
		headers: {
			'Content-Type': file.type || DOCX_MIME,
			'Cache-Control': 'public, max-age=31536000, immutable',
		},
	})
	return result_url
}

export const DOCX_MIME =
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

export type EditPublishedAction =
	| 'regenerate_text'
	| 'regenerate_audio'
	| 'force_update_text'
	| 'force_update_audio'

/**
 * Redo or replace one language of a multilingual chapter. The API unpublishes a
 * published chapter first; a replaced docx must keep the chapter's sentences.
 */
export const editPublishedChapter = async (
	chapterId: string,
	payload: { action: EditPublishedAction; book_audio_id: string; docx_url?: string; audio_url?: string },
) => axios.put(`${BOOK_ROUTES.chapter}/${chapterId}/edit-published`, payload)
