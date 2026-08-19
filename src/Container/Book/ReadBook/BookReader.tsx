'use client'

import { memo } from 'react'
import clsx from 'clsx'

import { BookLanguageButton } from '@/Components/Book/BookLanguageModal/BookLanguageModal'
import { useBookPlayer } from '@/context/BookPlayerContext'
import useBookReader from '@/hooks/Book/useBookReader'
import { useLocalePath } from '@/ultis/route'
import { bookDetailPath } from '@/Variable/book.variable'

import classes from './BookReader.module.scss'

type BookReaderProps = {
	bookId: string
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
		replaceQuery,
		goNextPage,
		goPrevPage,
		goToChapter,
	} = useBookReader(bookId)
	const player = useBookPlayer()

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
				<div className={classes.banner}>No audio for this chapter</div>
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
								<div className={classes.learning}>{item.learning}</div>
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
		</div>
	)
}

export default memo(BookReader)
