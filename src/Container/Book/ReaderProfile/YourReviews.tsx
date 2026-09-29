'use client'

import { memo, useCallback, useEffect, useState } from 'react'
import {
	IconDots,
	IconPencil,
	IconStarFilled,
	IconTrash,
} from '@tabler/icons-react'
import { Dropdown, Select } from 'antd'
import clsx from 'clsx'
import dayjs from 'dayjs'
import { toast } from 'react-toastify'

import {
	MyReviewSort,
	deleteBookReview,
	getMyBookReviews,
	parseApiList,
	parseListTotal,
} from '@/apis/book/bookApis'
import { BookEmptyState, BookReviewModal } from '@/Components/Book'
import CImage from '@/Components/Custom/CImage/CImage'
import { useModal } from '@/context/ModalContext'
import { BookReview } from '@/interface/Book/book.interface'
import { useLocalePath } from '@/ultis/route'
import { bookDetailPath } from '@/Variable/book.variable'
import { TYPE_SIZE_IMAGE } from '@/Variable/image.variable'

import classes from './ReaderProfile.module.scss'

const PAGE_SIZE = 20

const SORT_OPTIONS: { value: MyReviewSort; label: string }[] = [
	{ value: 'newest', label: 'Newest' },
	{ value: 'highest', label: 'Highest rating' },
	{ value: 'lowest', label: 'Lowest rating' },
]

/** Reading profile → Your reviews: the reader's reviews with sort, edit and delete */
function YourReviews() {
	const { onChangeRoute } = useLocalePath()
	const { openConfirm, closeModal } = useModal()
	const [sort, setSort] = useState<MyReviewSort>('newest')
	const [reviews, setReviews] = useState<BookReview[]>([])
	const [total, setTotal] = useState(0)
	const [loading, setLoading] = useState(true)
	const [loadingMore, setLoadingMore] = useState(false)
	const [editing, setEditing] = useState<string | null>(null)

	const load = useCallback(
		async (offset: number) => {
			const res = await getMyBookReviews({ sort, limit: PAGE_SIZE, offset })
			const rows = parseApiList<BookReview>(res)
			setReviews((prev) => (offset ? [...prev, ...rows] : rows))
			setTotal(parseListTotal(res, rows.length))
		},
		[sort],
	)

	const reload = useCallback(() => {
		setLoading(true)
		load(0)
			.catch(() => {
				setReviews([])
				setTotal(0)
			})
			.finally(() => setLoading(false))
	}, [load])

	useEffect(() => {
		reload()
	}, [reload])

	const loadMore = async () => {
		if (loadingMore) return
		setLoadingMore(true)
		await load(reviews.length).catch(() => {})
		setLoadingMore(false)
	}

	const confirmDelete = (review: BookReview) => {
		if (!review.id) return
		openConfirm({
			titleLabel: 'Delete review',
			message: `Delete your review of "${review.book?.title || 'this book'}"?`,
			confirmLabel: 'Delete',
			cancelLabel: 'Cancel',
			onAccept: async () => {
				closeModal()
				try {
					await deleteBookReview(review.id as string)
					setReviews((prev) => prev.filter((item) => item.id !== review.id))
					setTotal((prev) => Math.max(0, prev - 1))
					toast.success('Review deleted')
				} catch {
					toast.error('Could not delete the review')
				}
			},
		})
	}

	return (
		<div className={classes.page}>
			<div className={classes.head}>
				<div className={classes.title}>Reading profile</div>
			</div>

			<section className={classes.section}>
				<div className={classes.sectionHead}>
					<div className={classes.sectionTitle}>
						Your reviews
						{total ? <span className={classes.badge}>{total}</span> : null}
					</div>
					<Select
						value={sort}
						options={SORT_OPTIONS}
						onChange={(value) => setSort(value)}
						className={classes.sort}
						aria-label="Sort reviews"
					/>
				</div>

				{loading ? (
					<div className={classes.empty}>Loading…</div>
				) : reviews.length ? (
					<div className={classes.list}>
						{reviews.map((review) => {
							const book = review.book
							const bookId = book?.id || review.book_id
							const date = review.updated_at || review.created_at
							return (
								<div key={review.id} className={classes.item}>
									<button
										type="button"
										className={classes.book}
										onClick={() => bookId && onChangeRoute(bookDetailPath(bookId))}
									>
										<div className={classes.cover}>
											{book?.cover_image ? (
												<CImage
													src={book.cover_image}
													sizeType={TYPE_SIZE_IMAGE.small}
													alt=""
												/>
											) : null}
										</div>
										<div className={classes.bookCopy}>
											<div className={classes.bookTitle}>
												{book?.title || 'Book'}
											</div>
											{book?.author ? (
												<div className={classes.bookAuthor}>{book.author}</div>
											) : null}
											<div className={classes.meta}>
												<span className={classes.stars}>
													{[1, 2, 3, 4, 5].map((n) => (
														<IconStarFilled
															key={n}
															size={14}
															className={clsx({
																[classes.starOn]: n <= (review.content_rating || 0),
															})}
														/>
													))}
												</span>
												{date ? <span>{dayjs(date).format('DD/MM/YYYY')}</span> : null}
											</div>
										</div>
									</button>
									<Dropdown
										trigger={['click']}
										placement="bottomRight"
										menu={{
											items: [
												{
													key: 'edit',
													label: 'Edit review',
													icon: <IconPencil size={16} />,
												},
												{
													key: 'delete',
													label: 'Delete',
													icon: <IconTrash size={16} />,
													danger: true,
												},
											],
											onClick: ({ key }) => {
												if (key === 'edit' && bookId) setEditing(bookId)
												if (key === 'delete') confirmDelete(review)
											},
										}}
									>
										<button
											type="button"
											className={classes.more}
											aria-label="More"
										>
											<IconDots size={20} stroke={1.5} />
										</button>
									</Dropdown>
									{review.comment ? (
										<div className={classes.comment}>{review.comment}</div>
									) : null}
								</div>
							)
						})}
						{reviews.length < total ? (
							<button
								type="button"
								className={classes.loadMore}
								onClick={loadMore}
								disabled={loadingMore}
							>
								{loadingMore ? 'Loading…' : 'Load more'}
							</button>
						) : null}
					</div>
				) : (
					<BookEmptyState
						title="No reviews yet"
						description="Books you review will show up here."
					/>
				)}
			</section>

			<BookReviewModal
				open={Boolean(editing)}
				bookId={editing || ''}
				editable
				onClose={() => setEditing(null)}
				onSubmitted={reload}
			/>
		</div>
	)
}

export default memo(YourReviews)
