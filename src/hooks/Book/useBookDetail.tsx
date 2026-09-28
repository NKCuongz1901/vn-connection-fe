'use client'

import { useCallback, useEffect, useState } from 'react'

import {
	deleteReadingSearchVocabWord,
	getBookDetail,
	getReadingSearchVocab,
	parseApiList,
	parseApiObject,
	toggleFavouriteBook,
} from '@/apis/book/bookApis'
import { getChapterList, sortChapters } from '@/apis/book/chapterApis'
import { useModal } from '@/context/ModalContext'
import {
	BookApiItem,
	BookReadMode,
	ChapterApiItem,
	ReadingProgress,
	ReadingSearchVocabItem,
} from '@/interface/Book/book.interface'
import { bookReadPath } from '@/Variable/book.variable'

const parseFavouriteFlag = (res: unknown): boolean | undefined => {
	const parsed = parseApiObject<{ is_favourited?: boolean }>(res)
	if (typeof parsed?.is_favourited === 'boolean') return parsed.is_favourited
	const data = res as {
		results?: { is_favourited?: boolean }
		is_favourited?: boolean
	}
	if (typeof data?.results?.is_favourited === 'boolean') {
		return data.results.is_favourited
	}
	if (typeof data?.is_favourited === 'boolean') return data.is_favourited
	return undefined
}

export default function useBookDetail(bookId: string) {
	const { openError } = useModal()
	const [book, setBook] = useState<BookApiItem | null>(null)
	const [chapters, setChapters] = useState<ChapterApiItem[]>([])
	const [tab, setTab] = useState<'summary' | 'vocab' | 'chapter'>('summary')
	const [loading, setLoading] = useState(true)
	const [savingFavourite, setSavingFavourite] = useState(false)
	const [vocabWords, setVocabWords] = useState<ReadingSearchVocabItem[]>([])
	const [vocabLoading, setVocabLoading] = useState(false)
	const [vocabLoaded, setVocabLoaded] = useState(false)

	useEffect(() => {
		let cancelled = false

		const load = async () => {
			setLoading(true)
			try {
				const [bookRes, chapterRes] = await Promise.allSettled([
					getBookDetail(bookId),
					getChapterList(bookId),
				])

				if (cancelled) return

				if (bookRes.status === 'fulfilled') {
					setBook(parseApiObject<BookApiItem>(bookRes.value))
				}
				if (chapterRes.status === 'fulfilled') {
					setChapters(sortChapters(parseApiList<ChapterApiItem>(chapterRes.value)))
				}
			} finally {
				if (!cancelled) setLoading(false)
			}
		}

		load()
		setVocabWords([])
		setVocabLoaded(false)

		return () => {
			cancelled = true
		}
	}, [bookId])

	useEffect(() => {
		if (tab !== 'vocab' || vocabLoaded || !bookId) return
		let cancelled = false

		const loadVocab = async () => {
			setVocabLoading(true)
			try {
				const res = await getReadingSearchVocab({ book_id: bookId, limit: 100 })
				if (!cancelled) {
					setVocabWords(parseApiList<ReadingSearchVocabItem>(res))
					setVocabLoaded(true)
				}
			} finally {
				if (!cancelled) setVocabLoading(false)
			}
		}

		loadVocab()

		return () => {
			cancelled = true
		}
	}, [bookId, tab, vocabLoaded])

	const deleteVocabWord = useCallback(async (sourceVocabId: string) => {
		const prev = vocabWords
		setVocabWords((list) => list.filter((item) => item.source_vocab_id !== sourceVocabId))
		try {
			await deleteReadingSearchVocabWord(sourceVocabId)
		} catch (error) {
			setVocabWords(prev)
			openError(error)
		}
	}, [openError, vocabWords])

	const resume = useCallback(
		(mode: BookReadMode) => {
			const progress = [...(book?.reading_progress || [])].sort((a, b) =>
				(b.last_read_at || '').localeCompare(a.last_read_at || ''),
			)[0] as ReadingProgress | undefined
			const chapterId =
				(progress?.chapter_id &&
					chapters.some((item) => item.id === progress.chapter_id) &&
					progress.chapter_id) ||
				chapters[0]?.id
			return bookReadPath(bookId, {
				chapter: chapterId,
				page: progress?.current_page || 1,
				mode,
			})
		},
		[book?.reading_progress, bookId, chapters],
	)

	const refreshBook = useCallback(async () => {
		try {
			const bookRes = await getBookDetail(bookId)
			setBook(parseApiObject<BookApiItem>(bookRes))
		} catch {
			// keep current book
		}
	}, [bookId])

	const toggleFavourite = useCallback(async () => {
		if (!bookId || savingFavourite) return
		setSavingFavourite(true)
		try {
			const res = await toggleFavouriteBook(bookId)
			const next = parseFavouriteFlag(res)
			setBook((prev) =>
				prev
					? {
							...prev,
							is_favourited: next ?? !prev.is_favourited,
						}
					: prev,
			)
		} catch (error) {
			openError(error)
		} finally {
			setSavingFavourite(false)
		}
	}, [bookId, openError, savingFavourite])

	return {
		book,
		chapters,
		tab,
		setTab,
		loading,
		resume,
		toggleFavourite,
		savingFavourite,
		refreshBook,
		vocabWords,
		vocabLoading,
		deleteVocabWord,
	}
}
