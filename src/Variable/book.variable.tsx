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
	// Studying: the books the reader is reading or listening to
	{ id: 'studying', label: 'Studying', href: 'mini-apps/books-audio/continue' },
	{ id: 'library', label: 'My Library', href: 'mini-apps/books-audio/library' },
	{ id: 'vocab', label: 'Vocabulary', href: 'mini-apps/books-audio/vocabulary' },
	{ id: 'profile', label: 'Reading profile', href: 'mini-apps/books-audio/profile' },
	{ id: 'contribute', label: 'Contributed book', href: 'mini-apps/books-audio/contributed' },
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
export const BOOK_STREAK_PATH = `${BOOK_ROOT}/streak`
export const BOOK_PROFILE_PATH = `${BOOK_ROOT}/profile`
export const BOOK_VOCAB_PATH = `${BOOK_ROOT}/vocabulary`

/** Temporary kill switch for Books & Audio on web (main). Flip to true to ship. */
export const BOOK_WEB_ENABLED = true

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
	| 'category'

export const BOOK_SEE_ALL: Record<
	Exclude<BookSeeAllKind, 'category'>,
	{ title: string; path: string }
> = {
	continue: { title: 'Continue reading', path: `${BOOK_ROOT}/continue` },
	all: { title: 'All books', path: `${BOOK_ROOT}/all` },
	'top-pick': { title: 'Top picks for you', path: `${BOOK_ROOT}/top-pick` },
	recent: { title: 'Recently added', path: `${BOOK_ROOT}/recent` },
	popular: { title: 'Popular now', path: `${BOOK_ROOT}/popular` },
}

export const BOOK_SEARCHABLE_KINDS: BookSeeAllKind[] = [
	'all',
	'top-pick',
	'recent',
	'popular',
	'category',
]

export const bookCategoryPath = (id: string) =>
	`${BOOK_ROOT}/category/${encodeURIComponent(id)}`

export const bookDetailPath = (id: string) => `${BOOK_ROOT}/book/${id}`

/** The reader's own book: details and chapters */
export const contributedBookPath = (id: string) => `${BOOK_ROOT}/contributed/${id}`

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

export const pickBookDuration = (
	durations?: Array<{ language?: string; duration?: number }> | null,
	preferredLang?: string | null,
	fallback?: number,
) => {
	if (durations?.length) {
		const pref = (preferredLang || '').toLowerCase()
		const prefix = pref.split('-')[0]
		const match =
			(pref &&
				durations.find(
					(item) => (item.language || '').toLowerCase() === pref,
				)) ||
			(prefix &&
				durations.find((item) => {
					const lang = (item.language || '').toLowerCase()
					return (
						lang === prefix ||
						lang.startsWith(`${prefix}-`) ||
						pref.startsWith(lang)
					)
				})) ||
			durations.find((item) => Number(item.duration) > 0)
		const duration = Number(match?.duration)
		if (duration > 0) return duration
	}
	return fallback && fallback > 0 ? fallback : undefined
}

export const formatListeningTime = (seconds?: number) => {
	if (!seconds) return '—'
	const hours = Math.floor(seconds / 3600)
	if (hours >= 1) return `${hours} hour${hours === 1 ? '' : 's'}`
	const minutes = Math.max(1, Math.round(seconds / 60))
	return `${minutes} min`
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
