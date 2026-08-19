export type BookReviewSummary = {
	overall_rating?: number
}

export type ReadingProgress = {
	chapter_id?: string
	current_page?: number
	audio_minute?: number
	language_code?: string
	last_read_at?: string
	max_page?: number
}

export type BookApiItem = {
	id?: string
	title?: string
	author?: string
	cover_image?: string
	summary?: string
	level?: string
	category?: string[]
	est_duration?: number
	total_pages?: number
	total_words?: number
	total_sentences?: number
	language?: string[]
	language_type?: string
	review_summary?: BookReviewSummary
	is_favourited?: boolean
	reading_progress?: ReadingProgress[]
}

export type BookProgressByLanguage = {
	language_code?: string
	current_page?: number
}

export type ContinueReadingChapter = {
	chapter_id?: string
	chapter?: {
		id?: string
		title?: string
	}
	max_pages?: number
	progress_by_language?: BookProgressByLanguage[]
}

export type ContinueReadingApiItem = {
	book_id?: string
	book?: BookApiItem
	chapters?: ContinueReadingChapter[]
}

export type BookCategory = {
	id?: string
	title?: string
	type?: string
	order?: number
}

export type ReaderProfile = {
	id?: string
	user_id?: string
	name?: string
	last_selected_level?: string
	book_language_learning?: string
	book_language_native?: string
}

export type BookLanguage = {
	id?: string
	name?: string
	code?: string
	flag?: string
	nativeName?: string
	native_name?: string
	nativeCode?: string
	native_code?: string
}

export type BookCardItem = {
	id: string
	title: string
	author: string
	coverImage?: string
	category?: string
	rating?: number
	progressLabel?: string
	chapterId?: string
	page?: number
}

export type BookListQuery = {
	page?: number
	limit?: number
	level?: string
	category?: string
	search_text?: string
	book_id?: string
	chapter_id?: string
}

export type ChapterApiItem = {
	id?: string
	book_id?: string
	title?: string
	description?: string
	cover_image?: string
	chapter_number?: number
	total_pages?: number
	published_status?: string
}

export type ChapterContentPart = {
	lang?: string
	text?: string
}

export type ChapterContentItem = {
	type?: string
	parts?: ChapterContentPart[]
}

export type ChapterPage = {
	id?: string
	chapter_id?: string
	page_number?: number
	total_pages?: number
	language?: string
	content?: ChapterContentItem[]
}

export type ChapterAudio = {
	id?: string
	book_id?: string
	chapter_id?: string
	url?: string
	language?: string
	language_variant?: string
	duration?: number
	source_text?: string
}

export type BookReadMode = 'read' | 'listen'
