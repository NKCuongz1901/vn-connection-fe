'use client'

import { memo, useState } from 'react'

import {
	IconArrowsShuffle,
	IconDownload,
	IconHeart,
	IconHeartFilled,
	IconPlayerPauseFilled,
	IconPlayerPlayFilled,
	IconPlayerSkipBackFilled,
	IconPlayerSkipForwardFilled,
	IconRepeat,
	IconRepeatOnce,
	IconPlaylist,
	IconRewindBackward10,
	IconRewindForward10,
} from '@tabler/icons-react'
import { Dropdown } from 'antd'
import clsx from 'clsx'
import { toast } from 'react-toastify'

import CImage from '@/Components/Custom/CImage/CImage'
import { useBookPlayer } from '@/context/BookPlayerContext'
import { downloadAudio } from '@/ultis/bookDownload'
import { TYPE_SIZE_IMAGE } from '@/Variable/image.variable'
import { useLocalePath } from '@/ultis/route'
import {
	PLAYBACK_SPEEDS,
	bookReadPath,
	formatPlaybackTime,
} from '@/Variable/book.variable'

import classes from './BookMiniPlayer.module.scss'

function BookMiniPlayer() {
	const [downloading, setDownloading] = useState(false)
	const { onChangeRoute } = useLocalePath()
	const {
		url,
		book,
		chapter,
		chapters,
		playing,
		currentTime,
		duration,
		rate,
		shuffle,
		repeat,
		favouritePending,
		toggle,
		seek,
		skip,
		setRate,
		toggleShuffle,
		cycleRepeat,
		toggleFavourite,
		prevChapter,
		nextChapter,
		selectChapter,
	} = useBookPlayer()

	if (!url || !book?.id) return null

	const progress = duration ? Math.min(100, (currentTime / duration) * 100) : 0
	const subtitle =
		book.author && book.author !== book.title
			? book.author
			: chapter?.title && chapter.title !== book.title
				? chapter.title
				: ''

	const cycleSpeed = () => {
		const index = PLAYBACK_SPEEDS.findIndex(
			(item) => Math.abs(item - rate) < 0.01,
		)
		const next = PLAYBACK_SPEEDS[(index + 1) % PLAYBACK_SPEEDS.length]
		setRate(next)
	}

	const onDownload = async () => {
		if (downloading) return
		setDownloading(true)
		const name = [book.title, chapter?.title].filter(Boolean).join(' - ')
		await downloadAudio(url, name)
		setDownloading(false)
	}

	const chapterItems = chapters
		.filter((item) => item.id)
		.map((item, index) => ({
			key: item.id as string,
			label: `${item.chapter_number ?? index + 1}. ${item.title || 'Chapter'}`,
		}))

	return (
		<div className={classes.bar}>
			<button
				type="button"
				className={classes.book}
				onClick={() =>
					onChangeRoute(
						bookReadPath(book.id as string, {
							chapter: chapter?.id,
							mode: 'listen',
						}),
					)
				}
			>
				<div className={classes.cover}>
					{book.cover_image ? (
						<CImage
							src={book.cover_image}
							sizeType={TYPE_SIZE_IMAGE.small}
							alt=""
						/>
					) : null}
				</div>
				<div className={classes.copy}>
					<div className={classes.title}>{book.title}</div>
					{subtitle ? (
						<div className={classes.meta}>{subtitle}</div>
					) : null}
				</div>
			</button>

			<div className={classes.center}>
				<div className={classes.controls}>
					<button
						type="button"
						className={clsx(classes.iconBtn, { [classes.iconActive]: shuffle })}
						onClick={toggleShuffle}
						aria-pressed={shuffle}
						aria-label="Shuffle"
					>
						<IconArrowsShuffle size={18} />
					</button>
					<button
						type="button"
						className={classes.iconBtn}
						onClick={prevChapter}
						aria-label="Previous"
					>
						<IconPlayerSkipBackFilled size={16} />
					</button>
					<button
						type="button"
						className={classes.iconBtn}
						onClick={() => skip(-10)}
						aria-label="Back 10 seconds"
					>
						<IconRewindBackward10 size={22} />
					</button>
					<button
						type="button"
						className={classes.play}
						onClick={toggle}
						aria-label={playing ? 'Pause' : 'Play'}
					>
						{playing ? (
							<IconPlayerPauseFilled size={20} />
						) : (
							<IconPlayerPlayFilled size={20} />
						)}
					</button>
					<button
						type="button"
						className={classes.iconBtn}
						onClick={() => skip(10)}
						aria-label="Forward 10 seconds"
					>
						<IconRewindForward10 size={22} />
					</button>
					<button
						type="button"
						className={classes.iconBtn}
						onClick={nextChapter}
						aria-label="Next"
					>
						<IconPlayerSkipForwardFilled size={16} />
					</button>
					<button
						type="button"
						className={clsx(classes.iconBtn, {
							[classes.iconActive]: repeat !== 'off',
						})}
						onClick={cycleRepeat}
						aria-label={
							repeat === 'one'
								? 'Repeat one chapter'
								: repeat === 'all'
									? 'Repeat all chapters'
									: 'Repeat off'
						}
					>
						{repeat === 'one' ? (
							<IconRepeatOnce size={18} />
						) : (
							<IconRepeat size={18} />
						)}
					</button>
				</div>
				<div className={classes.seek}>
					<span>{formatPlaybackTime(currentTime)}</span>
					<div className={classes.slider}>
						<div
							className={classes.sliderFill}
							style={{ width: `${progress}%` }}
						/>
						<input
							type="range"
							min={0}
							max={duration || 0}
							step={1}
							value={currentTime}
							onChange={(event) => seek(Number(event.target.value))}
						/>
					</div>
					<span>{formatPlaybackTime(duration)}</span>
				</div>
			</div>

			<div className={classes.trailing}>
				<button
					type="button"
					className={clsx(classes.iconBtn, {
						[classes.iconActive]: book.is_favourited,
					})}
					onClick={toggleFavourite}
					disabled={favouritePending}
					aria-pressed={Boolean(book.is_favourited)}
					aria-label={
						book.is_favourited ? 'Remove from favourites' : 'Add to favourites'
					}
				>
					{book.is_favourited ? (
						<IconHeartFilled size={20} />
					) : (
						<IconHeart size={20} stroke={1.5} />
					)}
				</button>
				<button
					type="button"
					className={classes.iconBtn}
					onClick={onDownload}
					disabled={downloading}
					aria-label="Download audio"
				>
					<IconDownload size={20} stroke={1.5} />
				</button>
				<Dropdown
					trigger={['click']}
					placement="topRight"
					disabled={!chapterItems.length}
					menu={{
						items: chapterItems,
						selectable: true,
						selectedKeys: chapter?.id ? [chapter.id] : [],
						onClick: async ({ key }) => {
							const target = chapters.find((item) => item.id === key)
							if (target && !(await selectChapter(target))) {
								toast.info('No audio for this chapter yet')
							}
						},
						style: { maxHeight: 320, overflowY: 'auto' },
					}}
				>
					<button
						type="button"
						className={classes.iconBtn}
						aria-label="Chapter list"
					>
						<IconPlaylist size={20} stroke={1.5} />
					</button>
				</Dropdown>
				<button
					type="button"
					className={classes.speed}
					onClick={cycleSpeed}
				>
					{rate.toFixed(1)}x
				</button>
			</div>
		</div>
	)
}

export default memo(BookMiniPlayer)
