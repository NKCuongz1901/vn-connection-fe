'use client'

import { IconCircleXFilled, IconEdit } from '@tabler/icons-react'
import { Popover } from 'antd'
import { memo, useCallback, useState } from 'react'

import PencilIcon from '@/svg/Hangout/PencilIcon'

import MoreIcon from '@/svg/MoreIcon'
import { TalkRoomRoom } from '@/ultis/talkRoom'

import classes from './RoomCardHostActions.module.scss'

export type RoomCardHostActionsProps = {
	room: TalkRoomRoom
	onEditRoom?: (room: TalkRoomRoom) => void
	onCancelRoom?: (room: TalkRoomRoom) => void
}

function RoomCardHostActions({
	room,
	onEditRoom,
	onCancelRoom,
}: RoomCardHostActionsProps) {
	const [open, setOpen] = useState(false)

	const handleOpenChange = useCallback((nextOpen: boolean) => {
		setOpen(nextOpen)
	}, [])

	const handleEdit = useCallback(
		(event: React.MouseEvent) => {
			event.stopPropagation()
			onEditRoom?.(room)
			setOpen(false)
		},
		[onEditRoom, room],
	)

	const handleCancel = useCallback(
		(event: React.MouseEvent) => {
			event.stopPropagation()
			onCancelRoom?.(room)
			setOpen(false)
		},
		[onCancelRoom, room],
	)

	const panelContent = (
		<div className={classes.panel}>
			<button type="button" className={classes.item} onClick={handleEdit}>
				<span className={classes.iconWrap}>
					<PencilIcon fill="#48546B" width={24} height={24} />
				</span>
				<span className={classes.label}>Edit room</span>
			</button>
			<button type="button" className={classes.item} onClick={handleCancel}>
				<span className={classes.iconWrap}>
					<IconCircleXFilled size={24} color="#48546B" />
				</span>
				<span className={classes.label}>Cancel room</span>
			</button>
		</div>
	)

	return (
		<Popover
			trigger="click"
			placement="bottomRight"
			open={open}
			onOpenChange={handleOpenChange}
			overlayClassName={classes.hostActionsPopover}
			arrow={false}
			content={panelContent}
		>
			<button
				type="button"
				className={classes.moreBtn}
				aria-label="More actions"
				onClick={(event) => event.stopPropagation()}
			>
				<MoreIcon fill="#0F1729" width={16} height={16} />
			</button>
		</Popover>
	)
}

export default memo(RoomCardHostActions)
