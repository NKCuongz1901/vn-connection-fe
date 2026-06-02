import { isArray } from '@/ultis/array'

export const LOCAL_SEARCH_QUERY = {
	languages: 'languages',
	interest: 'interest',
} as const

const parseCommaList = (value?: string | null) => {
	if (!value) return []
	return value
		.split(',')
		.map((item) => item.trim())
		.filter(Boolean)
}

export const parseLocalFilterFromSearchParams = (
	searchParams: URLSearchParams | Record<string, string>,
) => {
	const get = (key: string) => {
		if (searchParams instanceof URLSearchParams) {
			return searchParams.get(key)
		}
		return searchParams[key] ?? null
	}

	return {
		languages_can_speak_array: parseCommaList(
			get(LOCAL_SEARCH_QUERY.languages),
		),
		interest: parseCommaList(get(LOCAL_SEARCH_QUERY.interest)),
	}
}

export const syncLocalFilterToUrl = (
	languages_can_speak_array: string[],
	interest: string[],
) => {
	if (typeof window === 'undefined') return

	const params = new URLSearchParams(window.location.search)

	if (isArray(languages_can_speak_array, 1)) {
		params.set(LOCAL_SEARCH_QUERY.languages, languages_can_speak_array.join(','))
	} else {
		params.delete(LOCAL_SEARCH_QUERY.languages)
	}

	if (isArray(interest, 1)) {
		params.set(LOCAL_SEARCH_QUERY.interest, interest.join(','))
	} else {
		params.delete(LOCAL_SEARCH_QUERY.interest)
	}

	const query = params.toString()
	const url = `${window.location.pathname}${query ? `?${query}` : ''}`
	window.history.replaceState({}, '', url)
}
