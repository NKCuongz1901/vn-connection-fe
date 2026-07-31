'use client'

import { memo } from 'react'

import { TalkRoomListenerInRoom } from '@/apis/talkRoomApis'
import { HostMicState } from '@/ultis/talkRoom'

import DetailTalkroomListenerEmpty from './DetailTalkroomListenerEmpty'
import DetailTalkroomListenerFooter from './DetailTalkroomListenerFooter'
import DetailTalkroomListenerHeader from './DetailTalkroomListenerHeader'
import DetailTalkroomListenerList from './DetailTalkroomListenerList'
import classes from './DetailTalkroomListenerPanel.module.scss'

type DetailTalkroomListenerPanelProps = {
	isHost?: boolean
	isListener?: boolean
	isSpeaker?: boolean
	listenerCount: number
	listeners?: TalkRoomListenerInRoom[]
	loadingListeners?: boolean
	micState: HostMicState
	beSpeakerState: HostMicState
	onToggleMic?: () => void
	onBeSpeaker?: () => void
	onLeaveRoom?: () => void
	onInvite?: () => void
}

/** Listener section shell: header, empty/list body, and footer actions. */
function DetailTalkroomListenerPanel({
	isHost = false,
	isListener = false,
	isSpeaker = false,
	listenerCount,
	listeners = [],
	loadingListeners = false,
	micState,
	beSpeakerState,
	onToggleMic,
	onBeSpeaker,
	onLeaveRoom,
	onInvite,
}: DetailTalkroomListenerPanelProps) {
	const showEmpty = listeners.length === 0 && !loadingListeners

	return (
		<div className={classes.panel}>
			<DetailTalkroomListenerHeader listenerCount={listenerCount} />
			<div className={classes.body}>
				{showEmpty ? (
					<DetailTalkroomListenerEmpty onInvite={onInvite} />
				) : (
					<DetailTalkroomListenerList
						listeners={listeners}
						loading={loadingListeners}
					/>
				)}
			</div>
			<DetailTalkroomListenerFooter
				isHost={isHost}
				isListener={isListener}
				isSpeaker={isSpeaker}
				micState={micState}
				beSpeakerState={beSpeakerState}
				onToggleMic={onToggleMic}
				onBeSpeaker={onBeSpeaker}
				onLeaveRoom={onLeaveRoom}
			/>
		</div>
	)
}

export default memo(DetailTalkroomListenerPanel)
