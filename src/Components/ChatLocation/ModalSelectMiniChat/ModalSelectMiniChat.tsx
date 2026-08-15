'use client'

import { memo } from 'react'

import { formatNumberString } from '@/ultis/string'

import CModal from '@/Components/Custom/CModal/CModal'

import { FullMiniChatItemProps } from '@/interface/Conversation/Conversation.interface'

import classes from './ModalSelectMiniChat.module.scss'

interface ModalSelectMiniChatProps {
	items: FullMiniChatItemProps[]
	loading?: boolean
	onClose: () => void
	onSelect: (item: FullMiniChatItemProps) => void
}

// Render all available mini rooms in a scrollable selection grid.
const ModalSelectMiniChat = (props: ModalSelectMiniChatProps) => {
	const { items, loading, onClose, onSelect } = props

	return (
		<CModal
			closable={false}
			footer={null}
			onCancel={onClose}
			styles={{
				content: {
					width: 704,
					minHeight: 0,
					maxHeight: '70vh',
					padding: 0,
					border: '1px solid #eef3f6',
					borderRadius: 8,
					boxShadow: '-2px 0 12px rgba(0, 13, 25, 0.1)',
				},
				body: {
					minHeight: 0,
					overflow: 'hidden',
				},
			}}
		>
			<div className={classes.header}>Select mini room</div>
			<div className={classes.content}>
				<div className={classes.grid}>
					{loading
						? Array.from({ length: 14 }, (_, index) => (
								<span key={index} className={classes.skeleton} />
							))
						: items.map((item) => (
								<button
									key={item.id}
									type="button"
									className={classes.item}
									aria-label={item.title}
									onClick={() => onSelect(item)}
								>
									<span className={classes.memberCount}>
										{formatNumberString(item.amount_of_user)}
									</span>
									{item.joined && <span className={classes.joinedMark} />}
									<span
										className={classes.avatar}
										role="img"
										aria-label={item.title}
										style={{ backgroundImage: `url(${item.avatar})` }}
									/>
									<span className={classes.info}>
										{!item.is_read && <span className={classes.unreadDot} />}
										<span className={classes.title}>{item.title}</span>
									</span>
								</button>
							))}
				</div>
			</div>
		</CModal>
	)
}

export default memo(ModalSelectMiniChat)
