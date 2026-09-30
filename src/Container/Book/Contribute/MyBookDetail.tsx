'use client'

import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import {
	IconAlertOctagonFilled,
	IconChevronLeft,
	IconChevronRight,
	IconCircleArrowUpFilled,
	IconCircleCheckFilled,
	IconClockFilled,
	IconDots,
	IconEyeOff,
	IconPhoto,
	IconPlus,
	IconTrash,
} from '@tabler/icons-react'
import { Checkbox, Dropdown } from 'antd'
import clsx from 'clsx'
import { toast } from 'react-toastify'

import {
	getBookDetail,
	languageLabelFromCodes,
	parseApiList,
	parseApiObject,
} from '@/apis/book/bookApis'
import {
	ContributedBook,
	ContributedChapter,
	deleteChapter,
	getMyBookChapters,
	publishChapters,
	unpublishChapters,
} from '@/apis/book/contributeApis'
import CImage from '@/Components/Custom/CImage/CImage'
import CModal from '@/Components/Custom/CModal/CModal'
import { useModal } from '@/context/ModalContext'
import { useLocalePath } from '@/ultis/route'
import { BOOK_ROOT } from '@/Variable/book.variable'
import { TYPE_SIZE_IMAGE } from '@/Variable/image.variable'

import ContributeBookModal from './ContributeBookModal'
import CreateChapterModal from './CreateChapterModal'
import classes from './BookContribute.module.scss'

type ChapterState = 'published' | 'approved' | 'review' | 'rejected'

const chapterState = (chapter: ContributedChapter): ChapterState =>
	chapter.approved_status === 'approved'
		? chapter.published_status === 'published'
			? 'published'
			: 'approved'
		: chapter.approved_status === 'rejected'
			? 'rejected'
			: 'review'

const STATE_VIEW: Record<ChapterState, { label: string; icon: typeof IconClockFilled; className: string }> = {
	published: { label: 'Approved | Published', icon: IconCircleArrowUpFilled, className: classes.statusApproved },
	approved: { label: 'Approved | Unpublished', icon: IconCircleArrowUpFilled, className: classes.statusApproved },
	review: { label: 'Under Review', icon: IconClockFilled, className: classes.statusReview },
	rejected: { label: 'Rejected', icon: IconAlertOctagonFilled, className: classes.statusRejected },
}

// the book card shows the best state of its chapters
const bookState = (chapters: ContributedChapter[]): ChapterState | undefined => {
	const states = chapters.map(chapterState)
	return (['published', 'approved', 'review', 'rejected'] as const).find((state) => states.includes(state))
}

function StatusLine({ state }: { state?: ChapterState }) {
	if (!state) return null
	const view = STATE_VIEW[state]
	const Icon = view.icon
	return (
		<div className={clsx(classes.status, view.className)}>
			<Icon size={16} />
			<span>{view.label}</span>
		</div>
	)
}

type MyBookDetailProps = {
	bookId: string
}

