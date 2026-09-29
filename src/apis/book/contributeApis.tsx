import axios from '../../axios'
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
