'use client'

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react'

import {
	getAudioList,
	getBookListV2,
	parseApiList,
	toggleFavouriteBook,
} from '@/apis/book/bookApis'
import {
	getChapterList,
	pickChapterAudio,
	sortChapters,
} from '@/apis/book/chapterApis'
import { BookApiItem, ChapterApiItem, ChapterAudio } from '@/interface/Book/book.interface'

type PlayerTrack = {
	url: string
	book?: BookApiItem | null
	chapter?: ChapterApiItem | null
	chapters?: ChapterApiItem[]
	learningLang?: string
	autoPlay?: boolean
}

export type RepeatMode = 'off' | 'one' | 'all'

// A played position, kept so Previous can step back across books
type TrackEntry = {
	book: BookApiItem
	chapter: ChapterApiItem
	chapters: ChapterApiItem[]
}

// How many books to try before giving up when the next ones have no audio
const MAX_BOOK_ATTEMPTS = 5
const BOOK_QUEUE_LIMIT = 50
const HISTORY_LIMIT = 50

type BookPlayerContextValue = {
	url: string
	book: BookApiItem | null
	chapter: ChapterApiItem | null
	chapters: ChapterApiItem[]
	playing: boolean
	currentTime: number
	duration: number
	rate: number
	shuffle: boolean
	repeat: RepeatMode
	favouritePending: boolean
	load: (track: PlayerTrack) => void
	toggle: () => void
	seek: (seconds: number) => void
	skip: (delta: number) => void
	setRate: (rate: number) => void
	toggleShuffle: () => void
	cycleRepeat: () => void
	toggleFavourite: () => Promise<void>
	prevChapter: () => void
	nextChapter: () => void
	selectChapter: (chapter: ChapterApiItem) => Promise<boolean>
	getCurrentTime: () => number
}

const BookPlayerContext = createContext<BookPlayerContextValue | null>(null)

