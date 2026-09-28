'use client'

import { memo, useMemo, useState } from 'react'
import clsx from 'clsx'
import { Dropdown } from 'antd'
import {
	IconBook2,
	IconChevronLeft,
	IconDots,
	IconDownload,
	IconFlag,
	IconHeadphones,
	IconHeart,
	IconHeartFilled,
	IconList,
	IconShare3,
	IconStar,
	IconStarFilled,
	IconX,
} from '@tabler/icons-react'
import { toast } from 'react-toastify'

import {
	BookEmptyState,
	BookLanguageButton,
	BookReportModal,
	BookReviewListModal,
	BookReviewModal,
	BookShareModal,
} from '@/Components/Book'
import { downloadBookAudio } from '@/ultis/bookDownload'
import CImage from '@/Components/Custom/CImage/CImage'
import useBookDetail from '@/hooks/Book/useBookDetail'
import { useBookLibrary } from '@/context/BookLibraryContext'
import { TYPE_SIZE_IMAGE } from '@/Variable/image.variable'
import { useLocalePath } from '@/ultis/route'
import {
	BOOK_ROOT,
	bookReadPath,
	formatListeningTime,
	pickBookDuration,
} from '@/Variable/book.variable'

import classes from './BookDetail.module.scss'

type BookDetailProps = {
	bookId: string
}

