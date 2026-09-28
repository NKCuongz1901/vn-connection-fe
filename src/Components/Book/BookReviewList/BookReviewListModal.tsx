'use client'

import { memo, useCallback, useEffect, useState } from 'react'
import { IconStarFilled } from '@tabler/icons-react'
import { Select } from 'antd'
import clsx from 'clsx'
import dayjs from 'dayjs'

import CModal from '@/Components/Custom/CModal/CModal'
import {
	getBookReviews,
	parseApiList,
	parseBookReviewStatistics,
	parseListTotal,
} from '@/apis/book/bookApis'
import {
	BookReview,
	BookReviewStatistics,
} from '@/interface/Book/book.interface'

import classes from './BookReviewListModal.module.scss'

const PAGE_SIZE = 20

type ReviewSort = 'newest' | 'highest' | 'lowest'

const SORT_OPTIONS: { value: ReviewSort; label: string }[] = [
	{ value: 'newest', label: 'Newest' },
	{ value: 'highest', label: 'Highest' },
	{ value: 'lowest', label: 'Lowest' },
]

type BookReviewListModalProps = {
	open: boolean
	bookId: string
	bookTitle?: string
	onClose: () => void
	/** Opens the review form (create, or the reader's own review) */
	onWrite: () => void
}

function Stars({ value, size = 14 }: { value: number; size?: number }) {
	return (
		<span className={classes.stars} aria-label={`${value} out of 5`}>
			{[1, 2, 3, 4, 5].map((n) => (
				<IconStarFilled
					key={n}
					size={size}
					className={clsx({ [classes.starOn]: n <= Math.round(value) })}
				/>
			))}
		</span>
	)
}

/** "Book review" screen: rating summary and every review of the book */
function BookReviewListModal({
	open,
	bookId,
	bookTitle,
	onClose,
	onWrite,
}: BookReviewListModalProps) {
	const [reviews, setReviews] = useState<BookReview[]>([])
	const [stats, setStats] = useState<BookReviewStatistics | null>(null)
	const [total, setTotal] = useState(0)
	const [loading, setLoading] = useState(false)
	const [loadingMore, setLoadingMore] = useState(false)
	const [sort, setSort] = useState<ReviewSort>('newest')

	const load = useCallback(
		async (offset: number) => {
			const res = await getBookReviews(bookId, {
				limit: PAGE_SIZE,
				offset,
				sortBy: sort,
			})
			const rows = parseApiList<BookReview>(res)
			setReviews((prev) => (offset ? [...prev, ...rows] : rows))
			setTotal(parseListTotal(res, rows.length))
			if (!offset) setStats(parseBookReviewStatistics(res))
		},
		[bookId, sort],
	)

	useEffect(() => {
		if (!open) return
		setLoading(true)
		load(0)
			.catch(() => {
				setReviews([])
				setTotal(0)
			})
			.finally(() => setLoading(false))
	}, [load, open])

	if (!open) return null

	const average = stats?.overall_rating || 0
	const count = stats?.total_reviews ?? total
	const distribution = stats?.rating_distribution?.content || {}

	const loadMore = async () => {
		if (loadingMore) return
		setLoadingMore(true)
		await load(reviews.length).catch(() => {})
		setLoadingMore(false)
	}

	return (
		<CModal
			open
			centered
			title="Book review"
			footer={null}
			onCancel={onClose}
			styles={{
				content: {
					width: 660,
					maxWidth: 'calc(100vw - 32px)',
					maxHeight: 'calc(100vh - 48px)',
					padding: 0,
					borderRadius: 8,
					overflow: 'hidden',
					display: 'flex',
					flexDirection: 'column',
				},
				header: {
					margin: 0,
					padding: '16px 24px 8px',
					borderBottom: '1px solid #d9d9d9',
				},
				body: { padding: 0, overflow: 'auto', flex: 1, minHeight: 0 },
			}}
		>
			<div className={classes.body}>
				<div className={classes.summary}>
					<div className={classes.average}>
						<div className={classes.averageValue}>
							{average ? average.toFixed(1) : '—'}
						</div>
						<Stars value={average} size={18} />
						<div className={classes.count}>
							{count} {count === 1 ? 'review' : 'reviews'}
						</div>
					</div>
					<div className={classes.bars}>
						{[5, 4, 3, 2, 1].map((n) => {
							const value = Number(distribution[n] || 0)
							const width = count ? (value / count) * 100 : 0
							return (
								<div key={n} className={classes.barRow}>
									<span>{n}</span>
									<div className={classes.bar}>
										<div
											className={classes.barFill}
											style={{ width: `${width}%` }}
										/>
									</div>
									<span className={classes.barCount}>{value}</span>
								</div>
							)
						})}
					</div>
				</div>

				<div className={classes.toolbar}>
					<button type="button" className={classes.write} onClick={onWrite}>
						Write a review
					</button>
					<Select
						value={sort}
						options={SORT_OPTIONS}
						onChange={setSort}
						className={classes.sort}
						aria-label="Sort by"
					/>
				</div>

				{loading ? (
					<div className={classes.empty}>Loading…</div>
				) : reviews.length ? (
					<div className={classes.list}>
						{reviews.map((review) => {
							const name = review.reader?.name || 'Reader'
							const date = review.updated_at || review.created_at
							return (
								<div key={review.id} className={classes.item}>
									<div className={classes.itemHead}>
										<div className={classes.avatar}>
											{review.reader?.avatar ? (
												// eslint-disable-next-line @next/next/no-img-element
												<img src={review.reader.avatar} alt="" />
											) : (
												name.charAt(0).toUpperCase()
											)}
										</div>
										<div className={classes.itemMeta}>
											<div className={classes.name}>{name}</div>
											<div className={classes.itemSub}>
												<Stars value={review.content_rating || 0} />
												{date ? (
													<span>{dayjs(date).format('DD/MM/YYYY')}</span>
												) : null}
											</div>
										</div>
									</div>
									{review.comment ? (
										<div className={classes.comment}>{review.comment}</div>
									) : null}
								</div>
							)
						})}
						{reviews.length < total ? (
							<button
								type="button"
								className={classes.more}
								onClick={loadMore}
								disabled={loadingMore}
							>
								{loadingMore ? 'Loading…' : 'Load more'}
							</button>
						) : null}
					</div>
				) : (
					<div className={classes.empty}>
						No reviews for {bookTitle || 'this book'} yet.
					</div>
				)}
			</div>
		</CModal>
	)
}

export default memo(BookReviewListModal)
