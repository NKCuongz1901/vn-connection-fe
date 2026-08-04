'use client'

import { Spin } from 'antd'
import { memo } from 'react'

import { TalkRoomListenerInRoom } from '@/apis/talkRoomApis'

import DetailTalkroomListenerItem from './DetailTalkroomListenerItem'
import classes from './DetailTalkroomListenerPanel.module.scss'

type DetailTalkroomListenerListProps = {
	listeners: TalkRoomListenerInRoom[]
	loading?: boolean
	onListenerClick?: (userId: string) => void
}

/** Scrollable grid of listeners in the talk room. */
function DetailTalkroomListenerList({
	listeners,
	loading = false,
	onListenerClick,
}: DetailTalkroomListenerListProps) {
	if (loading && listeners.length === 0) {
		return (
			<div className={classes.listLoading}>
				<Spin size="small" />
			</div>
		)
	}

	return (
		<div className={classes.listenerList}>
			{listeners.map((listener) => (
				<DetailTalkroomListenerItem
					key={listener.id || listener.user_id}
					listener={listener}
					onClick={
						onListenerClick && listener.user_id
							? () => onListenerClick(listener.user_id)
							: undefined
					}
				/>
			))}
		</div>
	)
}

export default memo(DetailTalkroomListenerList)
