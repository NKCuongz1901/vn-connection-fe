'use client'

import { memo } from 'react'

import HouseIcon from '@/svg/HouseIcon'

import { MiniChatItemProps } from '@/interface/Conversation/Conversation.interface'

import classes from './MiniChatTopicBar.module.scss'

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

	return (
		<div className={classes.wrapper}>
			<div className={classes.list}>
				<button
					type="button"
					className={classes.home}
					aria-label="Chat location"
					aria-current={!activeId}
					onClick={onSelectHome}
				>
					<HouseIcon fill="#006B35" />
				</button>

				{loading
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
