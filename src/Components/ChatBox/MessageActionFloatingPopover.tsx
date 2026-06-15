'use client'

import {
	autoUpdate,
	flip,
	FloatingPortal,
	offset,
	shift,
	useDismiss,
	useFloating,
	useInteractions,
} from '@floating-ui/react'
import { memo, useEffect, useMemo } from 'react'

import MessageActionPopover, {
	MessageActionMenuItem,
} from './MessageActionPopover'

interface ReactionItem {
	id: string
	image_url?: string
}

export interface MessageActionFloatingPopoverProps {
	open: boolean
	anchorX: number
	anchorY: number
	align?: 'start' | 'end'
	reactList: ReactionItem[]
	activeReactionId?: string
	menus: MessageActionMenuItem[]
	onReact: (react: ReactionItem) => void
	onClose: () => void
}

function MessageActionFloatingPopover({
	open,
	anchorX,
	anchorY,
	align = 'end',
	reactList,
	activeReactionId,
	menus,
	onReact,
	onClose,
}: MessageActionFloatingPopoverProps) {
	const virtualReference = useMemo(
		() => ({
			getBoundingClientRect: () => ({
				width: 0,
				height: 0,
				x: anchorX,
				y: anchorY,
				top: anchorY,
				left: anchorX,
				right: anchorX,
				bottom: anchorY,
			}),
		}),
		[anchorX, anchorY],
	)

	const { refs, floatingStyles, context } = useFloating({
		open,
		onOpenChange: (nextOpen) => {
			if (!nextOpen) onClose()
		},
		placement: 'top',
		strategy: 'fixed',
		middleware: [offset(8), flip(), shift({ padding: 8 })],
		whileElementsMounted: autoUpdate,
	})

	useEffect(() => {
		if (open) {
			refs.setPositionReference(virtualReference)
		}
	}, [open, virtualReference, refs])

	const dismiss = useDismiss(context, {
		outsidePressEvent: 'mousedown',
		ancestorScroll: true,
	})

	const { getFloatingProps } = useInteractions([dismiss])

	if (!open) return null

	return (
		<FloatingPortal>
			<div
				ref={refs.setFloating}
				style={{ ...floatingStyles, zIndex: 1050 }}
				{...getFloatingProps()}
			>
				<MessageActionPopover
					align={align}
					reactList={reactList}
					activeReactionId={activeReactionId}
					menus={menus}
					onReact={onReact}
					onClose={onClose}
				/>
			</div>
		</FloatingPortal>
	)
}

export default memo(MessageActionFloatingPopover)
