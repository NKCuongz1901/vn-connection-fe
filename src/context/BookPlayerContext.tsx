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

import { getAudioList, parseApiList, toggleFavouriteBook } from '@/apis/book/bookApis'
import { pickChapterAudio } from '@/apis/book/chapterApis'
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

type BookPlayerContextValue = {
	url: string
	book: BookApiItem | null
	chapter: ChapterApiItem | null
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

	const [url, setUrl] = useState('')
	const [book, setBook] = useState<BookApiItem | null>(null)
	const [chapter, setChapter] = useState<ChapterApiItem | null>(null)
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

	const playChapter = useCallback(
		async (nextChapter: ChapterApiItem, autoPlay = true) => {
			if (!nextChapter?.id || !bookRef.current?.id) return
			try {
				const res = await getAudioList({
					book_id: bookRef.current.id,
					chapter_id: nextChapter.id,
					page: 1,
					limit: 30,
				})
				const audios = parseApiList<ChapterAudio>(res)
				const audio = pickChapterAudio(audios, learningLangRef.current)
				if (audio?.url) {
					setChapter(nextChapter)
					playAudioUrl(audio.url, autoPlay)
				}
			} catch {
				// keep current track if the next one has no audio
			}
		},
		[playAudioUrl],
	)

	const pickAdjacentChapter = useCallback((direction: 1 | -1) => {
		const list = chaptersRef.current
		const current = chapterRef.current
		if (!list.length || !current?.id) return null

		if (shuffleRef.current) {
			if (list.length < 2) return null
			let candidate = current
			let guard = 0
			while (candidate?.id === current.id && guard < 10) {
				candidate = list[Math.floor(Math.random() * list.length)]
				guard += 1
			}
			return candidate?.id !== current.id ? candidate : null
		}

		const index = list.findIndex((item) => item.id === current.id)
		if (index === -1) return null
		const nextIndex = index + direction
		if (nextIndex >= 0 && nextIndex < list.length) return list[nextIndex]
		if (repeatRef.current === 'all') {
			return direction === 1 ? list[0] : list[list.length - 1]
		}
		return null
	}, [])

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
			const next = pickAdjacentChapter(1)
			if (next) playChapter(next, true)
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
	}, [pickAdjacentChapter, playChapter])

	const load = useCallback((track: PlayerTrack) => {
		const audio = audioRef.current
		if (!audio || !track.url) return

		setBook(track.book || null)
		setChapter(track.chapter || null)
		bookRef.current = track.book || null
		chapterRef.current = track.chapter || null
		if (track.chapters) chaptersRef.current = track.chapters
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

	const toggleShuffle = useCallback(() => {
		setShuffle((prev) => !prev)
	}, [])

	const cycleRepeat = useCallback(() => {
		setRepeat((prev) => (prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off'))
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
		const target = pickAdjacentChapter(-1)
		if (target) playChapter(target, true)
	}, [pickAdjacentChapter, playChapter])

	const nextChapter = useCallback(() => {
		const target = pickAdjacentChapter(1)
		if (target) playChapter(target, true)
	}, [pickAdjacentChapter, playChapter])

	const getCurrentTime = useCallback(
		() => audioRef.current?.currentTime || 0,
		[],
	)

	const value = useMemo(
		() => ({
			url,
			book,
			chapter,
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
			getCurrentTime,
		}),
		[
			url,
			book,
			chapter,
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