/** The reader's own book: its chapters with review status, add, publish, unpublish and delete */
function MyBookDetail({ bookId }: MyBookDetailProps) {
	const { onChangeRoute } = useLocalePath()
	const { openConfirm, closeModal } = useModal()
	const [book, setBook] = useState<ContributedBook | null>(null)
	const [chapters, setChapters] = useState<ContributedChapter[]>([])
	const [loading, setLoading] = useState(true)
	const [selected, setSelected] = useState<string[]>([])
	const [publishing, setPublishing] = useState(false)
	const [createOpen, setCreateOpen] = useState(false)
	const [thanksOpen, setThanksOpen] = useState(false)
	const [editOpen, setEditOpen] = useState(false)

	const loadBook = useCallback(() => {
		return getBookDetail(bookId)
			.then((res) => setBook(parseApiObject<ContributedBook>(res)))
			.catch(() => setBook(null))
	}, [bookId])

	const loadChapters = useCallback(() => {
		return getMyBookChapters(bookId)
			.then((res) => {
				setChapters(parseApiList<ContributedChapter>(res))
				setSelected([])
			})
			.catch(() => setChapters([]))
	}, [bookId])

	useEffect(() => {
		setLoading(true)
		Promise.all([loadBook(), loadChapters()]).finally(() => setLoading(false))
	}, [loadBook, loadChapters])

	const publishable = useMemo(
		() => chapters.filter((item) => chapterState(item) === 'approved' && item.id).map((item) => item.id as string),
		[chapters],
	)
	const allSelected = publishable.length > 0 && publishable.every((id) => selected.includes(id))

	const languages = book?.language || []
	const multilingual = book?.language_type === 'bilingual' || languages.length > 1
	const languageLabel = languageLabelFromCodes(languages)?.replace(' only', '') || 'English'
	const category = (book?.category || []).find((item) => !item.toLowerCase().includes('contribut'))
	const meta = [book?.level ? book.level.toUpperCase() : undefined, category, languageLabel].filter(Boolean)

	const toggle = (id: string) =>
		setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))

	const publish = async () => {
		if (!selected.length || publishing) return
		setPublishing(true)
		try {
			await publishChapters(selected)
			toast.success(selected.length === 1 ? 'Chapter published' : `${selected.length} chapters published`)
			await loadChapters()
		} catch {
			toast.error('Could not publish. Please try again.')
		} finally {
			setPublishing(false)
		}
	}

	const unpublish = (chapter: ContributedChapter) => {
		if (!chapter.id) return
		openConfirm({
			titleLabel: 'Unpublish this chapter',
			message: `Readers will no longer see "${chapter.title || 'this chapter'}". You can publish it again later.`,
			confirmLabel: 'Unpublish',
			cancelLabel: 'Cancel',
			onAccept: async () => {
				closeModal()
				try {
					await unpublishChapters([chapter.id as string])
					toast.success('Chapter unpublished')
					await loadChapters()
				} catch {
					toast.error('Could not unpublish the chapter')
				}
			},
		})
	}

	const remove = (chapter: ContributedChapter) => {
		if (!chapter.id) return
		openConfirm({
			titleLabel: 'Delete this chapter',
			message: `Delete "${chapter.title || 'this chapter'}"? This cannot be undone.`,
			confirmLabel: 'Delete',
			cancelLabel: 'Cancel',
			onAccept: async () => {
				closeModal()
				try {
					await deleteChapter(chapter.id as string)
					toast.success('Chapter deleted')
					await loadChapters()
				} catch {
					toast.error('Could not delete the chapter')
				}
			},
		})
	}

	const back = () => onChangeRoute(`${BOOK_ROOT}/contributed`)

	if (loading) {
		return <div className={classes.empty}>Loading…</div>
	}

	if (!book) {
		return (
			<div className={classes.page}>
				<button type="button" className={classes.back} onClick={back}>
					<IconChevronLeft size={20} />
					<span>Book details</span>
				</button>
				<div className={classes.empty}>This book could not be found.</div>
			</div>
		)
	}

	return (
		<div className={clsx(classes.page, classes.detailPage)}>
			<button type="button" className={classes.back} onClick={back}>
				<IconChevronLeft size={20} />
				<span>Book details</span>
			</button>

			<button type="button" className={classes.bookCard} onClick={() => setEditOpen(true)}>
				<span className={classes.rowCover}>
					{book.cover_image ? <CImage src={book.cover_image} sizeType={TYPE_SIZE_IMAGE.small} alt="" /> : null}
				</span>
				<span className={classes.rowCopy}>
					<span className={classes.rowTitle}>{book.title}</span>
					{book.author ? <span className={classes.rowAuthor}>{book.author}</span> : null}
					{meta.length ? <span className={classes.rowMeta}>{meta.join(' | ')}</span> : null}
					<StatusLine state={bookState(chapters)} />
				</span>
				<IconChevronRight size={20} className={classes.chevron} />
			</button>

			<div className={classes.chapterHead}>
				<span className={classes.sectionLabel}>CHAPTER</span>
				{publishable.length ? (
					<button
						type="button"
						className={classes.selectAll}
						onClick={() => setSelected(allSelected ? [] : publishable)}
					>
						{allSelected ? 'Clear selection' : 'Select all'}
					</button>
				) : null}
			</div>

			{chapters.length ? (
				<div className={classes.list}>
					{chapters.map((chapter) => {
						const state = chapterState(chapter)
						const id = chapter.id as string
						return (
							<div key={id} className={classes.chapterRow}>
								<Checkbox
									checked={selected.includes(id)}
									disabled={state !== 'approved'}
									onChange={() => toggle(id)}
									aria-label="Select to publish"
								/>
								<span className={classes.chapterThumb}>
									{chapter.cover_image ? (
										<CImage src={chapter.cover_image} sizeType={TYPE_SIZE_IMAGE.small} alt="" />
									) : (
										<IconPhoto size={20} stroke={1.5} />
									)}
								</span>
								<div className={classes.rowCopy}>
									<div className={classes.rowTitle}>
										{chapter.title || `Chapter ${chapter.chapter_number || ''}`}
									</div>
									{chapter.description ? <div className={classes.rowAuthor}>{chapter.description}</div> : null}
									<StatusLine state={state} />
								</div>
								<Dropdown
									trigger={['click']}
									placement="bottomRight"
									menu={{
										items: [
											...(state === 'published'
												? [{ key: 'unpublish', label: 'Unpublish this chapter', icon: <IconEyeOff size={16} /> }]
												: []),
											{ key: 'delete', label: 'Delete this chapter', icon: <IconTrash size={16} />, danger: true },
										],
										onClick: ({ key }) => (key === 'unpublish' ? unpublish(chapter) : remove(chapter)),
									}}
								>
									<button type="button" className={classes.more} aria-label="More">
										<IconDots size={20} />
									</button>
								</Dropdown>
							</div>
						)
					})}
				</div>
			) : (
				<div className={classes.emptyState}>
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img src="/images/book/empty-books.png" alt="" width={80} height={80} />
					<div className={classes.emptyTitle}>There are no chapters yet!</div>
					<div className={classes.emptyHint}>To create a new chapter, click the &ldquo;Add chapter&rdquo; button below.</div>
				</div>
			)}

			{multilingual ? (
				<div className={classes.emptyHint}>Adding chapters to multilingual books is coming soon on the web.</div>
			) : (
				<button
					type="button"
					className={chapters.length ? classes.addChapter : classes.emptyBtn}
					onClick={() => setCreateOpen(true)}
				>
					<IconPlus size={16} /> Add chapter
				</button>
			)}

			{selected.length ? (
				<button type="button" className={classes.publishNow} onClick={publish} disabled={publishing}>
					{publishing ? 'Publishing…' : `Publish now (${selected.length})`}
				</button>
			) : null}

			<CreateChapterModal
				open={createOpen}
				bookId={bookId}
				languageLabel={languageLabel}
				onClose={() => setCreateOpen(false)}
				onCreated={() => {
					setThanksOpen(true)
					loadChapters()
				}}
			/>
			<ContributeBookModal
				open={editOpen}
				book={book}
				onClose={() => setEditOpen(false)}
				onSaved={(saved) => {
					if (saved) setBook((prev) => ({ ...prev, ...saved }))
					else loadBook()
				}}
			/>
			<CModal
				open={thanksOpen}
				centered
				footer={null}
				onCancel={() => setThanksOpen(false)}
				styles={{ content: { width: 400, maxWidth: 'calc(100vw - 32px)' } }}
			>
				<div className={classes.thanks}>
					<IconCircleCheckFilled size={56} className={classes.thanksIcon} />
					<div className={classes.thanksTitle}>Thanks for your submission!</div>
					<div className={classes.emptyHint}>
						Your chapter is now <b>under review</b>. The UniVini team will take <b>up to 7 days</b> to review it.
						We&apos;ll notify you as soon as it&apos;s ready.
					</div>
					<button type="button" className={classes.primary} onClick={() => setThanksOpen(false)}>
						Got it!
					</button>
				</div>
			</CModal>
		</div>
	)
}

export default memo(MyBookDetail)
