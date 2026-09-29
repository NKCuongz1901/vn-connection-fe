'use client'

import { memo } from 'react'
import {
	IconAlertOctagonFilled,
	IconCircleArrowUpFilled,
	IconClockFilled,
	IconDots,
	IconPencil,
	IconProgress,
	IconTrash,
} from '@tabler/icons-react'
import { Dropdown } from 'antd'
import clsx from 'clsx'

import { languageLabelFromCodes } from '@/apis/book/bookApis'
import { ContributedBook } from '@/apis/book/contributeApis'
import CImage from '@/Components/Custom/CImage/CImage'
import { TYPE_SIZE_IMAGE } from '@/Variable/image.variable'

import classes from './BookContribute.module.scss'

type ContributedBookRowProps = {
	book: ContributedBook
	onView: () => void
	onEdit: () => void
	onDelete: () => void
}

// Same wording and colours as the app's chapter status
const STATUS = {
	approved: { label: 'Approved', icon: IconCircleArrowUpFilled, className: classes.statusApproved },
	under_review: { label: 'Under Review', icon: IconClockFilled, className: classes.statusReview },
	inprogress: { label: 'In Progress', icon: IconProgress, className: classes.statusProgress },
	rejected: { label: 'Rejected', icon: IconAlertOctagonFilled, className: classes.statusRejected },
} as const

/** A contributed book: cover, title, author, level | category | languages, status and actions */
function ContributedBookRow({ book, onView, onEdit, onDelete }: ContributedBookRowProps) {
	const category = (book.category || []).find(
		(item) => !item.toLowerCase().includes('contribut'),
	)
	const meta = [
		book.level ? book.level.toUpperCase() : undefined,
		category,
		languageLabelFromCodes(book.language)?.replace(' only', ''),
	].filter(Boolean)
	const status = book.approved_status ? STATUS[book.approved_status] : undefined
	const StatusIcon = status?.icon
	// the app only shows a status once the book has content
	const showStatus = Boolean(status) && (book.total_pages || 0) > 0
	const published = book.published_status === 'published'

	return (
		<div className={classes.row}>
			<button type="button" className={classes.rowCover} onClick={onView} aria-label="View book">
				{book.cover_image ? (
					<CImage src={book.cover_image} sizeType={TYPE_SIZE_IMAGE.small} alt="" />
				) : null}
				<span className={classes.viewBook}>View book</span>
			</button>
			<div className={classes.rowCopy}>
				<div className={classes.rowTitle}>{book.title}</div>
				{book.author ? <div className={classes.rowAuthor}>{book.author}</div> : null}
				{meta.length ? (
					<div className={classes.rowMeta}>
						{meta.map((item, index) => (
							<span key={item}>
								{index ? <i className={classes.sep} /> : null}
								{item}
							</span>
						))}
					</div>
				) : null}
				{showStatus && status && StatusIcon ? (
					<div className={clsx(classes.status, status.className)}>
						<StatusIcon size={18} />
						<span>
							{status.label}
							{book.approved_status === 'approved' ? (
								<b> | {published ? 'Published' : 'Unpublished'}</b>
							) : null}
						</span>
					</div>
				) : !showStatus ? (
					<div className={clsx(classes.status, classes.statusMuted)}>No chapters yet</div>
				) : null}
			</div>
			<Dropdown
				trigger={['click']}
				placement="bottomRight"
				menu={{
					items: [
						{ key: 'edit', label: 'Edit book', icon: <IconPencil size={16} /> },
						{ key: 'delete', label: 'Delete this book', icon: <IconTrash size={16} />, danger: true },
					],
					onClick: ({ key }) => (key === 'edit' ? onEdit() : onDelete()),
				}}
			>
				<button type="button" className={classes.more} aria-label="More">
					<IconDots size={20} />
				</button>
			</Dropdown>
		</div>
	)
}

export default memo(ContributedBookRow)
