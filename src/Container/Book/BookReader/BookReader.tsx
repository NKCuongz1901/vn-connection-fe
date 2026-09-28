'use client'

import { memo, useEffect, useState } from 'react'
import clsx from 'clsx'
import { IconHeadphones, IconX } from '@tabler/icons-react'

import { BookLanguageButton } from '@/Components/Book'
import { findBookLanguage } from '@/apis/book/bookApis'
import { useBookLibrary } from '@/context/BookLibraryContext'
import { useBookPlayer } from '@/context/BookPlayerContext'
import useBookReader from '@/hooks/Book/useBookReader'
import { useLocalePath } from '@/ultis/route'
import { bookDetailPath } from '@/Variable/book.variable'

import classes from './BookReader.module.scss'

type BookReaderProps = {
	bookId: string
}

function TranslatableText({
	text,
	onSelect,
}: {
	text: string
	onSelect: (word: string) => void
}) {
	const tokens = text.split(/(\s+)/)
	return (
		<>
			{tokens.map((token, index) =>
				token.trim() ? (
					<span
						key={index}
						className={classes.word}
						onClick={() => onSelect(token)}
					>
						{token}
					</span>
				) : (
					token
				),
			)}
		</>
	)
}

function BookReader({ bookId }: BookReaderProps) {
	const { onChangeRoute } = useLocalePath()
	const {
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
		audioLang,
		setAudioLang,
		finished,
		translation,
		translateWord,
		clearTranslation,
		replaceQuery,
		goNextPage,
		goPrevPage,
		goToChapter,
	} = useBookReader(bookId)
	const player = useBookPlayer()
	const { languages } = useBookLibrary()
	const [finishedDismissed, setFinishedDismissed] = useState(false)

	useEffect(() => {
		setFinishedDismissed(false)
	}, [bookId])

	if (loading && !book) {
		return <div className={classes.empty}>Loading…</div>
	}

	return (
		<div className={classes.page}>
			<button
				type="button"
				className={classes.back}
				onClick={() => onChangeRoute(bookDetailPath(bookId))}
			>
				← {book?.title || 'Book'}
			</button>

			<div className={classes.toolbar}>
				<select
					className={classes.select}
					value={currentChapter?.id || ''}
					onChange={(event) => {
						const next = chapters.find((item) => item.id === event.target.value)
						if (next) goToChapter(next, 1)
					}}
				>
					{chapters.map((chapter) => (
						<option key={chapter.id} value={chapter.id}>
							Chapter {chapter.chapter_number || ''}
							{chapter.title ? ` · ${chapter.title}` : ''}
						</option>
					))}
				</select>

				<div className={classes.modes}>
					<BookLanguageButton />
					{mode === 'listen' ? (
						<select
							className={classes.select}
							value={audioLang}
							onChange={(event) => setAudioLang(event.target.value)}
							aria-label="Audio language"
						>
							{(languages.length
								? languages
								: [{ code: audioLang, name: audioLang }]
							).map((lang) => (
								<option key={lang.code} value={lang.code}>
									{lang.name ||
										findBookLanguage(languages, lang.code)?.name ||
										lang.code}
								</option>
							))}
						</select>
					) : null}
					<button
						type="button"
						className={clsx(classes.mode, {
							[classes.active]: mode === 'read',
						})}
						onClick={() => replaceQuery({ mode: 'read' })}
					>
						Read
					</button>
					<button
						type="button"
						className={clsx(classes.mode, classes.listen, {
							[classes.active]: mode === 'listen',
						})}
						onClick={() => replaceQuery({ mode: 'listen' })}
					>
						Listen
					</button>
				</div>
			</div>

			{mode === 'listen' && audioMissing ? (
				<div className={classes.banner}>
					<IconHeadphones size={16} /> No audio for this chapter in this
					language
				</div>
			) : null}

			{finished && !finishedDismissed ? (
				<div className={classes.finished}>
					<div>
						<div className={classes.finishedTitle}>Book finished 🎉</div>
						<div className={classes.finishedHint}>
							You&apos;ve reached the last page of {book?.title}.
						</div>
					</div>
					<button
						type="button"
						className={classes.finishedClose}
						onClick={() => setFinishedDismissed(true)}
						aria-label="Dismiss"
					>
						<IconX size={16} />
					</button>
				</div>
			) : null}

			<div className={classes.reader}>
				{pageLoading ? (
					<div className={classes.empty}>Loading page…</div>
				) : sentences.length ? (
					sentences.map((item, index) => (
						<div
							key={`${item.learning}-${index}`}
							className={clsx(classes.block, {
								[classes.heading]: item.type === 'heading',
							})}
						>
							{item.learning ? (
								<div className={classes.learning}>
									<TranslatableText
										text={item.learning}
										onSelect={translateWord}
									/>
								</div>
							) : null}
							{item.native && item.native !== item.learning ? (
								<div className={classes.native}>{item.native}</div>
							) : null}
						</div>
					))
				) : (
					<div className={classes.empty}>No text on this page</div>
				)}
			</div>

			<div className={classes.pager}>
				<button
					type="button"
					className={classes.pageBtn}
					onClick={goPrevPage}
					disabled={page <= 1 && chapters[0]?.id === currentChapter?.id}
				>
					Previous
				</button>
				<div className={classes.pageLabel}>
					Page {page} / {totalPages}
				</div>
				<button
					type="button"
					className={classes.pageBtn}
					onClick={goNextPage}
					disabled={
						page >= totalPages &&
						chapters[chapters.length - 1]?.id === currentChapter?.id
					}
				>
					Next
				</button>
			</div>

			{mode === 'listen' && player.url ? (
				<div className={classes.listenHint}>
					Audio is playing in the bar below. Space to play/pause, arrows to
					turn pages.
				</div>
			) : null}

			{translation ? (
				<div className={classes.translatePanel}>
					<div className={classes.translateHead}>
						<span className={classes.translateWord}>{translation.word}</span>
						<button
							type="button"
							className={classes.translateClose}
							onClick={clearTranslation}
							aria-label="Close translation"
						>
							<IconX size={16} />
						</button>
					</div>
					{translation.loading ? (
						<div className={classes.translateBody}>Translating…</div>
					) : translation.error ? (
						<div className={classes.translateBody}>
							Could not translate this word.
						</div>
					) : (
						<div className={classes.translateBody}>
							{translation.result?.vocab ? (
								<div className={classes.translateVocab}>
									{translation.result.vocab}
								</div>
							) : null}
							{translation.result?.meaning ? (
								<div className={classes.translateMeaning}>
									{translation.result.meaning}
								</div>
							) : null}
							{translation.result?.example ? (
								<div className={classes.translateExample}>
									{translation.result.example}
								</div>
							) : null}
							{!translation.result ? (
								<div>No translation found.</div>
							) : (
								<div className={classes.translateSaved}>
									Saved to Searched vocab
								</div>
							)}
						</div>
					)}
				</div>
			) : null}
		</div>
	)
}

export default memo(BookReader)
