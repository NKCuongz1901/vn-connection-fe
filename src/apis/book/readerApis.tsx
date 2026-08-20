import { convertParams } from '@/ultis/object'
import axios from '../../axios'
import { BOOK_ROUTES } from '@/routes'

export const getReaderProfile = async () => {
	return axios.get(BOOK_ROUTES.readerProfile, {
		params: convertParams({
			fields: ['$all'],
		}),
	})
}

export const updateLastSelectedLevel = async (lastSelectedLevel: string) => {
	return axios.put(BOOK_ROUTES.lastSelectedLevel, {
		last_selected_level: lastSelectedLevel,
	})
}

export const updateBookLanguageLearning = async (languageCode: string) => {
	return axios.put(BOOK_ROUTES.bookLanguageLearning, {
		book_language_learning: languageCode,
	})
}

export const updateBookLanguageNative = async (languageCode: string) => {
	return axios.put(BOOK_ROUTES.bookLanguageNative, {
		book_language_native: languageCode,
	})
}
