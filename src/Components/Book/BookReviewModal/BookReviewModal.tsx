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
	onClose,
	onSubmitted,
}: BookReviewModalProps) {
	const { openError, openSuccess } = useModal()
	const [reviewId, setReviewId] = useState<string | null>(null)
	const [rating, setRating] = useState(0)
	const [comment, setComment] = useState('')
	const [submitting, setSubmitting] = useState(false)
	const [ready, setReady] = useState(false)
	const isUpdate = Boolean(reviewId)

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
	const canSubmit = ready && rating >= 1 && !submitting

	const submit = async () => {
		if (!canSubmit) return
		setSubmitting(true)
		const payload = {
			content_rating: rating,
			comment: comment.trim() || undefined,
		}
		try {
			if (reviewId) {
				await updateBookReview(reviewId, payload)
			} else {
				try {
					const res = await createBookReview({
						book_id: bookId,
						...payload,
					})
					const created = parseBookReview(res)
					if (created?.id) setReviewId(created.id)
				} catch (error) {
					if (reviewErrorMessage(error) !== 'Review already exists') {
						throw error
					}
					const res = await getMyBookReview(bookId)
					const existing = parseBookReview(res)
					if (!existing?.id) throw error
					setReviewId(existing.id)
					await updateBookReview(existing.id, payload)
				}
			}
			openSuccess({
				message: isUpdate
					? 'Review updated successfully!'
					: 'Review submitted successfully!',
			})
			onSubmitted?.()
			onClose()
		} catch (error) {
			openError(error)
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<CModal
			open
			centered
			title="Review"
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
						<BookRatingStars value={rating} onChange={setRating} />
					</div>
					<div className={classes.field}>
						<textarea
							className={classes.textarea}
							value={comment}
							maxLength={REVIEW_COMMENT_MAX}
							placeholder="Write your review here…"
							onChange={(event) => setComment(event.target.value)}
						/>
						<div className={classes.counter}>
							{comment.length}/{REVIEW_COMMENT_MAX}
						</div>
					</div>
				</div>
				<div className={classes.footer}>
					<button
						type="button"
						className={classes.submit}
						disabled={!canSubmit}
						onClick={submit}
					>
						Submit review
					</button>
				</div>
			</div>
		</CModal>
	)
}

export default memo(BookReviewModal)
