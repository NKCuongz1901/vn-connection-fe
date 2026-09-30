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
