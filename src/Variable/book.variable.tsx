export const BOOK_LEVELS = ['A1', 'A2', 'B1', 'B2', 'Native'] as const

export type BookLevel = (typeof BOOK_LEVELS)[number]

/** Query param for list APIs (`a1` | `native`). */
export const toBookListLevel = (level: BookLevel) =>
	level === 'Native' ? 'native' : level.toLowerCase()

/** Body for `PUT /reader/profile/last-selected-level` (`A1` | `NATIVE`). */
export const toLastSelectedLevel = (level: BookLevel) =>
	level === 'Native' ? 'NATIVE' : level

export const normalizeBookLevel = (value?: string | null): BookLevel => {
	if (!value) return 'A1'
	const upper = value.toUpperCase()
	if (upper === 'NATIVE') return 'Native'
	if (upper === 'A1' || upper === 'A2' || upper === 'B1' || upper === 'B2') {
		return upper
	}
	return 'A1'
}

export const BOOK_NAV = [
	{ id: 'overview', label: 'All books', href: 'mini-apps/books-audio' },
	{ id: 'shadowing', label: 'Shadowing', disabled: true },
	{ id: 'library', label: 'My Library', disabled: true },
	{ id: 'vocab', label: 'Vocabulary', disabled: true },
	{ id: 'profile', label: 'Reading profile', disabled: true },
	{ id: 'contribute', label: 'Contributed book', disabled: true },
] as const

export const BOOK_CATEGORIES = [
	'Self-growth',
	'Conversation',
	'Fiction',
	'Non-fiction',
	'Classics',
	'Moral',
	'Thriller',
	'Community contributions',
] as const

export const BOOK_ROOT = 'mini-apps/books-audio'

export const DEFAULT_LEARNING_LANG = 'en-gb'
export const DEFAULT_NATIVE_LANG = 'vi-south'

export const FALLBACK_BOOK_LANGUAGES = [
	{ code: 'en-gb', name: 'English (UK)' },
	{ code: 'en', name: 'English' },
	{ code: 'vi-south', name: 'Vietnamese' },
	{ code: 'vi', name: 'Vietnamese' },
]

export type BookSeeAllKind =
	| 'all'
	| 'top-pick'
	| 'popular'
	| 'recent'
	| 'continue'

export const BOOK_SEE_ALL: Record<
	BookSeeAllKind,
	{ title: string; path: string }
> = {
	continue: { title: 'Continue reading', path: `${BOOK_ROOT}/continue` },
	all: { title: 'All books', path: `${BOOK_ROOT}/all` },
	'top-pick': { title: 'Top picks for you', path: `${BOOK_ROOT}/top-pick` },
	recent: { title: 'Recently added', path: `${BOOK_ROOT}/recent` },
	popular: { title: 'Popular now', path: `${BOOK_ROOT}/popular` },
}

export const bookDetailPath = (id: string) => `${BOOK_ROOT}/book/${id}`

export const bookReadPath = (
	id: string,
	query?: { chapter?: string; page?: number; mode?: 'read' | 'listen' },
) => {
	const params = new URLSearchParams()
	if (query?.chapter) params.set('chapter', query.chapter)
	if (query?.page) params.set('page', String(query.page))
	if (query?.mode) params.set('mode', query.mode)
	const qs = params.toString()
	return `${BOOK_ROOT}/book/${id}/read${qs ? `?${qs}` : ''}`
}

export const formatBookDuration = (seconds?: number) => {
	if (!seconds) return ''
	const hours = Math.floor(seconds / 3600)
	const minutes = Math.round((seconds % 3600) / 60)
	if (hours) return `${hours}h ${minutes}m`
	return `${minutes}m`
}

export const formatPlaybackTime = (seconds?: number) => {
	const total = Math.max(0, Math.floor(Number(seconds) || 0))
	const hours = Math.floor(total / 3600)
	const mins = Math.floor((total % 3600) / 60)
	const secs = total % 60
	if (hours) {
		return `${hours}:${mins.toString().padStart(2, '0')}:${secs
			.toString()
			.padStart(2, '0')}`
	}
	return `${mins}:${secs.toString().padStart(2, '0')}`
}

export const PLAYBACK_SPEEDS = [0.75, 1, 1.25, 1.5, 1.75, 2] as const
