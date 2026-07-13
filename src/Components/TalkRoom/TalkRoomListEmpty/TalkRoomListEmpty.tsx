'use client'

import { memo } from 'react'

import NotFound from '@/svg/NotFound'

import classes from './TalkRoomListEmpty.module.scss'

export type TalkRoomListEmptyVariant = 'empty' | 'search'

interface TalkRoomListEmptyProps {
	variant: TalkRoomListEmptyVariant
	onCreateRoom?: () => void
}

/** Empty state for talk room list: no rooms or no search results. */
const TalkRoomListEmpty = ({ variant, onCreateRoom }: TalkRoomListEmptyProps) => {
	if (variant === 'search') {
		return (
			<div className={classes.wrapper}>
				<div className={classes.searchIllustration}>
					<NotFound />
				</div>
				<div className={classes.searchTitle}>No results found</div>
				<div className={classes.searchSubtitle}>Try another keywords</div>
			</div>
		)
	}

	return (
		<div
			className={classes.emptyWrapper}
			role={onCreateRoom ? 'button' : undefined}
			tabIndex={onCreateRoom ? 0 : undefined}
			onClick={onCreateRoom}
			onKeyDown={(event) => {
				if (!onCreateRoom) return
				if (event.key === 'Enter' || event.key === ' ') {
					event.preventDefault()
					onCreateRoom()
				}
			}}
		>
			<img
				src="/images/emptyRoom.png"
				alt=""
				className={classes.emptyImage}
			/>
			<span className={classes.emptyLabel}>Start a Talk Room</span>
		</div>
	)
}

export default memo(TalkRoomListEmpty)
