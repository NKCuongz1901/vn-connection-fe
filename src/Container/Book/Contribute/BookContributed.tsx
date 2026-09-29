'use client'

import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { IconAdjustmentsHorizontal, IconChevronLeft, IconPlus, IconSearch } from '@tabler/icons-react'
import clsx from 'clsx'
import { toast } from 'react-toastify'

import { parseApiList, parseListTotal } from '@/apis/book/bookApis'
import {
	ContributedBook,
	ContributedTab,
	deleteContributedBook,
	getMyContributedBooks,
} from '@/apis/book/contributeApis'
import { useModal } from '@/context/ModalContext'
import { useLocalePath } from '@/ultis/route'
import { BOOK_ROOT, bookDetailPath } from '@/Variable/book.variable'

import ContributeBookModal from './ContributeBookModal'
import ContributedBookRow from './ContributedBookRow'
import ContributeFilterModal, { ContributeFilters } from './ContributeFilterModal'
import classes from './BookContribute.module.scss'

const PAGE_SIZE = 20
const SEARCH_DEBOUNCE_MS = 300

const TABS: { key: ContributedTab; label: string }[] = [
	{ key: 'all', label: 'All' },
	{ key: 'approved', label: 'Approved' },
	{ key: 'under_review', label: 'Under Review' },
	{ key: 'rejected', label: 'Rejected' },
]

/** My contributed books: the reader's own books with status, search, filters, edit and delete */
function BookContributed() {
	const { onChangeRoute } = useLocalePath()
	const { openConfirm, closeModal } = useModal()
	const searchParams = useSearchParams()
	const [tab, setTab] = useState<ContributedTab>('all')
	const [search, setSearch] = useState('')
	const [debouncedSearch, setDebouncedSearch] = useState('')
	const [filters, setFilters] = useState<ContributeFilters>({ sortBy: 'newest' })
	const [books, setBooks] = useState<ContributedBook[]>([])
	const [total, setTotal] = useState(0)
	const [loading, setLoading] = useState(true)
	const [loadingMore, setLoadingMore] = useState(false)
	const [filterOpen, setFilterOpen] = useState(false)
	const [editing, setEditing] = useState<ContributedBook | null | undefined>(undefined)
	const requestSeq = useRef(0)

	// "Contribute a book" from elsewhere opens the form straight away
	useEffect(() => {
		if (searchParams?.get('new') === '1') setEditing(null)
	}, [searchParams])

	useEffect(() => {
		const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), SEARCH_DEBOUNCE_MS)
		return () => window.clearTimeout(timer)
	}, [search])

	const load = useCallback(
		async (offset: number) => {
			const seq = ++requestSeq.current
			const res = await getMyContributedBooks({
				tab,
				search: debouncedSearch,
				sortBy: filters.sortBy,
				level: filters.level,
				category: filters.category,
				limit: PAGE_SIZE,
				offset,
			})
			if (seq !== requestSeq.current) return
			const rows = parseApiList<ContributedBook>(res)
			setBooks((prev) => (offset ? [...prev, ...rows] : rows))
			setTotal(parseListTotal(res, rows.length))
		},
		[debouncedSearch, filters, tab],
	)

	const reload = useCallback(() => {
		setLoading(true)
		load(0)
			.catch(() => {
				setBooks([])
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
		await load(books.length).catch(() => {})
		setLoadingMore(false)
	}

	const confirmDelete = (book: ContributedBook) => {
		if (!book.id) return
		openConfirm({
			titleLabel: 'Delete this book',
			message: `Delete "${book.title || 'this book'}" and all of its chapters? This cannot be undone.`,
			confirmLabel: 'Delete',
			cancelLabel: 'Cancel',
			onAccept: async () => {
				closeModal()
				try {
					await deleteContributedBook(book.id as string)
					setBooks((prev) => prev.filter((item) => item.id !== book.id))
					setTotal((prev) => Math.max(0, prev - 1))
					toast.success('Book deleted')
				} catch {
					toast.error('Could not delete the book')
				}
			},
		})
	}

	const filtered = Boolean(filters.level || filters.category || filters.sortBy !== 'newest')
	const noBooksAtAll = !loading && !books.length && tab === 'all' && !debouncedSearch && !filtered

	return (
		<div className={classes.page}>
			<div className={classes.head}>
				<button type="button" className={classes.back} onClick={() => onChangeRoute(BOOK_ROOT)}>
					<IconChevronLeft size={20} />
					<span>My contributed books</span>
				</button>
				<button type="button" className={classes.contribute} onClick={() => setEditing(null)}>
					<IconPlus size={18} /> Contribute a book
				</button>
			</div>

			{!noBooksAtAll ? (
				<div className={classes.tabs} role="tablist">
					{TABS.map((item) => (
						<button
							key={item.key}
							type="button"
							role="tab"
							aria-selected={tab === item.key}
							className={clsx(classes.tab, { [classes.tabActive]: tab === item.key })}
							onClick={() => setTab(item.key)}
						>
							{item.label}
						</button>
					))}
				</div>
			) : null}

			<div className={classes.searchRow}>
				<label className={classes.search}>
					<IconSearch size={18} stroke={1.5} />
					<input
						type="search"
						value={search}
						placeholder="Search books, authors,..."
						onChange={(event) => setSearch(event.target.value)}
					/>
				</label>
				<button
					type="button"
					className={clsx(classes.filterBtn, { [classes.filterOn]: filtered })}
					onClick={() => setFilterOpen(true)}
					aria-label="Filter"
				>
					<IconAdjustmentsHorizontal size={20} />
				</button>
			</div>

			{loading ? (
				<div className={classes.empty}>Loading…</div>
			) : books.length ? (
				<div className={classes.list}>
					{books.map((book) => (
						<ContributedBookRow
							key={book.id}
							book={book}
							onView={() => book.id && onChangeRoute(bookDetailPath(book.id))}
							onEdit={() => setEditing(book)}
							onDelete={() => confirmDelete(book)}
						/>
					))}
					{books.length < total ? (
						<button type="button" className={classes.loadMore} onClick={loadMore} disabled={loadingMore}>
							{loadingMore ? 'Loading…' : 'Load more'}
						</button>
					) : null}
				</div>
			) : noBooksAtAll ? (
				<div className={classes.emptyState}>
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img src="/images/book/empty-books.png" alt="" width={80} height={80} />
					<div className={classes.emptyTitle}>Share your books or stories for everyone to read on UniVini.</div>
					<div className={classes.emptyHint}>Click &ldquo;Contribute a book&rdquo; to get started.</div>
					<button type="button" className={classes.emptyBtn} onClick={() => setEditing(null)}>
						Contribute a book
					</button>
				</div>
			) : (
				<div className={classes.empty}>No books match these filters.</div>
			)}

			<ContributeFilterModal
				open={filterOpen}
				value={filters}
				onClose={() => setFilterOpen(false)}
				onApply={setFilters}
			/>
			<ContributeBookModal
				open={editing !== undefined}
				book={editing}
				onClose={() => setEditing(undefined)}
				onSaved={() => reload()}
			/>
		</div>
	)
}

export default memo(BookContributed)
