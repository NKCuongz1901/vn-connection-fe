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
	IconProgress,
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
	ChapterProcessStatus,
	ContributedBook,
	ContributedChapter,
	deleteChapter,
	deleteMultilingualChapter,
	getChapterProcessStatus,
	getMyBookChapters,
	publishChapters,
	publishMultilingualChapters,
	unpublishChapters,
	unpublishMultilingualChapter,
} from '@/apis/book/contributeApis'
import CImage from '@/Components/Custom/CImage/CImage'
import CModal from '@/Components/Custom/CModal/CModal'
import { useModal } from '@/context/ModalContext'
import { useLocalePath } from '@/ultis/route'
import { BOOK_ROOT, bookReadPath } from '@/Variable/book.variable'
import { TYPE_SIZE_IMAGE } from '@/Variable/image.variable'

import ContributeBookModal from './ContributeBookModal'
import CreateChapterModal from './CreateChapterModal'
import classes from './BookContribute.module.scss'

/** `processing`: an approved multilingual chapter whose translations and audio are not done yet */
type ChapterState = 'published' | 'approved' | 'processing' | 'review' | 'rejected'

const chapterState = (chapter: ContributedChapter, process?: ChapterProcessStatus): ChapterState =>
	chapter.approved_status === 'approved'
		? chapter.published_status === 'published'
			? 'published'
			: process && !process.ready_to_publish
				? 'processing'
				: 'approved'
		: chapter.approved_status === 'rejected'
			? 'rejected'
			: 'review'

const STATE_VIEW: Record<ChapterState, { label: string; icon: typeof IconClockFilled; className: string }> = {
	published: { label: 'Approved | Published', icon: IconCircleArrowUpFilled, className: classes.statusApproved },
	approved: { label: 'Approved | Unpublished', icon: IconCircleArrowUpFilled, className: classes.statusApproved },
	processing: { label: 'In progress', icon: IconProgress, className: classes.statusProgress },
	review: { label: 'Under Review', icon: IconClockFilled, className: classes.statusReview },
	rejected: { label: 'Rejected', icon: IconAlertOctagonFilled, className: classes.statusRejected },
}

// the popup a chapter opens, as in the app
const STATE_POPUP: Record<ChapterState, { title: string; message: string; action: string }> = {
	published: {
		title: 'Chapter Approved',
		message: 'Great news! Your chapter has been approved and published.',
		action: 'Preview',
	},
	approved: {
		title: 'Chapter Approved',
		message: 'Great news! Your chapter has been approved. Select it and tap Publish now to share it.',
		action: 'Ok, got it',
	},
	processing: {
		title: 'Chapter Incomplete',
		message: 'This chapter is still being translated and voiced. You can publish it once it is ready.',
		action: 'Continue',
	},
	review: {
		title: 'Chapter Under Review',
		message: 'Your chapter is being reviewed by the UniVini team.',
		action: 'Ok, got it',
	},
	rejected: {
		title: 'Chapter Rejected',
		message: "Sorry, your chapter can't be published because the content isn't suitable for the community or doesn't meet our guidelines.",
		action: 'Edit & resubmit',
	},
}

const BOOK_STATE_ORDER: ChapterState[] = ['published', 'approved', 'processing', 'review', 'rejected']

function StatusLine({ state, percent }: { state?: ChapterState; percent?: number }) {
	if (!state) return null
	const view = STATE_VIEW[state]
	const Icon = view.icon
	return (
		<div className={clsx(classes.status, view.className)}>
			<Icon size={16} />
			<span>
				{view.label}
				{state === 'processing' && percent !== undefined ? ` · ${percent}%` : ''}
			</span>
		</div>
	)
}

type MyBookDetailProps = {
	bookId: string
}

