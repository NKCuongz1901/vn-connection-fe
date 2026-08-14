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
	hasGuestSpeaker?: boolean
	totalParticipants?: number
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
	hasGuestSpeaker = false,
	totalParticipants = 0,
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
	const noListener = listeners.length === 0 && !loadingListeners
	// Invite CTA only while the room still waits for a second person to join.
	const showEmpty = noListener && !hasGuestSpeaker && totalParticipants < 2
	// Room detail count can update before the listener rows arrive (e.g. after a step down).
	const awaitingListeners = noListener && !showEmpty && listenerCount > 0

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
				) : noListener && !awaitingListeners ? null : (
					<DetailTalkroomListenerList
						listeners={listeners}
						raiseHandUserIds={raiseHandUserIds}
						loading={loadingListeners || awaitingListeners}
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
