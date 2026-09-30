'use client'

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { IconCircleCheckFilled, IconCircleXFilled, IconVolume, IconX } from '@tabler/icons-react'
import clsx from 'clsx'

import { parseApiList } from '@/apis/book/bookApis'
import {
	FlashcardQuestion,
	getFlashcardQuestions,
	LearningType,
	submitLearningProgress,
	VocabStrength,
} from '@/apis/book/vocabApis'
import { useBookLibrary } from '@/context/BookLibraryContext'
import { useLocalePath } from '@/ultis/route'
import { BOOK_VOCAB_PATH } from '@/Variable/book.variable'

import classes from './Vocabulary.module.scss'

type VocabLearningProps = {
	type: LearningType
	wordType?: VocabStrength
	/** a vocab set; without it the words searched while reading are used */
	folderId?: string
	setName?: string
}

type Answer = { correct: number; incorrect: number }

const languageName = (code: string) => {
	try {
		return new Intl.DisplayNames(['en'], { type: 'language' }).of(code) || code
	} catch {
		return code
	}
}

// accents, case and spacing do not matter when typing the word
const normalize = (value: string) =>
	value
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[\s.,!?;:'"()-]+/g, ' ')
		.trim()

const speak = (text: string, lang?: string) => {
	if (typeof window === 'undefined' || !window.speechSynthesis) return
	const utterance = new SpeechSynthesisUtterance(text)
	if (lang) utterance.lang = lang
	window.speechSynthesis.cancel()
	window.speechSynthesis.speak(utterance)
}

/** Flashcard (pick the translation) or Writing (type the word) over a set of words */
function VocabLearning({ type, wordType, folderId, setName }: VocabLearningProps) {
	const { onChangeRoute } = useLocalePath()
	const { nativeLang, learningLang } = useBookLibrary()
	const native = nativeLang.split('-')[0]
	const source = learningLang.split('-')[0]

	const [questions, setQuestions] = useState<FlashcardQuestion[]>([])
	const [loading, setLoading] = useState(true)
	const [index, setIndex] = useState(0)
	const [picked, setPicked] = useState<string | null>(null)
	const [typed, setTyped] = useState('')
	const [checked, setChecked] = useState<'right' | 'wrong' | 'revealed' | null>(null)
	const [learned, setLearned] = useState(0)
	const [inProgress, setInProgress] = useState(0)
	const answers = useRef<Record<string, Answer>>({})
	const saved = useRef(false)

	const load = useCallback(() => {
		setLoading(true)
		setIndex(0)
		setLearned(0)
		setInProgress(0)
		setPicked(null)
		setTyped('')
		setChecked(null)
		answers.current = {}
		saved.current = false
		getFlashcardQuestions({
			native_language: native,
			folder_id: folderId,
			source_language: folderId ? undefined : source,
			word_type: wordType,
		})
			.then((res) => setQuestions(parseApiList<FlashcardQuestion>(res).filter((item) => item.all_options?.length)))
			.catch(() => setQuestions([]))
			.finally(() => setLoading(false))
	}, [folderId, native, source, wordType])

	useEffect(() => {
		load()
	}, [load])

	const question = questions[index]
	const correct = useMemo(() => question?.all_options?.find((item) => item.is_correct), [question])
	const finished = !loading && questions.length > 0 && index >= questions.length

	// progress is saved for vocab sets; the searched-words folder has no id on the web yet
	useEffect(() => {
		if (!finished || saved.current || !folderId) return
		saved.current = true
		const list = Object.entries(answers.current).map(([source_vocab_id, value]) => ({
			source_vocab_id,
			correct_count: value.correct,
			incorrect_count: value.incorrect,
		}))
		if (list.length) {
			submitLearningProgress({ folder_id: folderId, native_language: native, learning_type: type, answers: list }).catch(
				() => {},
			)
		}
	}, [finished, folderId, native, type])

	const record = (isRight: boolean) => {
		if (!question) return
		const entry = answers.current[question.source_vocab_id] || { correct: 0, incorrect: 0 }
		if (isRight) entry.correct += 1
		else entry.incorrect += 1
		answers.current[question.source_vocab_id] = entry
		if (isRight) setLearned((prev) => prev + 1)
		else setInProgress((prev) => prev + 1)
	}

	const next = () => {
		setPicked(null)
		setTyped('')
		setChecked(null)
		setIndex((prev) => prev + 1)
	}

	const pick = (optionKey: string, isRight: boolean) => {
		if (picked) return
		setPicked(optionKey)
		record(isRight)
		window.setTimeout(next, 900)
	}

	const check = () => {
		if (!question || checked || !typed.trim()) return
		const isRight = normalize(typed) === normalize(question.vocab)
		setChecked(isRight ? 'right' : 'wrong')
		record(isRight)
		if (isRight) window.setTimeout(next, 900)
	}

	const reveal = () => {
		if (!question || checked === 'right' || checked === 'revealed') return
		if (checked !== 'wrong') record(false)
		setChecked('revealed')
		setTyped(question.vocab)
	}

	const close = () => onChangeRoute(BOOK_VOCAB_PATH)
	const total = questions.length
	const percent = total ? Math.round((Math.min(index, total) / total) * 100) : 0

	return (
		<div className={classes.learn}>
			<div className={classes.learnHead}>
				<div className={classes.learnTags}>
					<span className={classes.tagSet}>{setName || 'Reading Searched Vocab'}</span>
					{wordType ? <span className={clsx(classes.tagType, classes[wordType])}>{wordType}</span> : null}
				</div>
				<div className={classes.learnProgress}>
					<div className={classes.progressRow}>
						<span className={classes.progressBar}>
							<span style={{ width: `${Math.max(percent, total ? 3 : 0)}%` }} />
						</span>
						<span>
							({Math.min(index + 1, total)}/{total})
						</span>
					</div>
					{type === 'flashcard' ? (
						<div className={classes.counters}>
							<span className={clsx(classes.counter, classes.counterProgress)}>In Progress {inProgress}</span>
							<span className={clsx(classes.counter, classes.counterLearned)}>Learned {learned}</span>
						</div>
					) : null}
				</div>
				<button type="button" className={classes.learnClose} onClick={close} aria-label="Close">
					<IconX size={22} />
				</button>
			</div>

			{loading ? (
				<div className={classes.empty}>Loading…</div>
			) : !total ? (
				<div className={classes.learnDone}>
					<b>No words to learn here yet.</b>
					<span>Look up words while reading, then come back to learn them.</span>
					<button type="button" className={classes.primaryBtn} onClick={close}>
						Back to Vocabulary
					</button>
				</div>
			) : finished ? (
				<div className={classes.learnDone}>
					<IconCircleCheckFilled size={56} className={classes.strongText} />
					<b>Well done!</b>
					<span>
						{learned} right · {inProgress} to practise again
					</span>
					{!folderId ? (
						<span className={classes.pageHint}>Your searched words keep their strength for now.</span>
					) : null}
					<div className={classes.doneActions}>
						<button type="button" className={classes.secondaryBtn} onClick={load}>
							Learn again
						</button>
						<button type="button" className={classes.primaryBtn} onClick={close}>
							Back to Vocabulary
						</button>
					</div>
				</div>
			) : type === 'flashcard' ? (
				<div className={classes.learnBody}>
					<div className={classes.learnPrompt}>Select the correct translation</div>
					<div className={classes.flashcard}>
						<button
							type="button"
							className={classes.cardSpeak}
							onClick={() => speak(question.vocab, question.language)}
							aria-label="Listen"
						>
							<IconVolume size={18} />
						</button>
						<b>{question.vocab}</b>
						{question.ipa ? <span>[{question.ipa.replace(/^\/|\/$/g, '')}]</span> : null}
					</div>
					<div className={classes.options}>
						{(question.all_options || []).map((option, optionIndex) => {
							const key = option.id || `${optionIndex}`
							const isPicked = picked === key
							const showRight = Boolean(picked) && option.is_correct
							return (
								<button
									key={key}
									type="button"
									className={clsx(classes.option, {
										[classes.optionRight]: showRight,
										[classes.optionWrong]: isPicked && !option.is_correct,
									})}
									onClick={() => pick(key, Boolean(option.is_correct))}
									disabled={Boolean(picked)}
								>
									{showRight ? <IconCircleCheckFilled size={18} /> : null}
									{isPicked && !option.is_correct ? <IconCircleXFilled size={18} /> : null}
									<span>{option.vocab || option.meaning}</span>
								</button>
							)
						})}
					</div>
				</div>
			) : (
				<div className={classes.learnBody}>
					<div className={classes.learnPrompt}>Fill in the correct words</div>
					<div className={classes.writingWord}>{correct?.vocab || correct?.meaning}</div>
					<div
						className={clsx(classes.writingInput, {
							[classes.inputRight]: checked === 'right',
							[classes.inputWrong]: checked === 'wrong',
						})}
					>
						<input
							value={typed}
							onChange={(event) => {
								setTyped(event.target.value)
								if (checked === 'wrong') setChecked(null)
							}}
							onKeyDown={(event) => {
								if (event.key === 'Enter') {
									if (checked === 'revealed') next()
									else check()
								}
							}}
							placeholder={`Type in ${languageName(question.language || source)}`}
							readOnly={checked === 'right' || checked === 'revealed'}
							autoFocus
						/>
						{checked === 'right' ? <IconCircleCheckFilled size={18} className={classes.strongText} /> : null}
						{checked === 'wrong' ? <IconCircleXFilled size={18} className={classes.weakText} /> : null}
					</div>
					<div className={classes.writingActions}>
						{checked === 'revealed' ? (
							<button type="button" className={classes.primaryBtn} onClick={next}>
								Next
							</button>
						) : (
							<>
								<button type="button" className={classes.secondaryBtn} onClick={reveal}>
									Don&apos;t know
								</button>
								<button type="button" className={classes.primaryBtn} onClick={check} disabled={!typed.trim()}>
									Check
								</button>
							</>
						)}
					</div>
				</div>
			)}
		</div>
	)
}

export default memo(VocabLearning)