/** The reader's own book: its chapters with review status, add, resubmit, publish, unpublish and delete */
function MyBookDetail({ bookId }: MyBookDetailProps) {
	const { onChangeRoute } = useLocalePath()
	const { openConfirm, closeModal } = useModal()
	const [book, setBook] = useState<ContributedBook | null>(null)
	const [chapters, setChapters] = useState<ContributedChapter[]>([])
	const [progress, setProgress] = useState<Record<string, ChapterProcessStatus>>({})
	const [loading, setLoading] = useState(true)
	const [selected, setSelected] = useState<string[]>([])
	const [publishing, setPublishing] = useState(false)
	// undefined: closed, null: new chapter, a chapter: edit and resubmit it
	const [chapterForm, setChapterForm] = useState<ContributedChapter | null | undefined>(undefined)
	const [thanksOpen, setThanksOpen] = useState(false)
	const [editOpen, setEditOpen] = useState(false)
	const [popup, setPopup] = useState<ContributedChapter | null>(null)

	const languages = book?.language || []
	const multilingual = book?.language_type === 'bilingual' || languages.length > 1

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

	// multilingual chapters can be published only once every language has its audio
	useEffect(() => {
		if (!multilingual) return
		const pending = chapters.filter(
			(item) => item.id && item.approved_status === 'approved' && item.published_status !== 'published',
		)
		if (!pending.length) return
		let cancelled = false
		Promise.all(
			pending.map((item) =>
				getChapterProcessStatus(item.id as string)
					.then((res) => [item.id as string, parseApiObject<ChapterProcessStatus>(res) || {}] as const)
					.catch(() => [item.id as string, {}] as const),
			),
		).then((pairs) => {
			if (!cancelled) setProgress(Object.fromEntries(pairs))
		})
		return () => {
			cancelled = true
		}
	}, [chapters, multilingual])

	const stateOf = useCallback(
		(chapter: ContributedChapter) => chapterState(chapter, chapter.id ? progress[chapter.id] : undefined),
		[progress],
	)

	const publishable = useMemo(
		() => chapters.filter((item) => item.id && stateOf(item) === 'approved').map((item) => item.id as string),
		[chapters, stateOf],
	)
	const allSelected = publishable.length > 0 && publishable.every((id) => selected.includes(id))
	const bookState = useMemo(() => {
		const states = chapters.map(stateOf)
		return BOOK_STATE_ORDER.find((state) => states.includes(state))
	}, [chapters, stateOf])

	const languageLabel = languageLabelFromCodes(languages)?.replace(' only', '') || 'English'
	const category = (book?.category || []).find((item) => !item.toLowerCase().includes('contribut'))
	const meta = [book?.level ? book.level.toUpperCase() : undefined, category, languageLabel].filter(Boolean)

	const toggle = (id: string) =>
		setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))

	const publish = async () => {
		if (!selected.length || publishing) return
		setPublishing(true)
		try {
			await (multilingual ? publishMultilingualChapters(selected) : publishChapters(selected))
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
					const id = chapter.id as string
					await (multilingual ? unpublishMultilingualChapter(id) : unpublishChapters([id]))
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
					const id = chapter.id as string
					await (multilingual ? deleteMultilingualChapter(id) : deleteChapter(id))
					toast.success('Chapter deleted')
					await loadChapters()
				} catch {
					toast.error('Could not delete the chapter')
				}
			},
		})
	}

	const popupState = popup ? stateOf(popup) : undefined
	const popupView = popupState ? STATE_POPUP[popupState] : undefined
	const onPopupAction = () => {
		const chapter = popup
		setPopup(null)
		if (!chapter?.id) return
		if (popupState === 'published') {
			onChangeRoute(bookReadPath(bookId, { chapter: chapter.id, page: 1, mode: 'read' }))
		} else if (popupState === 'rejected') {
			setChapterForm(chapter)
		}
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
					<StatusLine state={bookState} />
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
						const state = stateOf(chapter)
						const id = chapter.id as string
						return (
							<div key={id} className={classes.chapterRow}>
								<Checkbox
									checked={selected.includes(id)}
									disabled={state !== 'approved'}
									onChange={() => toggle(id)}
									aria-label="Select to publish"
								/>
								<button type="button" className={classes.chapterOpen} onClick={() => setPopup(chapter)}>
									<span className={classes.chapterThumb}>
										{chapter.cover_image ? (
											<CImage src={chapter.cover_image} sizeType={TYPE_SIZE_IMAGE.small} alt="" />
										) : (
											<IconPhoto size={20} stroke={1.5} />
										)}
									</span>
									<span className={classes.rowCopy}>
										<span className={classes.rowTitle}>
											{chapter.title || `Chapter ${chapter.chapter_number || ''}`}
										</span>
										{chapter.description ? (
											<span className={classes.rowAuthor}>{chapter.description}</span>
										) : null}
										<StatusLine state={state} percent={progress[id]?.percentage_complete} />
									</span>
								</button>
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
								<button
									type="button"
									className={classes.chapterChevron}
									onClick={() => setPopup(chapter)}
									aria-label="Chapter status"
								>
									<IconChevronRight size={18} />
								</button>
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

			<button
				type="button"
				className={chapters.length ? classes.addChapter : classes.emptyBtn}
				onClick={() => setChapterForm(null)}
			>
				<IconPlus size={16} /> Add chapter
			</button>

			{selected.length ? (
				<button type="button" className={classes.publishNow} onClick={publish} disabled={publishing}>
					{publishing ? 'Publishing…' : `Publish now (${selected.length})`}
				</button>
			) : null}

			<CreateChapterModal
				open={chapterForm !== undefined}
				bookId={bookId}
				languageLabel={languageLabel}
				multilingual={multilingual}
				chapter={chapterForm}
				onClose={() => setChapterForm(undefined)}
				onCreated={() => {
					// a multilingual chapter is approved straight away; the others go to review
					if (multilingual && !chapterForm) toast.success('Chapter uploaded. Translations and audio are on the way.')
					else setThanksOpen(true)
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
				open={Boolean(popupView)}
				centered
				footer={null}
				onCancel={() => setPopup(null)}
				styles={{ content: { width: 400, maxWidth: 'calc(100vw - 32px)' } }}
			>
				{popupView && popupState ? (
					<div className={classes.thanks}>
						<StatusIcon state={popupState} />
						<div className={classes.thanksTitle}>{popupView.title}</div>
						<div className={classes.emptyHint}>{popupView.message}</div>
						<button type="button" className={classes.primary} onClick={onPopupAction}>
							{popupView.action}
						</button>
					</div>
				) : null}
			</CModal>
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

function StatusIcon({ state }: { state: ChapterState }) {
	const view = STATE_VIEW[state]
	const Icon = view.icon
	return <Icon size={56} className={view.className} />
}

export default memo(MyBookDetail)
