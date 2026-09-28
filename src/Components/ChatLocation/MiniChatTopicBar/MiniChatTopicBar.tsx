'use client'

import { memo, useCallback, useRef } from 'react'

import HouseIcon from '@/svg/HouseIcon'

import { MiniChatItemProps } from '@/interface/Conversation/Conversation.interface'

import classes from './MiniChatTopicBar.module.scss'

const DRAG_THRESHOLD = 4

interface MiniChatTopicBarProps {
	items: MiniChatItemProps[]
	activeId?: string
	loading?: boolean
	onExpand?: () => void
	onSelectHome?: () => void
	onSelect?: (item: MiniChatItemProps) => void
}

// Render joined mini chats below a chat-location header.
const MiniChatTopicBar = (props: MiniChatTopicBarProps) => {
	const { items, activeId, loading, onExpand, onSelectHome, onSelect } = props
	const dragRef = useRef({
		active: false,
		startX: 0,
		startLeft: 0,
		moved: false,
	})

	/** Starts mouse drag-to-scroll on the topic list. */
	const handlePointerDown = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			if (e.pointerType !== 'mouse') return
			dragRef.current = {
				active: true,
				startX: e.clientX,
				startLeft: e.currentTarget.scrollLeft,
				moved: false,
			}
		},
		[],
	)

	/** Scrolls the list horizontally after the drag threshold. */
	const handlePointerMove = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			const drag = dragRef.current
			if (!drag.active) return
			const dx = e.clientX - drag.startX
			if (!drag.moved && Math.abs(dx) <= DRAG_THRESHOLD) return
			if (!drag.moved) {
				drag.moved = true
				e.currentTarget.setPointerCapture(e.pointerId)
			}
			e.currentTarget.scrollLeft = drag.startLeft - dx
		},
		[],
	)

	/** Ends mouse drag-to-scroll. */
	const handlePointerUp = useCallback(() => {
		dragRef.current.active = false
	}, [])

	/** Prevents selecting a topic after a drag. */
	const handleClickCapture = useCallback((e: React.MouseEvent) => {
		if (!dragRef.current.moved) return
		e.preventDefault()
		e.stopPropagation()
		dragRef.current.moved = false
	}, [])

	return (
		<div className={classes.wrapper}>
			<div
				className={classes.list}
				onPointerDown={handlePointerDown}
				onPointerMove={handlePointerMove}
				onPointerUp={handlePointerUp}
				onPointerCancel={handlePointerUp}
				onClickCapture={handleClickCapture}
			>
				<button
					type="button"
					className={classes.home}
					aria-label="Chat location"
					aria-current={!activeId}
					onClick={onSelectHome}
				>
					<HouseIcon fill="#006B35" />
				</button>

				{loading && items.length === 0
					? [0, 1, 2, 3].map((item) => (
							<span key={item} className={classes.skeleton} />
						))
					: items.map((item) => (
							<button
								key={item.id}
								type="button"
								className={classes.topic}
								title={item.title}
								aria-label={item.title}
								aria-current={item.id === activeId}
								onClick={() => onSelect?.(item)}
							>
								<span
									className={classes.avatar}
									role="img"
									aria-label={item.title}
									style={{ backgroundImage: `url(${item.avatar})` }}
								/>
								{!item.is_read && item.last_message ? (
									<span className={classes.unreadBadge} />
								) : null}
							</button>
						))}
			</div>

			<div className={classes.control}>
				<button
					type="button"
					className={classes.expand}
					aria-label="View all mini chats"
					onClick={onExpand}
				>
					<span className={classes.chevron} />
				</button>
			</div>
		</div>
	)
}

export default memo(MiniChatTopicBar)
