'use client'

import { memo, useMemo } from 'react'

import { TalkRoomDetail } from '@/apis/talkRoomApis'
import {
	formatTalkRoomStartTime,
	getTalkRoomCountRoomLiveSecondsLeft,
	getTalkRoomCountWaitingSecondsLeft,
	getTalkRoomPreStartTimingDescription,
	getTalkRoomScheduledStartAt,
	isTalkRoomCountRoomLiveVisible,
	isTalkRoomCountSessionEndVisible,
	isTalkRoomCountWaitingVisible,
	isTalkRoomPreStartTimingVisible,
	RoomEndStatus,
} from '@/ultis/talkRoom'

import LiveTiming from './LiveTiming'
import PreStartTiming from './PreStartTiming'
import SessionEndTiming from './SessionEndTiming'
import WaitingTiming from './WaitingTiming'

type DetailTalkroomTimingProps = {
	talkRoomDetail?: TalkRoomDetail | null
	roomEndStatus?: RoomEndStatus
	sessionEndStartedAtMs?: number | null
	onLiveTimeUp?: () => void
	onSessionEndTimeUp?: () => void
	onWaitingTimeUp?: () => void
}

/** Renders the in-room timing banner based on the current talk room phase. */
function DetailTalkroomTiming({
	talkRoomDetail,
	roomEndStatus = 'none',
	sessionEndStartedAtMs = null,
	onLiveTimeUp,
	onSessionEndTimeUp,
	onWaitingTimeUp,
}: DetailTalkroomTimingProps) {
	const scheduledAt = useMemo(
		() => getTalkRoomScheduledStartAt(talkRoomDetail ?? undefined),
		[talkRoomDetail],
	)

	const showSessionEnd = isTalkRoomCountSessionEndVisible(roomEndStatus)

	if (showSessionEnd && sessionEndStartedAtMs) {
		return (
			<SessionEndTiming
				sessionEndStartedAtMs={sessionEndStartedAtMs}
				onTimeUp={onSessionEndTimeUp}
			/>
		)
	}

	const showPreStart = isTalkRoomPreStartTimingVisible(
		talkRoomDetail ?? undefined,
	)
	const showCountWaiting = isTalkRoomCountWaitingVisible(
		talkRoomDetail ?? undefined,
	)
	const showCountRoomLive =
		roomEndStatus === 'none' &&
		isTalkRoomCountRoomLiveVisible(talkRoomDetail ?? undefined)

	if (showPreStart) {
		const startTimeLabel = formatTalkRoomStartTime(scheduledAt)
		const description = getTalkRoomPreStartTimingDescription(scheduledAt)

		if (!startTimeLabel) return null

		return (
			<PreStartTiming
				startTimeLabel={startTimeLabel}
				description={description}
			/>
		)
	}

	if (showCountWaiting) {
		const waitingSeconds = getTalkRoomCountWaitingSecondsLeft(
			talkRoomDetail ?? undefined,
		)

		return <WaitingTiming secondsLeft={waitingSeconds} onTimeUp={onWaitingTimeUp} />
	}

	if (showCountRoomLive) {
		const liveSeconds = getTalkRoomCountRoomLiveSecondsLeft(
			talkRoomDetail ?? undefined,
		)

		return <LiveTiming secondsLeft={liveSeconds} onTimeUp={onLiveTimeUp} />
	}

	return null
}

export default memo(DetailTalkroomTiming)
