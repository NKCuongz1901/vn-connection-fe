import { IconEdit } from '@tabler/icons-react'
import { Flex, Skeleton } from 'antd'
import { memo } from 'react'

import {
	QuickMessageItem,
} from '@/hooks/QuickMesage/useQuickMessage'

import BookIcon from '@/svg/BookIcon'
import NoQuickMessage from '@/svg/NoQuickMessage'

import CImage from '@/Components/Custom/CImage/CImage'

import {
	formatShortcutLabel,
	getQuickMessageMediaUrl,
} from './quickMessageUtils'
import classes from './QuickMessageModal.module.scss'

interface QuickMessageGuideBannerProps {
	className?: string
}

export const QuickMessageGuideBanner = memo(function QuickMessageGuideBanner({
	className,
}: QuickMessageGuideBannerProps) {
	return (
		<div className={className || classes.guide}>
			<div className={classes.guideBox}>
				<div className={classes.guideIcon}>
					<BookIcon fill="#006B35" />
				</div>
				<p className={classes.guideText}>
					Type &apos;/&apos; in the prefix message to quickly select a message
					you&apos;ve created.
				</p>
			</div>
		</div>
	)
})

interface QuickMessageListItemProps {
	item: QuickMessageItem
	mode?: 'pick' | 'manage'
	onClick?: () => void
	onEdit?: () => void
	showDivider?: boolean
}

export const QuickMessageListItem = memo(function QuickMessageListItem({
	item,
	mode = 'pick',
	onClick,
	onEdit,
	showDivider = true,
}: QuickMessageListItemProps) {
	const mediaUrl = getQuickMessageMediaUrl(item)

	return (
		<>
			<div
				className={classes.listItem}
				onClick={mode === 'pick' ? onClick : undefined}
			>
				<div className={classes.listItemText}>
					<span className={classes.shortcutTag}>
						{formatShortcutLabel(item.shortcut)}
					</span>
					<span className={classes.contentText}>{item.content}</span>
				</div>
				{mediaUrl &&
					(mode === 'manage' ? (
						<div
							className={classes.manageThumb}
							onClick={(e) => {
								e.stopPropagation()
								onEdit?.()
							}}
						>
							<CImage src={mediaUrl} alt="" preview={false} />
							<div className={classes.manageOverlay}>
								<IconEdit size={20} />
							</div>
						</div>
					) : (
						<div className={classes.thumbnail}>
							<CImage src={mediaUrl} alt="" preview={false} />
						</div>
					))}
			</div>
			{showDivider && <div className={classes.divider} />}
		</>
	)
})

interface QuickMessageEmptyStateProps {
	onCreate: () => void
}

export const QuickMessageEmptyState = memo(function QuickMessageEmptyState({
	onCreate,
}: QuickMessageEmptyStateProps) {
	return (
		<div className={classes.emptyState}>
			<div className={classes.emptyIcon}>
				<NoQuickMessage width={120} height={120} />
			</div>
			<Flex vertical gap={4} align="center">
				<p className={classes.emptyTitle}>No quick messages</p>
				<p className={classes.emptyDesc}>Create quick messages to save time.</p>
			</Flex>
			<button
				type="button"
				className={`${classes.footerBtn} ${classes.footerBtnOrange}`}
				style={{ flex: 'unset', minWidth: 120, minHeight: 40 }}
				onClick={onCreate}
			>
				Create
			</button>
		</div>
	)
})

interface QuickMessageListContentProps {
	list: QuickMessageItem[]
	loading: boolean
	mode?: 'pick' | 'manage'
	showGuide?: boolean
	onScroll?: (e: any) => void
	onSelect?: (item: QuickMessageItem) => void
	onEdit?: (item: QuickMessageItem) => void
	onCreate?: () => void
}

function QuickMessageListContent({
	list,
	loading,
	mode = 'pick',
	showGuide = true,
	onScroll,
	onSelect,
	onEdit,
	onCreate,
}: QuickMessageListContentProps) {
	const isEmpty = !loading && list.length === 0

	return (
		<div className={classes.listContainer} onScroll={onScroll}>
			{showGuide && <QuickMessageGuideBanner />}
			{loading && list.length === 0 ? (
				<div className={classes.loadingWrap}>
					<Skeleton active paragraph={{ rows: 4 }} />
				</div>
			) : isEmpty ? (
				<QuickMessageEmptyState onCreate={onCreate!} />
			) : (
				list.map((item, index) => (
					<QuickMessageListItem
						key={item.id}
						item={item}
						mode={mode}
						showDivider={index < list.length - 1}
						onClick={() => onSelect?.(item)}
						onEdit={() => onEdit?.(item)}
					/>
				))
			)}
		</div>
	)
}

export default memo(QuickMessageListContent)
