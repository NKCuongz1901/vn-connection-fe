'use client'

import { IconChevronDown } from '@tabler/icons-react'
import { Flex, Skeleton } from 'antd'
import clsx from 'clsx'
import { memo, useState } from 'react'

import ChatLocationItem, {
	ChatLocationItemVariant,
} from '@/Components/ChatLocation/ChatLocationItem/ChatLocationItem'
import { arrayFrom, isArray } from '@/ultis/array'

import { ChatLocationItemProps as ChatLocationItemData } from '@/interface/Conversation/Conversation.interface'

import classes from './ChatLocationList.module.scss'

export interface ChatLocationListProps {
	title: string
	items: ChatLocationItemData[]
	variant: ChatLocationItemVariant
	loading?: boolean
	defaultExpanded?: boolean
	onItemClick?: (item: ChatLocationItemData) => void
}

// Render a collapsible section of chat location cards.
const ChatLocationList = (props: ChatLocationListProps) => {
	const {
		title,
		items,
		variant,
		loading = false,
		defaultExpanded = true,
		onItemClick,
	} = props
	const [expanded, setExpanded] = useState(defaultExpanded)

	if (!loading && !isArray(items, 1)) return null

	// Toggle the visibility of the location grid.
	const handleToggle = () => {
		setExpanded((current) => !current)
	}

	const _renderSkeleton = () => {
		return arrayFrom(6).map((_, index) => (
			<Flex
				key={index}
				vertical
				className={clsx(classes.skeletonItem, classes[variant])}
			>
				<Skeleton.Input active className={classes.skeletonTitle} />
				<Skeleton.Avatar active className={classes.skeletonAvatar} />
				<Skeleton.Input active className={classes.skeletonMeta} />
			</Flex>
		))
	}

	const _renderList = () => {
		if (loading) return _renderSkeleton()

		return items.map((item) => (
			<ChatLocationItem
				key={item.id}
				item={item}
				variant={variant}
				onClick={onItemClick ? () => onItemClick(item) : undefined}
			/>
		))
	}

	return (
		<section className={classes.wrapper}>
			<button
				type="button"
				className={classes.heading}
				aria-expanded={expanded}
				onClick={handleToggle}
			>
				<span className={classes.title}>{title}</span>
				<span className={classes.counter}>
					{loading ? '...' : items.length}
				</span>
				<IconChevronDown
					size={20}
					stroke={1.5}
					className={clsx(classes.chevron, {
						[classes.chevronCollapsed]: !expanded,
					})}
				/>
			</button>

			{expanded && <div className={classes.list}>{_renderList()}</div>}
		</section>
	)
}

export default memo(ChatLocationList)
