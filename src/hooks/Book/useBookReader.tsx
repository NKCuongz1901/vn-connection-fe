'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'

import {
	getAudioList,
	getBookDetail,
	parseApiList,
	parseApiObject,
	updateReadingProgress,
} from '@/apis/book/bookApis'
import {
	getChapterContentByPage,
	getChapterList,
	parseChapterPage,
	pickChapterAudio,
	pickContentPart,
	sortChapters,
} from '@/apis/book/chapterApis'
import { useBookLibrary } from '@/context/BookLibraryContext'
import { useBookPlayer } from '@/context/BookPlayerContext'
import {
	BookApiItem,
	BookReadMode,
	ChapterApiItem,
	ChapterPage,
	ReadingProgress,
} from '@/interface/Book/book.interface'
import { useLocalePath } from '@/ultis/route'
import { bookReadPath } from '@/Variable/book.variable'

export default function useBookReader(bookId: string) {
	const searchParams = useSearchParams()
	const { onChangeRoute } = useLocalePath()
	const { learningLang, nativeLang } = useBookLibrary()
	const {
		load: loadAudio,
		setOnEnded,
		setOnPrevChapter,
		setOnNextChapter,
		toggle,
		getCurrentTime,
	} = useBookPlayer()

	const mode: BookReadMode =
		searchParams.get('mode') === 'listen' ? 'listen' : 'read'
	const chapterId = searchParams.get('chapter') || ''
	const page = Math.max(1, Number(searchParams.get('page') || 1) || 1)

	const [book, setBook] = useState<BookApiItem | null>(null)
	const [chapters, setChapters] = useState<ChapterApiItem[]>([])
	const [pageContent, setPageContent] = useState<ChapterPage | null>(null)
	const [loading, setLoading] = useState(true)
	const [pageLoading, setPageLoading] = useState(false)
	const [audioMissing, setAudioMissing] = useState(false)
	const progressTimer = useRef<number | null>(null)
	const modeRef = useRef(mode)
	modeRef.current = mode

	const currentChapter =
		chapters.find((item) => item.id === chapterId) || chapters[0] || null
	const totalPages =
		pageContent?.total_pages || currentChapter?.total_pages || 1

	const replaceQuery = useCallback(
		(next: {
			chapter?: string
			page?: number
			mode?: BookReadMode
		}) => {
			onChangeRoute(
				bookReadPath(bookId, {
					chapter: next.chapter || currentChapter?.id || chapterId,
					page: next.page ?? page,
					mode: next.mode || mode,
				}),
			)
		},
		[bookId, chapterId, currentChapter?.id, mode, onChangeRoute, page],
	)

	useEffect(() => {
		let cancelled = false

		const init = async () => {
			setLoading(true)
			try {
				const [bookRes, chapterRes] = await Promise.allSettled([
					getBookDetail(bookId),
					getChapterList(bookId),
				])
				if (cancelled) return

				const nextBook =
					bookRes.status === 'fulfilled'
						? parseApiObject<BookApiItem>(bookRes.value)
						: null
				const nextChapters =
					chapterRes.status === 'fulfilled'
						? sortChapters(parseApiList<ChapterApiItem>(chapterRes.value))
						: []

				setBook(nextBook)
				setChapters(nextChapters)

				if (!chapterId && nextChapters[0]?.id) {
					const progress = [...(nextBook?.reading_progress || [])].sort(
						(a, b) =>
							(b.last_read_at || '').localeCompare(a.last_read_at || ''),
					)[0] as ReadingProgress | undefined
					const nextChapterId =
						(progress?.chapter_id &&
							nextChapters.some((item) => item.id === progress.chapter_id) &&
							progress.chapter_id) ||
						nextChapters[0].id
					onChangeRoute(
						bookReadPath(bookId, {
							chapter: nextChapterId,
							page: progress?.current_page || 1,
							mode: modeRef.current,
						}),
					)
				}
			} finally {
				if (!cancelled) setLoading(false)
			}
		}

		init()

		return () => {
			cancelled = true
		}
	}, [bookId, chapterId, onChangeRoute])

	useEffect(() => {
		if (!currentChapter?.id) return
		let cancelled = false

		const loadPage = async () => {
			setPageLoading(true)
			try {
				const languages = [learningLang, 'en-gb', 'en', nativeLang, 'vi']
				let next: ChapterPage | null = null
				for (const lang of languages) {
					try {
						const res = await getChapterContentByPage(
							currentChapter.id as string,
							page,
							lang,
						)
						next = parseChapterPage(res)
						if (next?.content?.length) break
					} catch {
						next = null
					}
				}
				if (!cancelled) setPageContent(next)
			} finally {
				if (!cancelled) setPageLoading(false)
			}
		}

		loadPage()

		return () => {
			cancelled = true
		}
	}, [currentChapter?.id, learningLang, nativeLang, page])

	useEffect(() => {
		if (mode !== 'listen' || !currentChapter?.id) {
			setAudioMissing(false)
			return
		}

		let cancelled = false
		const chapter = currentChapter

		const loadTrack = async () => {
			try {
				const res = await getAudioList({
					book_id: bookId,
					chapter_id: chapter.id,
					page: 1,
					limit: 30,
				})
				if (cancelled) return
				const audio = pickChapterAudio(parseApiList(res), learningLang)
				if (audio?.url) {
					setAudioMissing(false)
					loadAudio({
						url: audio.url,
						book,
						chapter,
						autoPlay: true,
					})
				} else {
					setAudioMissing(true)
				}
			} catch {
				if (!cancelled) setAudioMissing(true)
			}
		}

		loadTrack()

		return () => {
			cancelled = true
		}
	}, [book, bookId, currentChapter?.id, learningLang, loadAudio, mode])

	const saveProgress = useCallback(
		(nextPage: number, chapter = currentChapter) => {
			if (!bookId || !chapter?.id) return
			if (progressTimer.current) {
				window.clearTimeout(progressTimer.current)
			}
			progressTimer.current = window.setTimeout(() => {
				updateReadingProgress({
					book_id: bookId,
					chapter_id: chapter.id as string,
					current_page: nextPage,
					audio_minute: getCurrentTime() / 60,
					language_code: learningLang,
				}).catch(() => {})
			}, 1200)
		},
		[bookId, currentChapter, getCurrentTime, learningLang],
	)

	useEffect(() => {
		if (!currentChapter?.id || loading) return
		saveProgress(page)
	}, [currentChapter?.id, loading, page, saveProgress])

	useEffect(() => {
		return () => {
			if (progressTimer.current) {
				window.clearTimeout(progressTimer.current)
			}
		}
	}, [])

	const goToChapter = useCallback(
		(nextChapter: ChapterApiItem, nextPage = 1) => {
			if (!nextChapter.id) return
			replaceQuery({ chapter: nextChapter.id, page: nextPage })
		},
		[replaceQuery],
	)

	const goNextPage = useCallback(() => {
		if (page < totalPages) {
			replaceQuery({ page: page + 1 })
			return
		}
		const index = chapters.findIndex((item) => item.id === currentChapter?.id)
		const next = chapters[index + 1]
		if (next) goToChapter(next, 1)
	}, [chapters, currentChapter?.id, goToChapter, page, replaceQuery, totalPages])

	const goPrevPage = useCallback(() => {
		if (page > 1) {
			replaceQuery({ page: page - 1 })
			return
		}
		const index = chapters.findIndex((item) => item.id === currentChapter?.id)
		const prev = chapters[index - 1]
		if (prev) goToChapter(prev, prev.total_pages || 1)
	}, [chapters, currentChapter?.id, goToChapter, page, replaceQuery])

	useEffect(() => {
		if (mode !== 'listen') {
			setOnEnded(null)
			setOnPrevChapter(null)
			setOnNextChapter(null)
			return
		}
		setOnEnded(() => {
			const index = chapters.findIndex((item) => item.id === currentChapter?.id)
			const next = chapters[index + 1]
			if (next) goToChapter(next, 1)
		})
		setOnPrevChapter(() => {
			const index = chapters.findIndex((item) => item.id === currentChapter?.id)
			const prev = chapters[index - 1]
			if (prev) goToChapter(prev, 1)
		})
		setOnNextChapter(() => {
			const index = chapters.findIndex((item) => item.id === currentChapter?.id)
			const next = chapters[index + 1]
			if (next) goToChapter(next, 1)
		})
		return () => {
			setOnEnded(null)
			setOnPrevChapter(null)
			setOnNextChapter(null)
		}
	}, [
		chapters,
		currentChapter?.id,
		goToChapter,
		mode,
		setOnEnded,
		setOnNextChapter,
		setOnPrevChapter,
	])

	useEffect(() => {
		const onKey = (event: KeyboardEvent) => {
			if (event.key === 'ArrowRight') goNextPage()
			if (event.key === 'ArrowLeft') goPrevPage()
			if (event.key === ' ' && mode === 'listen') {
				event.preventDefault()
				toggle()
			}
		}
		window.addEventListener('keydown', onKey)
		return () => window.removeEventListener('keydown', onKey)
	}, [goNextPage, goPrevPage, mode, toggle])

	const sentences = useMemo(() => {
		return (pageContent?.content || []).map((item) => ({
			type: item.type,
			learning: pickContentPart(item.parts, learningLang)?.text || '',
			native: pickContentPart(item.parts, nativeLang)?.text || '',
		}))
	}, [learningLang, nativeLang, pageContent])

	return {
		book,
		chapters,
		currentChapter,
		page,
		totalPages,
		mode,
		sentences,
		loading,
		pageLoading,
		audioMissing,
		replaceQuery,
		goNextPage,
		goPrevPage,
		goToChapter,
	}
}
