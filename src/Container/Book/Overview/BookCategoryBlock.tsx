'use client'

import { memo, useEffect, useMemo, useState } from 'react'
import { IconChevronRight } from '@tabler/icons-react'
import clsx from 'clsx'

import {
	getBookListV2,
	mapBookCard,
	parseApiList,
	parseListTotal,
} from '@/apis/book/bookApis'
import BookCard from '@/Components/Book/BookCard'
import BookEmptyState from '@/Components/Book/BookEmptyState'
import { useBookLibrary } from '@/context/BookLibraryContext'
import { BookApiItem, BookCardItem } from '@/interface/Book/book.interface'
import { useLocalePath } from '@/ultis/route'
import {
	bookCategoryPath,
	bookDetailPath,
	toBookListLevel,
} from '@/Variable/book.variable'

import classes from './BookOverview.module.scss'

const RAIL_LIMIT = 12

// Reading progress of a book from its reading_progress rows (0-100), if started
const progressOf = (book: BookApiItem) => {
	const rows = book.reading_progress || []
	if (!rows.length) return undefined
	const read = Math.max(...rows.map((row) => row.current_page || 0))
	const total =
		book.total_pages || Math.max(...rows.map((row) => row.max_page || 0)) || 0
	if (!total) return undefined
	return { read: Math.min(read, total), total }
}

const toCard = (book: BookApiItem): BookCardItem | null => {
	const card = mapBookCard(book)
	if (!card) return null
	const progress = progressOf(book)
	if (!progress) return card
	return {
		...card,
		progressLabel: `Page ${progress.read}/${progress.total}`,
		progressPercent: Math.round((progress.read / progress.total) * 100),
	}
}

/**
 * Overview Category block: every category with its book count; the selected
 * one lists its books with the reader's progress: books being read first, then
 * books not started, then finished ones (a finished book shows a full green bar).
 */
function BookCategoryBlock() {
	const { onChangeRoute } = useLocalePath()
	const { categories, level } = useBookLibrary()
	const [selected, setSelected] = useState<string>('')
	const [counts, setCounts] = useState<Record<string, number>>({})
	const [books, setBooks] = useState<BookCardItem[]>([])
	const [total, setTotal] = useState(0)
	const [loading, setLoading] = useState(false)

	const items = useMemo(
		() => categories.filter((item) => item.title),
		[categories],
	)
	const current = items.find((item) => (item.id || item.title) === selected) || items[0]

	// book count per category for the current level
	useEffect(() => {
		if (!items.length) return
		let cancelled = false
		Promise.all(
			items.map((item) =>
				getBookListV2({ page: 1, limit: 1, level: toBookListLevel(level), category: item.title })
					.then((res) => [item.title as string, parseListTotal(res, 0)] as const)
					.catch(() => [item.title as string, 0] as const),
			),
		).then((pairs) => {
			if (!cancelled) setCounts(Object.fromEntries(pairs))
		})
		return () => {
			cancelled = true
		}
	}, [items, level])

	useEffect(() => {
		if (!current?.title) return
		let cancelled = false
		setLoading(true)
		getBookListV2({
			page: 1,
			limit: RAIL_LIMIT,
			level: toBookListLevel(level),
			category: current.title,
		})
			.then((res) => {
				if (cancelled) return
				const cards = parseApiList<BookApiItem>(res)
					.map(toCard)
					.filter((item): item is BookCardItem => Boolean(item))
				// reading first, then not started, then finished
				const rank = (card: BookCardItem) =>
					card.progressPercent === undefined ? 1 : card.progressPercent < 100 ? 0 : 2
				setBooks([...cards].sort((a, b) => rank(a) - rank(b)))
				setTotal(parseListTotal(res, cards.length))
			})
			.catch(() => {
				if (!cancelled) {
					setBooks([])
					setTotal(0)
				}
			})
			.finally(() => {
				if (!cancelled) setLoading(false)
			})
		return () => {
			cancelled = true
		}
	}, [current?.title, level])

	if (!items.length) return null

	const currentId = current?.id || current?.title || ''

	return (
		<section className={classes.category}>
			<div className={classes.categoryHead}>
				<div className={classes.categoryTitle}>Category</div>
				{currentId ? (
					<button
						type="button"
						className={classes.categoryAll}
						onClick={() => onChangeRoute(bookCategoryPath(currentId))}
						aria-label={`See all ${current?.title}`}
					>
						<IconChevronRight size={18} stroke={2} />
					</button>
				) : null}
			</div>
			<div className={classes.categoryChips} role="tablist">
				{items.map((item) => {
					const key = item.id || item.title || ''
					return (
						<button
							key={key}
							type="button"
							role="tab"
							aria-selected={key === currentId}
							className={clsx(classes.categoryChip, {
								[classes.categoryChipActive]: key === currentId,
							})}
							onClick={() => setSelected(key)}
						>
							{item.title}
							{counts[item.title as string] !== undefined ? (
								<span className={classes.categoryCount}>{counts[item.title as string]}</span>
							) : null}
						</button>
					)
				})}
			</div>
			{loading ? (
				<div className={classes.categoryEmpty}>Loading…</div>
			) : books.length ? (
				<>
					<div className={classes.categoryTotal}>
						{total} {total === 1 ? 'book' : 'books'}
					</div>
					<div className={classes.categoryRail}>
						{books.map((book) => (
							<BookCard
								key={book.id}
								book={book}
								variant="rail"
								onClick={() => onChangeRoute(bookDetailPath(book.id))}
							/>
						))}
					</div>
				</>
			) : (
				<BookEmptyState title="No books in this category yet" compact />
			)}
		</section>
	)
}

export default memo(BookCategoryBlock)
