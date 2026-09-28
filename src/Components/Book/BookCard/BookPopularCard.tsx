'use client'

import { memo, useEffect, useState } from 'react'
import {
	IconCircleArrowDown,
	IconHeart,
	IconHeartFilled,
	IconShare3,
} from '@tabler/icons-react'
import clsx from 'clsx'
import { toast } from 'react-toastify'

import { toggleFavouriteBook } from '@/apis/book/bookApis'
import CImage from '@/Components/Custom/CImage/CImage'
import { useOptionalBookLibrary } from '@/context/BookLibraryContext'
import { BookCardItem } from '@/interface/Book/book.interface'
import { downloadBookAudio } from '@/ultis/bookDownload'
import { useLocalePath } from '@/ultis/route'
import { copyToClipboard } from '@/ultis/string'
import { bookDetailPath } from '@/Variable/book.variable'
import { TYPE_SIZE_IMAGE } from '@/Variable/image.variable'

import BookRating from './BookRating'
import classes from './BookCard.module.scss'

type BookPopularCardProps = {
	book: BookCardItem
	/** Show the share button (list screens) */
	showShare?: boolean
	onClick?: () => void
}

const formatViews = (count?: number) => {
	if (!count) return null
	return `${new Intl.NumberFormat('en', { notation: 'compact' }).format(count)} ${count === 1 ? 'View' : 'Views'}`
}

/** Popular now card: cover, title, author, category and duration, then language, rating, views, favourite and download */
function BookPopularCard({ book, showShare = false, onClick }: BookPopularCardProps) {
	const library = useOptionalBookLibrary()
	const { onGetPath } = useLocalePath()
	const [favourited, setFavourited] = useState(Boolean(book.isFavourited))
	const [savingFavourite, setSavingFavourite] = useState(false)
	const [downloading, setDownloading] = useState(false)

	useEffect(() => {
		setFavourited(Boolean(book.isFavourited))
	}, [book.isFavourited])

	const onToggleFavourite = async () => {
		if (savingFavourite) return
		const prev = favourited
		setFavourited(!prev)
		setSavingFavourite(true)
		try {
			await toggleFavouriteBook(book.id)
		} catch {
			setFavourited(prev)
			toast.error('Could not update favourites')
		} finally {
			setSavingFavourite(false)
		}
	}

	const onDownload = async () => {
		if (downloading) return
		setDownloading(true)
		try {
			const saved = await downloadBookAudio(
				{ id: book.id, title: book.title },
				library?.learningLang || 'en-gb',
			)
			if (!saved) toast.info('No audio for this book yet')
		} catch {
			toast.error('Could not download this book')
		} finally {
			setDownloading(false)
		}
	}

	// Same flow as Book detail: native share sheet, else copy the link
	const onShare = async () => {
		const url =
			book.shareLink || `${window.location.origin}${onGetPath(bookDetailPath(book.id))}`
		const copy = () => {
			copyToClipboard(url)
			toast.success('Link copied successfully!')
		}
		try {
			if (navigator.share) {
				await navigator.share({ title: book.title, url })
				return
			}
			copy()
		} catch (error) {
			if ((error as Error)?.name === 'AbortError') return
			copy()
		}
	}

	const views = formatViews(book.viewCount)
	const subline = [book.category, book.durationLabel].filter(Boolean)

	return (
		<div className={classes.popular}>
			<button type="button" className={classes.popularMain} onClick={onClick}>
				<div className={classes.popularCover}>
					{book.coverImage ? (
						<CImage
							src={book.coverImage}
							sizeType={TYPE_SIZE_IMAGE.small}
							alt=""
						/>
					) : null}
				</div>
				<div className={classes.popularCopy}>
					<div className={classes.popularTitle} title={book.title}>
						{book.title}
					</div>
					{book.author ? (
						<div className={classes.popularAuthor}>{book.author}</div>
					) : null}
					{subline.length ? (
						<div className={classes.popularSub}>{subline.join(' • ')}</div>
					) : null}
				</div>
			</button>
			<div className={classes.popularFooter}>
				<div className={classes.popularStats}>
					{[
						book.languageLabel ? (
							<span key="lang">{book.languageLabel}</span>
						) : null,
						book.rating ? <BookRating key="rating" rating={book.rating} /> : null,
						views ? <span key="views">{views}</span> : null,
					]
						.filter(Boolean)
						.flatMap((item, index) =>
							index ? [<i key={`sep-${index}`} className={classes.sep} />, item] : [item],
						)}
				</div>
				<div className={classes.popularActions}>
					<button
						type="button"
						className={clsx(classes.popularAction, {
							[classes.popularActionActive]: favourited,
						})}
						onClick={onToggleFavourite}
						disabled={savingFavourite}
						aria-pressed={favourited}
						aria-label={favourited ? 'Remove from favourites' : 'Add to favourites'}
					>
						{favourited ? (
							<IconHeartFilled size={20} />
						) : (
							<IconHeart size={20} stroke={1.5} />
						)}
					</button>
					<button
						type="button"
						className={classes.popularAction}
						onClick={onDownload}
						disabled={downloading}
						aria-label="Download audio"
					>
						<IconCircleArrowDown size={20} stroke={1.5} />
					</button>
					{showShare ? (
						<button
							type="button"
							className={classes.popularAction}
							onClick={onShare}
							aria-label="Share"
						>
							<IconShare3 size={20} stroke={1.5} />
						</button>
					) : null}
				</div>
			</div>
		</div>
	)
}

export default memo(BookPopularCard)
