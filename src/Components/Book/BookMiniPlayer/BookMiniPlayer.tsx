'use client'

import { memo } from 'react'

import {
	IconPlayerPauseFilled,
	IconPlayerPlayFilled,
	IconPlayerSkipBackFilled,
	IconPlayerSkipForwardFilled,
	IconRewindBackward10,
	IconRewindForward10,
} from '@tabler/icons-react'

import CImage from '@/Components/Custom/CImage/CImage'
import { useBookPlayer } from '@/context/BookPlayerContext'
import { TYPE_SIZE_IMAGE } from '@/Variable/image.variable'
import { useLocalePath } from '@/ultis/route'
import {
	PLAYBACK_SPEEDS,
	bookReadPath,
	formatPlaybackTime,
} from '@/Variable/book.variable'

import classes from './BookMiniPlayer.module.scss'

function BookMiniPlayer() {
	const { onChangeRoute } = useLocalePath()
	const {
		url,
		book,
		chapter,
		playing,
		currentTime,
		duration,
		rate,
		toggle,
		seek,
		skip,
		setRate,
		prevChapter,
		nextChapter,
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
						className={classes.iconBtn}
						onClick={prevChapter}
						aria-label="Previous chapter"
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
						aria-label="Next chapter"
					>
						<IconPlayerSkipForwardFilled size={16} />
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

			<button
				type="button"
				className={classes.speed}
				onClick={cycleSpeed}
			>
				{rate.toFixed(1)}x
			</button>
		</div>
	)
}

export default memo(BookMiniPlayer)
