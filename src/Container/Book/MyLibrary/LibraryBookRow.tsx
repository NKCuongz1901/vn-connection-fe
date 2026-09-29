'use client'

import { memo, useState } from 'react'
import { IconCircleArrowDownFilled, IconHeart, IconHeartFilled } from '@tabler/icons-react'
import clsx from 'clsx'
import { toast } from 'react-toastify'

import { toggleFavouriteBook } from '@/apis/book/bookApis'
import CImage from '@/Components/Custom/CImage/CImage'
import { BookCardItem } from '@/interface/Book/book.interface'
import { TYPE_SIZE_IMAGE } from '@/Variable/image.variable'

import classes from './BookMyLibrary.module.scss'

type LibraryBookRowProps = {
	book: BookCardItem
	/** Downloaded tab: show the Downloaded badge instead of reading progress */
	downloaded?: boolean
	onOpen: () => void
	/** Called after the heart changes, with the new favourite state */
	onFavouriteChange?: (favourited: boolean) => void
}

/** A book in My Library: cover, title, author, level | category | languages, progress, heart */
function LibraryBookRow({ book, downloaded, onOpen, onFavouriteChange }: LibraryBookRowProps) {
	const [favourited, setFavourited] = useState(Boolean(book.isFavourited))
	const [saving, setSaving] = useState(false)

	const onToggle = async () => {
		if (saving) return
		const next = !favourited
		setFavourited(next)
		setSaving(true)
		try {
			await toggleFavouriteBook(book.id)
			onFavouriteChange?.(next)
		} catch {
			setFavourited(!next)
			toast.error('Could not update favourites')
		} finally {
			setSaving(false)
		}
	}

	const meta = [book.level?.toUpperCase(), book.category, book.languageLabel].filter(Boolean)

	return (
		<div className={classes.row}>
			<button type="button" className={classes.rowMain} onClick={onOpen}>
				<div className={classes.cover}>
					{book.coverImage ? (
						<CImage src={book.coverImage} sizeType={TYPE_SIZE_IMAGE.small} alt="" />
					) : null}
				</div>
				<div className={classes.copy}>
					<div className={classes.title}>{book.title}</div>
					{book.author ? <div className={classes.author}>{book.author}</div> : null}
					{meta.length ? (
						<div className={classes.meta}>
							{meta.map((item, index) => (
								<span key={item}>
									{index ? <i className={classes.sep} /> : null}
									{item}
								</span>
							))}
						</div>
					) : null}
					{downloaded ? (
						<div className={classes.downloaded}>
							<IconCircleArrowDownFilled size={16} /> Downloaded
						</div>
					) : book.progressPercent !== undefined ? (
						<div className={classes.progress}>
							<div className={classes.progressBar}>
								<div
									className={classes.progressFill}
									style={{ width: `${book.progressPercent}%` }}
								/>
							</div>
							<span>{book.progressLabel}</span>
						</div>
					) : null}
				</div>
			</button>
			<button
				type="button"
				className={clsx(classes.heart, { [classes.heartOn]: favourited })}
				onClick={onToggle}
				disabled={saving}
				aria-pressed={favourited}
				aria-label={favourited ? 'Remove from favourites' : 'Add to favourites'}
			>
				{favourited ? <IconHeartFilled size={22} /> : <IconHeart size={22} stroke={1.5} />}
			</button>
		</div>
	)
}

export default memo(LibraryBookRow)