export function BookPlayerProvider({
	children,
}: {
	children: React.ReactNode
}) {
	const audioRef = useRef<HTMLAudioElement | null>(null)
	const urlRef = useRef('')
	const rateRef = useRef(1)
	const bookRef = useRef<BookApiItem | null>(null)
	const chapterRef = useRef<ChapterApiItem | null>(null)
	const chaptersRef = useRef<ChapterApiItem[]>([])
	const learningLangRef = useRef('en-gb')
	const shuffleRef = useRef(false)
	const repeatRef = useRef<RepeatMode>('off')
	const historyRef = useRef<TrackEntry[]>([])
	const bookQueueRef = useRef<{ level: string; books: BookApiItem[] } | null>(
		null,
	)
	const navigatingRef = useRef(false)

	const [url, setUrl] = useState('')
	const [book, setBook] = useState<BookApiItem | null>(null)
	const [chapter, setChapter] = useState<ChapterApiItem | null>(null)
	const [chapters, setChapters] = useState<ChapterApiItem[]>([])
	const [playing, setPlaying] = useState(false)
	const [currentTime, setCurrentTime] = useState(0)
	const [duration, setDuration] = useState(0)
	const [rate, setRateState] = useState(1)
	const [shuffle, setShuffle] = useState(false)
	const [repeat, setRepeat] = useState<RepeatMode>('off')
	const [favouritePending, setFavouritePending] = useState(false)

	urlRef.current = url
	rateRef.current = rate
	chapterRef.current = chapter
	shuffleRef.current = shuffle
	repeatRef.current = repeat

	const playAudioUrl = useCallback((audioUrl: string, autoPlay = true) => {
		const audio = audioRef.current
		if (!audio) return
		urlRef.current = audioUrl
		setUrl(audioUrl)
		audio.src = audioUrl
		audio.playbackRate = rateRef.current
		audio.load()
		if (autoPlay) {
			audio.play().catch(() => {})
		}
	}, [])

	const fetchChapterAudioUrl = useCallback(
		async (bookId: string, chapterId: string) => {
			const res = await getAudioList({
				book_id: bookId,
				chapter_id: chapterId,
				page: 1,
				limit: 30,
			})
			const audios = parseApiList<ChapterAudio>(res)
			return pickChapterAudio(audios, learningLangRef.current)?.url || ''
		},
		[],
	)

	const pushHistory = useCallback(() => {
		const current = bookRef.current
		const currentChapter = chapterRef.current
		if (!current?.id || !currentChapter?.id) return
		historyRef.current = [
			...historyRef.current,
			{ book: current, chapter: currentChapter, chapters: chaptersRef.current },
		].slice(-HISTORY_LIMIT)
	}, [])

	// Switch the player to a track, which may belong to another book
	const playTrack = useCallback(
		async (entry: TrackEntry, audioUrl?: string, autoPlay = true) => {
			if (!entry.book.id || !entry.chapter.id) return false
			try {
				const src =
					audioUrl ||
					(await fetchChapterAudioUrl(entry.book.id, entry.chapter.id))
				if (!src) return false
				bookRef.current = entry.book
				chapterRef.current = entry.chapter
				chaptersRef.current = entry.chapters
				setBook(entry.book)
				setChapter(entry.chapter)
				setChapters(entry.chapters)
				playAudioUrl(src, autoPlay)
				return true
			} catch {
				// keep current track if the target has no audio
				return false
			}
		},
		[fetchChapterAudioUrl, playAudioUrl],
	)

	const playChapter = useCallback(
		async (nextChapter: ChapterApiItem, autoPlay = true) => {
			const current = bookRef.current
			if (!nextChapter?.id || !current?.id) return false
			return playTrack(
				{ book: current, chapter: nextChapter, chapters: chaptersRef.current },
				undefined,
				autoPlay,
			)
		},
		[playTrack],
	)

	// Books the player can move to, same level as the current book when possible
	const getBookQueue = useCallback(async () => {
		const level = bookRef.current?.level || ''
		const cached = bookQueueRef.current
		if (cached && cached.level === level && cached.books.length > 1) {
			return cached.books
		}
		const fetchBooks = async (params: { level?: string }) =>
			parseApiList<BookApiItem>(
				await getBookListV2({ page: 1, limit: BOOK_QUEUE_LIMIT, ...params }),
			).filter((item) => item?.id)

		let books = level ? await fetchBooks({ level }) : []
		if (books.length < 2) books = await fetchBooks({})
		bookQueueRef.current = { level, books }
		return books
	}, [])

	// Start another book at its first (or last) chapter that has audio
	const openBook = useCallback(
		async (target: BookApiItem, position: 'first' | 'last') => {
			if (!target.id) return false
			const list = sortChapters(
				parseApiList<ChapterApiItem>(await getChapterList(target.id)),
			).filter((item) => item.id)
			const ordered = position === 'first' ? list : [...list].reverse()
			for (const candidate of ordered.slice(0, 3)) {
				const src = await fetchChapterAudioUrl(
					target.id,
					candidate.id as string,
				).catch(() => '')
				if (src) {
					return playTrack(
						{ book: target, chapter: candidate, chapters: list },
						src,
					)
				}
			}
			return false
		},
		[fetchChapterAudioUrl, playTrack],
	)

	const moveToOtherBook = useCallback(
		async (direction: 1 | -1) => {
			const currentId = bookRef.current?.id
			const all = await getBookQueue()
			const others = all.filter((item) => item.id !== currentId)
			if (!others.length) return false

			let candidates: BookApiItem[]
			if (shuffleRef.current) {
				candidates = [...others].sort(() => Math.random() - 0.5)
			} else {
				const index = all.findIndex((item) => item.id === currentId)
				// walk the list from the current book, wrapping around
				candidates =
					index === -1
						? others
						: others.map(
								(_, step) =>
									all[
										(((index + direction * (step + 1)) % all.length) +
											all.length) %
											all.length
									],
							)
			}

			for (const candidate of candidates.slice(0, MAX_BOOK_ATTEMPTS)) {
				const ok = await openBook(
					candidate,
					direction === 1 || shuffleRef.current ? 'first' : 'last',
				).catch(() => false)
				if (ok) return true
			}
			return false
		},
		[getBookQueue, openBook],
	)

	// Play the first chapter in the list that has audio, skipping silent ones
	const playFirstWithAudio = useCallback(
		async (candidates: ChapterApiItem[]) => {
			for (const candidate of candidates) {
				if (await playChapter(candidate)) return true
			}
			return false
		},
		[playChapter],
	)

	const goNext = useCallback(async () => {
		if (navigatingRef.current) return
		navigatingRef.current = true
		try {
			const list = chaptersRef.current
			const index = list.findIndex(
				(item) => item.id === chapterRef.current?.id,
			)
			pushHistory()
			let moved = false
			if (shuffleRef.current) {
				// shuffle plays a random other book, from its first chapter
				moved = await moveToOtherBook(1)
			} else {
				moved = await playFirstWithAudio(list.slice(index + 1))
				if (!moved && repeatRef.current === 'all') {
					moved = await playFirstWithAudio(list.slice(0, Math.max(index, 0)))
				}
				if (!moved && repeatRef.current !== 'all') {
					moved = await moveToOtherBook(1)
				}
			}
			if (!moved) historyRef.current = historyRef.current.slice(0, -1)
		} finally {
			navigatingRef.current = false
		}
	}, [moveToOtherBook, playFirstWithAudio, pushHistory])

	const goPrev = useCallback(async () => {
		if (navigatingRef.current) return
		navigatingRef.current = true
		try {
			if (shuffleRef.current) {
				const previous = historyRef.current[historyRef.current.length - 1]
				if (previous && (await playTrack(previous))) {
					historyRef.current = historyRef.current.slice(0, -1)
				}
				return
			}
			const list = chaptersRef.current
			const index = list.findIndex(
				(item) => item.id === chapterRef.current?.id,
			)
			let moved =
				index > 0 &&
				(await playFirstWithAudio(list.slice(0, index).reverse()))
			if (!moved && repeatRef.current === 'all') {
				moved = await playFirstWithAudio(list.slice(index + 1).reverse())
			}
			if (!moved && repeatRef.current !== 'all') {
				await moveToOtherBook(-1)
			}
		} finally {
			navigatingRef.current = false
		}
	}, [moveToOtherBook, playFirstWithAudio, playTrack])

	const goNextRef = useRef(goNext)
	goNextRef.current = goNext

	useEffect(() => {
		const audio = new Audio()
		audio.preload = 'metadata'
		audioRef.current = audio

		const onTime = () => setCurrentTime(audio.currentTime || 0)
		const onMeta = () => setDuration(audio.duration || 0)
		const onPlay = () => setPlaying(true)
		const onPause = () => setPlaying(false)
		const onEnded = () => {
			setPlaying(false)
			if (repeatRef.current === 'one') {
				audio.currentTime = 0
				audio.play().catch(() => {})
				return
			}
			goNextRef.current()
		}

		audio.addEventListener('timeupdate', onTime)
		audio.addEventListener('loadedmetadata', onMeta)
		audio.addEventListener('play', onPlay)
		audio.addEventListener('pause', onPause)
		audio.addEventListener('ended', onEnded)

		return () => {
			audio.pause()
			audio.src = ''
			audio.removeEventListener('timeupdate', onTime)
			audio.removeEventListener('loadedmetadata', onMeta)
			audio.removeEventListener('play', onPlay)
			audio.removeEventListener('pause', onPause)
			audio.removeEventListener('ended', onEnded)
			audioRef.current = null
		}
	}, [])

	const load = useCallback((track: PlayerTrack) => {
		const audio = audioRef.current
		if (!audio || !track.url) return

		setBook(track.book || null)
		setChapter(track.chapter || null)
		bookRef.current = track.book || null
		chapterRef.current = track.chapter || null
		if (track.chapters) {
			chaptersRef.current = track.chapters
			setChapters(track.chapters)
		}
		if (track.learningLang) learningLangRef.current = track.learningLang

		if (urlRef.current === track.url) {
			audio.playbackRate = rateRef.current
			return
		}

		playAudioUrl(track.url, Boolean(track.autoPlay))
	}, [playAudioUrl])

	const toggle = useCallback(() => {
		const audio = audioRef.current
		if (!audio?.src) return
		if (audio.paused) {
			audio.play().catch(() => {})
		} else {
			audio.pause()
		}
	}, [])

	const seek = useCallback((seconds: number) => {
		const audio = audioRef.current
		if (!audio) return
		audio.currentTime = Math.max(0, Math.min(seconds, audio.duration || seconds))
	}, [])

	const skip = useCallback((delta: number) => {
		const audio = audioRef.current
		if (!audio) return
		audio.currentTime = Math.max(
			0,
			Math.min((audio.currentTime || 0) + delta, audio.duration || 0),
		)
	}, [])

	const setRate = useCallback((next: number) => {
		setRateState(next)
		if (audioRef.current) {
			audioRef.current.playbackRate = next
		}
	}, [])

	// Shuffle and repeat are exclusive: turning one on turns the other off
	const toggleShuffle = useCallback(() => {
		const next = !shuffleRef.current
		shuffleRef.current = next
		setShuffle(next)
		if (next) {
			repeatRef.current = 'off'
			setRepeat('off')
		}
	}, [])

	const cycleRepeat = useCallback(() => {
		const prev = repeatRef.current
		const next: RepeatMode =
			prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off'
		repeatRef.current = next
		setRepeat(next)
		if (next !== 'off') {
			shuffleRef.current = false
			setShuffle(false)
		}
	}, [])

	const toggleFavourite = useCallback(async () => {
		const current = bookRef.current
		if (!current?.id || favouritePending) return
		const prevValue = Boolean(current.is_favourited)
		setFavouritePending(true)
		setBook((prev) => (prev ? { ...prev, is_favourited: !prevValue } : prev))
		bookRef.current = { ...current, is_favourited: !prevValue }
		try {
			await toggleFavouriteBook(current.id)
		} catch {
			setBook((prev) => (prev ? { ...prev, is_favourited: prevValue } : prev))
			bookRef.current = { ...current, is_favourited: prevValue }
		} finally {
			setFavouritePending(false)
		}
	}, [favouritePending])

	const prevChapter = useCallback(() => {
		goPrev()
	}, [goPrev])

	const nextChapter = useCallback(() => {
		goNext()
	}, [goNext])

	const selectChapter = useCallback(
		async (target: ChapterApiItem) => {
			if (!target.id) return false
			if (target.id === chapterRef.current?.id) return true
			pushHistory()
			const ok = await playChapter(target)
			if (!ok) historyRef.current = historyRef.current.slice(0, -1)
			return ok
		},
		[playChapter, pushHistory],
	)

	const getCurrentTime = useCallback(
		() => audioRef.current?.currentTime || 0,
		[],
	)

	const value = useMemo(
		() => ({
			url,
			book,
			chapter,
			chapters,
			playing,
			currentTime,
			duration,
			rate,
			shuffle,
			repeat,
			favouritePending,
			load,
			toggle,
			seek,
			skip,
			setRate,
			toggleShuffle,
			cycleRepeat,
			toggleFavourite,
			prevChapter,
			nextChapter,
			selectChapter,
			getCurrentTime,
		}),
		[
			url,
			book,
			chapter,
			chapters,
			playing,
			currentTime,
			duration,
			rate,
			shuffle,
			repeat,
			favouritePending,
			load,
			toggle,
			seek,
			skip,
			setRate,
			toggleShuffle,
			cycleRepeat,
			toggleFavourite,
			prevChapter,
			nextChapter,
			selectChapter,
			getCurrentTime,
		],
	)

	return (
		<BookPlayerContext.Provider value={value}>
			{children}
		</BookPlayerContext.Provider>
	)
}

export function useBookPlayer() {
	const ctx = useContext(BookPlayerContext)
	if (!ctx) {
		throw new Error('useBookPlayer must be used within BookPlayerProvider')
	}
	return ctx
}

export function useOptionalBookPlayer() {
	return useContext(BookPlayerContext)
}
