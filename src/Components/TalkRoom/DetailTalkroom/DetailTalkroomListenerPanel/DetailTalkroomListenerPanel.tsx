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
	isRoomLiving?: boolean
	listenerCount: number
	listeners?: TalkRoomListenerInRoom[]
	raiseHandUserIds?: string[]
	isFilterRaiseHand?: boolean
	loadingListeners?: boolean
	micState: HostMicState
	beSpeakerState: HostMicState
	hasRaiseHand?: boolean
	onToggleMic?: () => void
	onBeSpeaker?: () => void
	onLeaveRoom?: () => void
	onInvite?: () => void
	onListenerClick?: (userId: string) => void
	onCloseFilterRaiseHand?: () => void
}

/** Listener section shell: header, empty/list body, and footer actions. */
function DetailTalkroomListenerPanel({
	isHost = false,
	isListener = false,
	isSpeaker = false,
	isRoomLiving = true,
	listenerCount,
	listeners = [],
	raiseHandUserIds = [],
	isFilterRaiseHand = false,
	loadingListeners = false,
	micState,
	beSpeakerState,
	hasRaiseHand = false,
	onToggleMic,
	onBeSpeaker,
	onLeaveRoom,
	onInvite,
	onListenerClick,
	onCloseFilterRaiseHand,
}: DetailTalkroomListenerPanelProps) {
	const showEmpty = listeners.length === 0 && !loadingListeners

	return (
		<div className={classes.panel}>
			<DetailTalkroomListenerHeader
				listenerCount={listenerCount}
				isFilterRaiseHand={isFilterRaiseHand}
				onCloseFilterRaiseHand={onCloseFilterRaiseHand}
			/>
			<div className={classes.body}>
				{showEmpty ? (
					<DetailTalkroomListenerEmpty onInvite={onInvite} />
				) : (
					<DetailTalkroomListenerList
						listeners={listeners}
						raiseHandUserIds={raiseHandUserIds}
						loading={loadingListeners}
						onListenerClick={onListenerClick}
					/>
				)}
			</div>
			<DetailTalkroomListenerFooter
				isHost={isHost}
				isListener={isListener}
				isSpeaker={isSpeaker}
				isRoomLiving={isRoomLiving}
				micState={micState}
				beSpeakerState={beSpeakerState}
				hasRaiseHand={hasRaiseHand}
				onToggleMic={onToggleMic}
				onBeSpeaker={onBeSpeaker}
				onLeaveRoom={onLeaveRoom}
			/>
		</div>
	)
}

export default memo(DetailTalkroomListenerPanel)
