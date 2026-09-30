import axios from '../../axios'
import { BOOK_ROUTES } from '@/routes'

export type VocabStrength = 'weak' | 'medium' | 'strong'
export type VocabSort = 'latest_add' | 'oldest_add' | 'a_to_z' | 'z_to_a'

export type VocabTranslation = {
	language?: string
	vocab?: string
	meaning?: string
	example?: string
	ipa?: string | null
}

export type VocabSense = {
	sense_rank?: number
	meaning?: string
	example?: string
	translations?: VocabTranslation[]
}

/** A word in a vocab folder with the reader's learning level */
export type VocabWord = {
	source_vocab_id: string
	vocab: string
	source_language?: string
	part_of_speech?: string
	ipa?: string | null
	audio_url?: string | null
	added_at?: string
	senses?: VocabSense[]
	learning_stats?: {
		level?: 'WEAK' | 'MEDIUM' | 'STRONG'
		consecutive_correct?: number
		accuracy?: number
	}
}

export type VocabStrengthCounts = {
	weak_words_count?: number
	medium_words_count?: number
	strong_words_count?: number
}

/** A vocab set (UniVini or the reader's own) with the reader's word counts */
export type VocabFolder = VocabStrengthCounts & {
	id?: string
	name?: string
	avatar?: string | null
	languages?: string[] | null
	total_words?: number
}

/** Words the reader looked up while reading, with weak / medium / strong counts */
export const getReadingSearchedVocab = async (params: {
	sort_by?: VocabSort
	word_type?: VocabStrength
	/** translation languages to include, e.g. ["vi"] */
	languages?: string[]
	limit?: number
	offset?: number
}) => {
	const { languages, ...rest } = params
	return axios.get(BOOK_ROUTES.readingSearchVocab, {
		params: {
			...rest,
			...(languages?.length ? { languages: languages.join(',') } : {}),
		},
	})
}

export const getUniviniVocabSets = async (limit = 20) =>
	axios.get('vocabulary/univini-folder-lists', { params: { limit, offset: 0 } })

export const getMyVocabSets = async (limit = 20) =>
	axios.get('vocabulary/user-folder/list', { params: { limit: String(limit), offset: '0' } })

/** The list payload also carries the weak / medium / strong counts */
export const parseStrengthCounts = (res: unknown): VocabStrengthCounts => {
	const objects = (res as { results?: { objects?: VocabStrengthCounts } })?.results?.objects
	return {
		weak_words_count: objects?.weak_words_count || 0,
		medium_words_count: objects?.medium_words_count || 0,
		strong_words_count: objects?.strong_words_count || 0,
	}
}

export const folderWordCount = (folder: VocabFolder) =>
	folder.total_words ??
	(folder.weak_words_count || 0) + (folder.medium_words_count || 0) + (folder.strong_words_count || 0)

export type LearningType = 'flashcard' | 'writing'

/** One answer choice: a translation of a word; the right one has is_correct */
export type FlashcardOption = {
	id?: string
	vocab?: string
	meaning?: string
	language?: string
	is_correct?: boolean
}

export type FlashcardQuestion = {
	source_vocab_id: string
	vocab: string
	ipa?: string | null
	language?: string
	level?: string
	all_options?: FlashcardOption[]
}

/**
 * Questions for a vocab set; without a folder the reader's searched words are
 * used (source_language picks which of their reading folders)
 */
export const getFlashcardQuestions = async (params: {
	native_language: string
	folder_id?: string
	source_language?: string
	word_type?: VocabStrength
	limit?: number
	wrong_options_count?: number
}) =>
	axios.get('vocabulary/flashcard/questions', {
		params: {
			sort_by: 'random',
			limit: String(params.limit ?? 200),
			wrong_options_count: String(params.wrong_options_count ?? 1),
			native_language: params.native_language,
			...(params.folder_id ? { folder_id: params.folder_id } : {}),
			...(params.source_language ? { source_language: params.source_language } : {}),
			...(params.word_type ? { word_type: params.word_type } : {}),
		},
	})

/** Saves how many times each word was right or wrong (moves it between weak / medium / strong) */
export const submitLearningProgress = async (payload: {
	folder_id: string
	native_language: string
	learning_type: LearningType
	answers: { source_vocab_id: string; correct_count: number; incorrect_count: number }[]
}) => axios.post('vocabulary/learning/progress', payload)

export type VocabLevelGroup = { items?: VocabWord[]; total?: number }

/** A UniVini set's words grouped by level (A1, A2, …) */
export const getUniviniSetLevels = async (params: {
	folder_id: string
	languages: string[]
	sort_by?: VocabSort
	limit?: number
}) =>
	axios.get('vocabulary/univini-folder-vocab-details', {
		params: {
			folder_id: params.folder_id,
			languages: params.languages.join(','),
			limit: String(params.limit ?? 100),
			offset: '0',
			...(params.sort_by ? { sort_by: params.sort_by } : {}),
		},
	})

export const parseLevelGroups = (res: unknown) => {
	const levels =
		(res as { results?: { object?: { levels?: Record<string, VocabLevelGroup> } } })?.results?.object?.levels || {}
	return Object.entries(levels)
		.map(([level, group]) => ({ level, items: group.items || [], total: group.total || group.items?.length || 0 }))
		.filter((group) => group.total > 0)
}

/** A UniVini set's words in one list, with weak / medium / strong counts */
export const getUniviniSetWords = async (params: {
	folder_id: string
	languages: string[]
	word_type?: VocabStrength
	in_progress?: boolean
	limit?: number
	offset?: number
}) =>
	axios.get('vocabulary/univini-folder-vocab-details-merged', {
		params: {
			folder_id: params.folder_id,
			languages: params.languages.join(','),
			limit: String(params.limit ?? 20),
			offset: String(params.offset ?? 0),
			...(params.word_type ? { word_type: params.word_type } : {}),
			...(params.in_progress !== undefined ? { in_progress: String(params.in_progress) } : {}),
		},
	})

export type VocabLanguages = { learning_languages?: string[]; native_language?: string }

/** Extra languages the reader shows for a set, and their native language */
export const getSetLanguages = async (folderId: string) =>
	axios.get('vocabulary/user-languages', { params: { folder_id: folderId } })

export const updateSetLanguages = async (folderId: string, learning: string[], native: string) =>
	axios.put('vocabulary/user-languages', {
		folder_id: folderId,
		learning_languages: learning,
		target_language: native,
	})

/** Languages a vocab set can show (as the API supports) */
export const VOCAB_LANGUAGES = ['en', 'vi', 'fr', 'de', 'es', 'zh', 'ja', 'ko', 'th', 'id', 'ru', 'pt', 'it', 'hi', 'ar']

export const posterOf = (folder: VocabFolder | null | undefined, level: string) => {
	const posters = (folder as { custom_data?: { level_poster?: Record<string, unknown> } } | null)?.custom_data
		?.level_poster
	const value = posters?.[level] ?? posters?.[level.toLowerCase()]
	if (typeof value === 'string') return value
	if (value && typeof value === 'object' && 'url' in value) return String((value as { url?: string }).url || '')
	return ''
}
