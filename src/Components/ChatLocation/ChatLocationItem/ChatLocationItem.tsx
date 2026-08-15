'use client'

import { Flex } from 'antd'
import clsx from 'clsx'
import { memo } from 'react'

import { getDiffFromNow } from '@/ultis/date'
import { formatNumberString } from '@/ultis/string'

import CAvatar from '@/Components/Custom/CAvatar'
import GlobalIcon from '@/svg/GlobalIcon'

import { ChatLocationItemProps as ChatLocationItemData } from '@/interface/Conversation/Conversation.interface'

import classes from './ChatLocationItem.module.scss'

export type ChatLocationItemVariant = 'activeChatLocation' | 'myChatLocation'

interface ChatLocationItemProps {
	item: ChatLocationItemData
	variant: ChatLocationItemVariant
	onClick?: () => void
}

const ChatLocationItem = (props: ChatLocationItemProps) => {
	const { item, variant, onClick } = props
	const {
		id,
		title,
		avatars = [],
		amount_of_user,
		amount_of_user_online,
		last_message,
		created_at,
	} = item
	const visibleAvatars = avatars.slice(0, 3)
	const moreCount = Math.max(amount_of_user - visibleAvatars.length, 0)
	const lastMessageAt = last_message?.created_at || created_at
	const { value: timeAgo, unit } = lastMessageAt
		? getDiffFromNow({ input: lastMessageAt })
		: { value: '', unit: '' }

	return (
		<Flex
			vertical
			className={clsx(classes.wrapper, classes[variant])}
			onClick={onClick}
		>
			<Flex className={classes.title}>
				<span className={classes.icon}>
					<GlobalIcon fill="#006b35" width={12} height={12} />
				</span>
				<span className={classes.name}>{title}</span>
			</Flex>

			<Flex className={classes.members}>
				<Flex className={classes.avatarStack}>
					{visibleAvatars.map((src, index) => (
						<div key={`${id}-avatar-${index}`} className={classes.avatar}>
							<CAvatar src={src} size={24} />
						</div>
					))}
				</Flex>
				{moreCount > 0 && (
					<span className={classes.more}>+{formatNumberString(moreCount)}</span>
				)}
			</Flex>

			<Flex vertical className={classes.meta}>
				<Flex className={classes.online}>
					<span className={classes.onlineDot} />
					<span>{formatNumberString(amount_of_user_online)} online</span>
				</Flex>
				{lastMessageAt && (
					<span className={classes.time}>
						{timeAgo}
						{unit ? ` ${unit}s ago` : ''}
					</span>
				)}
			</Flex>
		</Flex>
	)
}

export default memo(ChatLocationItem)
