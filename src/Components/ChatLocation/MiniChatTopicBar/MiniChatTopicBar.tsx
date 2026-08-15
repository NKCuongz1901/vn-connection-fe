'use client'

import { memo } from 'react'

import HouseIcon from '@/svg/HouseIcon'

import { MiniChatItemProps } from '@/interface/Conversation/Conversation.interface'

import classes from './MiniChatTopicBar.module.scss'

interface MiniChatTopicBarProps {
	items: MiniChatItemProps[]
	loading?: boolean
	onExpand?: () => void
	onSelect?: (item: MiniChatItemProps) => void
}

// Render joined mini chats below a chat-location header.
const MiniChatTopicBar = (props: MiniChatTopicBarProps) => {
	const { items, loading, onExpand, onSelect } = props

	return (
		<div className={classes.wrapper}>
			<div className={classes.list}>
				<button
					type="button"
					className={classes.home}
					aria-label="Chat location"
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
								onClick={() => onSelect?.(item)}
							>
								<span
									className={classes.avatar}
									role="img"
									aria-label={item.title}
									style={{ backgroundImage: `url(${item.avatar})` }}
								/>
								{!item.is_read && <span className={classes.unreadBadge} />}
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
