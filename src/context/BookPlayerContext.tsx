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

import { BookApiItem, ChapterApiItem } from '@/interface/Book/book.interface'

type PlayerTrack = {
	url: string
	book?: BookApiItem | null
	chapter?: ChapterApiItem | null
	autoPlay?: boolean
}

type BookPlayerContextValue = {
	url: string
	book: BookApiItem | null
	chapter: ChapterApiItem | null
	playing: boolean
	currentTime: number
	duration: number
	rate: number
	load: (track: PlayerTrack) => void
	toggle: () => void
	seek: (seconds: number) => void
	skip: (delta: number) => void
	setRate: (rate: number) => void
	setOnEnded: (handler: (() => void) | null) => void
	setOnPrevChapter: (handler: (() => void) | null) => void
	setOnNextChapter: (handler: (() => void) | null) => void
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
	const onEndedRef = useRef<(() => void) | null>(null)
	const onPrevChapterRef = useRef<(() => void) | null>(null)
	const onNextChapterRef = useRef<(() => void) | null>(null)
	const urlRef = useRef('')
	const rateRef = useRef(1)
	const [url, setUrl] = useState('')
	const [book, setBook] = useState<BookApiItem | null>(null)
	const [chapter, setChapter] = useState<ChapterApiItem | null>(null)
	const [playing, setPlaying] = useState(false)
	const [currentTime, setCurrentTime] = useState(0)
	const [duration, setDuration] = useState(0)
	const [rate, setRateState] = useState(1)
	urlRef.current = url
	rateRef.current = rate

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
			onEndedRef.current?.()
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

		if (urlRef.current === track.url) {
			audio.playbackRate = rateRef.current
			return
		}

		urlRef.current = track.url
		setUrl(track.url)
		audio.src = track.url
		audio.playbackRate = rateRef.current
		audio.load()
		if (track.autoPlay) {
			audio.play().catch(() => {})
		}
	}, [])

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

	const setOnEnded = useCallback((handler: (() => void) | null) => {
		onEndedRef.current = handler
	}, [])

	const setOnPrevChapter = useCallback((handler: (() => void) | null) => {
		onPrevChapterRef.current = handler
	}, [])

	const setOnNextChapter = useCallback((handler: (() => void) | null) => {
		onNextChapterRef.current = handler
	}, [])

	const prevChapter = useCallback(() => {
		onPrevChapterRef.current?.()
	}, [])

	const nextChapter = useCallback(() => {
		onNextChapterRef.current?.()
	}, [])

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
			load,
			toggle,
			seek,
			skip,
			setRate,
			setOnEnded,
			setOnPrevChapter,
			setOnNextChapter,
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
			load,
			toggle,
			seek,
			skip,
			setRate,
			setOnEnded,
			setOnPrevChapter,
			setOnNextChapter,
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
