'use client'

import { memo, useEffect, useState } from 'react'
import clsx from 'clsx'
import { IconStarFilled } from '@tabler/icons-react'

import CModal from '@/Components/Custom/CModal/CModal'
import {
	createBookReview,
	parseBookReview,
	getMyBookReview,
	updateBookReview,
} from '@/apis/book/bookApis'
import { useModal } from '@/context/ModalContext'
import { useLocalePath } from '@/ultis/route'
import { BOOK_PROFILE_PATH } from '@/Variable/book.variable'

import classes from './BookReviewModal.module.scss'

export const REVIEW_COMMENT_MAX = 1000

const RATING_COPY: Record<number, { emoji: string; label: string }> = {
	0: { emoji: '😊', label: 'Rate your experience' },
	1: { emoji: '😣', label: 'Not for me' },
	2: { emoji: '😕', label: 'Had some good parts' },
	3: { emoji: '🙂', label: 'Decent read' },
	4: { emoji: '😍', label: 'Loved it!' },
	5: { emoji: '🤩', label: 'Really enjoyed it' },
}

type BookRatingStarsProps = {
	value: number
	onChange?: (value: number) => void
	readOnly?: boolean
}

export function BookRatingStars({
	value,
	onChange,
	readOnly,
}: BookRatingStarsProps) {
	const [hover, setHover] = useState(0)
	const shown = hover || value

	return (
		<div
			className={classes.stars}
			onMouseLeave={() => setHover(0)}
		>
			{[1, 2, 3, 4, 5].map((n) => (
				<button
					key={n}
					type="button"
					className={clsx(classes.star, { [classes.filled]: n <= shown })}
					aria-label={`${n} star`}
					disabled={readOnly}
					onMouseEnter={() => {
						if (!readOnly) setHover(n)
					}}
					onClick={() => onChange?.(n)}
				>
					<IconStarFilled size={33} />
				</button>
			))}
		</div>
	)
}

type BookReviewModalProps = {
	open: boolean
	bookId: string
	/** Reading profile → Your reviews: the reader's existing review can be edited */
	editable?: boolean
	onClose: () => void
	onSubmitted?: () => void
}

function reviewErrorMessage(error: unknown) {
	const err = error as { response?: { data?: { message?: string } }; message?: string }
	return err?.response?.data?.message || err?.message || ''
}

function BookReviewModal({
	open,
	bookId,
	editable = false,
	onClose,
	onSubmitted,
}: BookReviewModalProps) {
	const { openError, openSuccess } = useModal()
	const { onChangeRoute } = useLocalePath()
	const [reviewId, setReviewId] = useState<string | null>(null)
	const [rating, setRating] = useState(0)
	const [comment, setComment] = useState('')
	const [submitting, setSubmitting] = useState(false)
	const [ready, setReady] = useState(false)
	// One review per account: once it exists the form is read-only here and is
	// edited from Profile → Your review
	const alreadyReviewed = Boolean(reviewId) && !editable
	const isEdit = Boolean(reviewId) && editable

	useEffect(() => {
		if (!open) return

		let cancelled = false
		setReviewId(null)
		setRating(0)
		setComment('')
		setSubmitting(false)
		setReady(false)

		const load = async () => {
			try {
				const res = await getMyBookReview(bookId)
				if (cancelled) return
				const existing = parseBookReview(res)
				if (existing?.id) {
					setReviewId(existing.id)
					setRating(existing.content_rating || 0)
					setComment(existing.comment || '')
				}
			} catch {
				// first-time review — keep empty form
			} finally {
				if (!cancelled) setReady(true)
			}
		}

		load()

		return () => {
			cancelled = true
		}
	}, [bookId, open])

	if (!open) return null

	const copy = RATING_COPY[rating] || RATING_COPY[0]
	const canSubmit = ready && !alreadyReviewed && rating >= 1 && !submitting

	const submit = async () => {
		if (!canSubmit) return
		setSubmitting(true)
		try {
			const payload = {
				content_rating: rating,
				comment: comment.trim() || undefined,
			}
			if (isEdit && reviewId) {
				await updateBookReview(reviewId, payload)
			} else {
				await createBookReview({ book_id: bookId, ...payload })
			}
			openSuccess({
				message: isEdit
					? 'Review updated successfully!'
					: 'Review submitted successfully!',
			})
			onSubmitted?.()
			onClose()
		} catch (error) {
			if (reviewErrorMessage(error) === 'Review already exists') {
				// reviewed from another device: show that review instead
				const existing = parseBookReview(
					await getMyBookReview(bookId).catch(() => null),
				)
				if (existing?.id) {
					setReviewId(existing.id)
					setRating(existing.content_rating || 0)
					setComment(existing.comment || '')
					return
				}
			}
			openError(error)
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<CModal
			open
			centered
			title={
				isEdit ? 'Edit your review' : alreadyReviewed ? 'Your review' : 'Review'
			}
			footer={null}
			onCancel={onClose}
			styles={{
				content: {
					width: 660,
					maxWidth: 'calc(100vw - 32px)',
					height: 680,
					maxHeight: 'calc(100vh - 48px)',
					padding: 0,
					borderRadius: 8,
					overflow: 'hidden',
				},
				header: {
					margin: 0,
					padding: '16px 24px 8px',
					borderBottom: '1px solid #d9d9d9',
				},
				body: {
					padding: 0,
					overflow: 'hidden',
					flex: 1,
					minHeight: 0,
				},
			}}
		>
			<div className={classes.body}>
				<div className={classes.content}>
					<div className={classes.rating}>
						<div className={classes.emoji} aria-hidden>
							{copy.emoji}
						</div>
						<div className={classes.label}>{copy.label}</div>
						<BookRatingStars
							value={rating}
							onChange={setRating}
							readOnly={alreadyReviewed}
						/>
					</div>
					<div className={classes.field}>
						<textarea
							className={classes.textarea}
							value={comment}
							maxLength={REVIEW_COMMENT_MAX}
							placeholder={alreadyReviewed ? '' : 'Write your review here…'}
							readOnly={alreadyReviewed}
							onChange={(event) => setComment(event.target.value)}
						/>
						{alreadyReviewed ? null : (
							<div className={classes.counter}>
								{comment.length}/{REVIEW_COMMENT_MAX}
							</div>
						)}
					</div>
				</div>
				<div className={classes.footer}>
					{alreadyReviewed ? (
						<div className={classes.notice}>
							You have already reviewed this book. To change your review, go
							to{' '}
							<button
								type="button"
								className={classes.noticeLink}
								onClick={() => {
									onClose()
									onChangeRoute(BOOK_PROFILE_PATH)
								}}
							>
								Reading profile → Your reviews
							</button>
							.
						</div>
					) : (
						<button
							type="button"
							className={classes.submit}
							disabled={!canSubmit}
							onClick={submit}
						>
							{isEdit ? 'Save changes' : 'Submit review'}
						</button>
					)}
				</div>
			</div>
		</CModal>
	)
}

export default memo(BookReviewModal)
