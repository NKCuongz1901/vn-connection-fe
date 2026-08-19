'use client'

import { useCallback, useEffect, useState } from 'react'

import { getBookDetail, parseApiList, parseApiObject } from '@/apis/book/bookApis'
import { getChapterList, sortChapters } from '@/apis/book/chapterApis'
import {
	BookApiItem,
	BookReadMode,
	ChapterApiItem,
	ReadingProgress,
} from '@/interface/Book/book.interface'
import { bookReadPath } from '@/Variable/book.variable'

export default function useBookDetail(bookId: string) {
	const [book, setBook] = useState<BookApiItem | null>(null)
	const [chapters, setChapters] = useState<ChapterApiItem[]>([])
	const [tab, setTab] = useState<'summary' | 'chapter'>('summary')
	const [loading, setLoading] = useState(true)

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

		return () => {
			cancelled = true
		}
	}, [bookId])

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

	return {
		book,
		chapters,
		tab,
		setTab,
		loading,
		resume,
	}
}
