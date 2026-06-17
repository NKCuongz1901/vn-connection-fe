import clsx from 'clsx'
import { memo, MouseEvent, ReactNode } from 'react'

import CImage from '@/Components/Custom/CImage/CImage'
import CopyIcon from '@/svg/ChatBox/CopyIcon'
import EditIcon from '@/svg/ChatBox/EditIcon'
import ReplyIcon from '@/svg/ChatBox/ReplyIcon'
import PinIcon from '@/svg/PinIcon'
import TrashIcon from '@/svg/TrashIcon'

import classes from './MessageActionPopover.module.scss'

interface ReactionItem {
	id: string
	image_url?: string
}

export interface MessageActionMenuItem {
	key: string
	label: string
	style?: React.CSSProperties
	onClick?: () => void
}

const MENU_ICON_SIZE = 24

const getMenuIcon = (key: string, isDanger: boolean): ReactNode => {
	const fill = isDanger ? '#cd3031' : '#0f1729'
	const iconProps = {
		width: MENU_ICON_SIZE,
		height: MENU_ICON_SIZE,
		fill,
	}

	switch (String(key).toUpperCase()) {
		case 'EDIT':
			return <EditIcon {...iconProps} />
		case 'REPLY':
			return <ReplyIcon {...iconProps} />
		case 'COPY':
			return <CopyIcon {...iconProps} />
		case 'PIN':
		case 'UNPIN':
			return <PinIcon fill={fill} />
		case 'DELETE':
			return <TrashIcon {...iconProps} />
		default:
			return null
	}
}

interface MessageActionPopoverProps {
	className?: string
	align?: 'start' | 'end'
	reactList: ReactionItem[]
	activeReactionId?: string
	menus: MessageActionMenuItem[]
	onReact: (react: ReactionItem) => void
	onClose?: () => void
}

const MessageActionPopover = ({
	className,
	align = 'end',
	reactList,
	activeReactionId,
	menus,
	onReact,
	onClose,
}: MessageActionPopoverProps) => {
	const stopPropagation = (e: MouseEvent) => {
		e.stopPropagation()
	}

	const handlePopoverClick = (e: MouseEvent) => {
		e.stopPropagation()
		onClose?.()
	}

	return (
		<div
			className={clsx(
				classes.popover,
				align === 'end' ? classes.alignEnd : classes.alignStart,
				className,
			)}
			onClick={handlePopoverClick}
			onMouseDown={stopPropagation}
		>
			{!!reactList?.length && (
				<div className={classes.reactionBar} onClick={stopPropagation}>
					<div className={classes.reactionList}>
						{reactList.map((react) => {
							const isActive = activeReactionId === react.id
							return (
								<div
									key={react.id}
									className={clsx(classes.reactionItem, {
										[classes.reactionItemActive]: isActive,
									})}
									onClick={() => onReact(react)}
								>
									<div className={classes.reactionIcon}>
										<CImage src={react.image_url} alt="" preview={false} />
									</div>
								</div>
							)
						})}
					</div>
				</div>
			)}

			{!!menus?.length && (
				<div className={classes.menu} onClick={stopPropagation}>
					{menus.map((menu) => {
						const isDanger =
							menu?.key === 'DELETE' ||
							(typeof menu?.style === 'object' &&
								menu.style?.color === '#F80024')
						const icon = getMenuIcon(menu.key, isDanger)

						return (
							<div
								key={String(menu.key)}
								className={clsx(classes.menuItem, {
									[classes.menuItemDanger]: isDanger,
								})}
								style={isDanger ? undefined : menu.style}
								onClick={() => {
									menu.onClick?.()
									onClose?.()
								}}
							>
								{icon && (
									<span className={classes.menuItemIcon}>{icon}</span>
								)}
								<span className={classes.menuItemLabel}>{menu.label}</span>
							</div>
						)
					})}
				</div>
			)}
		</div>
	)
}

export default memo(MessageActionPopover)
