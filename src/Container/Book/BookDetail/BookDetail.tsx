'use client'

import { memo } from 'react'
import clsx from 'clsx'

import { BookLanguageButton } from '@/Components/Book'
import CImage from '@/Components/Custom/CImage/CImage'
import useBookDetail from '@/hooks/Book/useBookDetail'
import { TYPE_SIZE_IMAGE } from '@/Variable/image.variable'
import { useLocalePath } from '@/ultis/route'
import {
	BOOK_ROOT,
	bookReadPath,
	formatBookDuration,
} from '@/Variable/book.variable'

import classes from './BookDetail.module.scss'

type BookDetailProps = {
	bookId: string
}

function BookDetail({ bookId }: BookDetailProps) {
	const { onChangeRoute } = useLocalePath()
	const { book, chapters, tab, setTab, loading, resume } = useBookDetail(bookId)
	const rating = book?.review_summary?.overall_rating
	const duration = formatBookDuration(book?.est_duration)

	if (loading && !book) {
		return <div className={classes.empty}>Loading…</div>
	}

	if (!book) {
		return <div className={classes.empty}>Book not found</div>
	}

	return (
		<div className={classes.page}>
			<button
				type="button"
				className={classes.back}
				onClick={() => onChangeRoute(BOOK_ROOT)}
			>
				← {book.title}
			</button>

			<div className={classes.hero}>
				<div className={classes.cover}>
					{book.cover_image ? (
						<CImage
							src={book.cover_image}
							sizeType={TYPE_SIZE_IMAGE.medium}
							alt=""
						/>
					) : null}
				</div>
				<div className={classes.info}>
					<div className={classes.title}>{book.title}</div>
					<div className={classes.author}>{book.author}</div>
					<div className={classes.meta}>
						{[
							book.level,
							book.category?.[0],
							duration,
							book.total_words
								? `${book.total_words.toLocaleString()} words`
								: null,
							rating ? `★ ${rating.toFixed(1)}` : null,
						]
							.filter(Boolean)
							.join(' · ')}
					</div>
					<div className={classes.actions}>
						<BookLanguageButton />
						<button
							type="button"
							className={clsx(classes.cta, classes.read)}
							onClick={() => onChangeRoute(resume('read'))}
							disabled={!chapters.length}
						>
							Read
						</button>
						<button
							type="button"
							className={clsx(classes.cta, classes.listen)}
							onClick={() => onChangeRoute(resume('listen'))}
							disabled={!chapters.length}
						>
							Listen
						</button>
					</div>
				</div>
			</div>

			<div className={classes.tabs}>
				<button
					type="button"
					className={clsx(classes.tab, {
						[classes.active]: tab === 'summary',
					})}
					onClick={() => setTab('summary')}
				>
					Summary
				</button>
				<button
					type="button"
					className={clsx(classes.tab, {
						[classes.active]: tab === 'chapter',
					})}
					onClick={() => setTab('chapter')}
				>
					Chapter
				</button>
			</div>

			{tab === 'summary' ? (
				<div className={classes.summary}>
					{book.summary || 'No summary yet.'}
				</div>
			) : (
				<div className={classes.chapters}>
					{chapters.length ? (
						chapters.map((chapter) => (
							<button
								key={chapter.id}
								type="button"
								className={classes.chapter}
								onClick={() =>
									onChangeRoute(
										bookReadPath(bookId, {
											chapter: chapter.id,
											page: 1,
											mode: 'read',
										}),
									)
								}
							>
								<div>
									Chapter {chapter.chapter_number || ''}
									{chapter.title ? ` · ${chapter.title}` : ''}
								</div>
								{chapter.total_pages ? (
									<div className={classes.chapterMeta}>
										{chapter.total_pages} pages
									</div>
								) : null}
							</button>
						))
					) : (
						<div className={classes.empty}>No chapters yet</div>
					)}
				</div>
			)}
		</div>
	)
}

export default memo(BookDetail)