function BookDetail({ bookId }: BookDetailProps) {
	const { onChangeRoute } = useLocalePath()
	const {
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
	} = useBookDetail(bookId)
	const { learningLang } = useBookLibrary()
	const [shareOpen, setShareOpen] = useState(false)
	const [reportOpen, setReportOpen] = useState(false)
	const [reviewOpen, setReviewOpen] = useState(false)
	const [reviewListOpen, setReviewListOpen] = useState(false)
	const [downloading, setDownloading] = useState(false)

	const handleDownload = async () => {
		if (downloading || !book?.id) return
		setDownloading(true)
		try {
			const saved = await downloadBookAudio(
				{ id: book.id, title: book.title },
				learningLang,
			)
			if (!saved) toast.info('No audio for this book yet')
		} catch {
			toast.error('Could not download this book')
		} finally {
			setDownloading(false)
		}
	}

	const rating = book?.review_summary?.overall_rating
	const reviewCount = book?.review_summary?.total_reviews
	const listeningTime = formatListeningTime(
		pickBookDuration(book?.book_duration, learningLang, book?.est_duration),
	)
	const vocabSize = book?.total_words
		? `${book.total_words.toLocaleString()} words`
		: '—'
	const ratingLabel = rating
		? `${rating.toFixed(1)}${reviewCount ? ` (${reviewCount})` : ''}`
		: '—'

	const shareUrl = useMemo(() => {
		if (book?.share_link) return book.share_link
		if (typeof window === 'undefined') return ''
		return window.location.href
	}, [book?.share_link])

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
				aria-label="Back"
			>
				<IconChevronLeft size={20} />
				<span>{book.title}</span>
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
					<BookLanguageButton />
					<div className={classes.stats}>
						<div className={classes.stat}>
							<div className={classes.statLabel}>Listening time</div>
							<div className={classes.statValue}>
								<IconHeadphones size={16} stroke={1.5} />
								<span>{listeningTime}</span>
							</div>
						</div>
						<div className={classes.stat}>
							<div className={classes.statLabel}>Vocabulary size</div>
							<div className={classes.statValue}>
								<IconBook2 size={16} stroke={1.5} />
								<span>{vocabSize}</span>
							</div>
						</div>
						<div className={classes.stat}>
							<div className={classes.statLabel}>Rating</div>
							<button
								type="button"
								className={clsx(
									classes.statValue,
									classes.statRating,
									classes.statButton,
									{ [classes.statRatingActive]: Boolean(rating) },
								)}
								onClick={() => setReviewListOpen(true)}
								aria-label="See book reviews"
							>
								<IconStarFilled size={16} />
								<span>{ratingLabel}</span>
							</button>
						</div>
					</div>
					<div className={classes.actions}>
						<button
							type="button"
							className={clsx(classes.cta, classes.read)}
							onClick={() => onChangeRoute(resume('read'))}
							disabled={!chapters.length}
						>
							<IconList size={18} />
							Read
						</button>
						<button
							type="button"
							className={clsx(classes.cta, classes.listen)}
							onClick={() => onChangeRoute(resume('listen'))}
							disabled={!chapters.length}
						>
							<IconHeadphones size={18} />
							Listen
						</button>
						<button
							type="button"
							className={clsx(classes.iconBtn, {
								[classes.iconActive]: book.is_favourited,
							})}
							onClick={toggleFavourite}
							disabled={savingFavourite}
							aria-pressed={Boolean(book.is_favourited)}
							aria-label={
								book.is_favourited
									? 'Remove from favourites'
									: 'Add to favourites'
							}
						>
							{book.is_favourited ? (
								<IconHeartFilled size={20} />
							) : (
								<IconHeart size={20} stroke={1.5} />
							)}
						</button>
						<button
							type="button"
							className={classes.iconBtn}
							onClick={handleDownload}
							disabled={downloading || !chapters.length}
							aria-label="Download audio"
						>
							<IconDownload size={20} stroke={1.5} />
						</button>
						<button
							type="button"
							className={classes.iconBtn}
							onClick={() => setShareOpen(true)}
							aria-label="Share"
						>
							<IconShare3 size={20} stroke={1.5} />
						</button>
						<Dropdown
							trigger={['click']}
							placement="bottomRight"
							menu={{
								items: [
									{
										key: 'review',
										label: 'Review',
										icon: <IconStar size={16} />,
									},
									{
										key: 'report',
										label: 'Report',
										icon: <IconFlag size={16} />,
									},
								],
								onClick: ({ key }) => {
									if (key === 'review') setReviewOpen(true)
									if (key === 'report') setReportOpen(true)
								},
							}}
						>
							<button
								type="button"
								className={classes.iconBtn}
								aria-label="More"
							>
								<IconDots size={20} stroke={1.5} />
							</button>
						</Dropdown>
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
						[classes.active]: tab === 'vocab',
					})}
					onClick={() => setTab('vocab')}
				>
					Searched vocab
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
			) : tab === 'vocab' ? (
				<div className={classes.vocab}>
					<div className={classes.vocabTitle}>
						Words you looked up while reading
					</div>
					{vocabLoading && !vocabWords.length ? (
						<div className={classes.empty}>Loading…</div>
					) : vocabWords.length ? (
						<div className={classes.vocabList}>
							{vocabWords.map((word) => {
								const sense = word.senses?.[0]
								return (
									<div key={word.source_vocab_id} className={classes.vocabItem}>
										<div className={classes.vocabItemHead}>
											<span className={classes.vocabItemWord}>
												{word.vocab}
											</span>
											<button
												type="button"
												className={classes.vocabItemRemove}
												onClick={() => deleteVocabWord(word.source_vocab_id)}
												aria-label={`Remove ${word.vocab}`}
											>
												<IconX size={14} />
											</button>
										</div>
										{sense?.meaning ? (
											<div className={classes.vocabItemMeaning}>
												{sense.meaning}
											</div>
										) : null}
										{sense?.example ? (
											<div className={classes.vocabItemExample}>
												{sense.example}
											</div>
										) : null}
									</div>
								)
							})}
						</div>
					) : (
						<BookEmptyState
							title="No searched vocab yet"
							description="Look up a word while reading to save it here."
						/>
					)}
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
						<BookEmptyState title="No chapters yet" />
					)}
				</div>
			)}

			<BookShareModal
				open={shareOpen}
				url={shareUrl}
				onClose={() => setShareOpen(false)}
			/>
			<BookReportModal
				open={reportOpen}
				bookId={bookId}
				onClose={() => setReportOpen(false)}
			/>
			<BookReviewListModal
				open={reviewListOpen}
				bookId={bookId}
				bookTitle={book.title}
				onClose={() => setReviewListOpen(false)}
				onWrite={() => {
					setReviewListOpen(false)
					setReviewOpen(true)
				}}
			/>
			<BookReviewModal
				open={reviewOpen}
				bookId={bookId}
				onClose={() => setReviewOpen(false)}
				onSubmitted={refreshBook}
			/>
		</div>
	)
}

export default memo(BookDetail)
