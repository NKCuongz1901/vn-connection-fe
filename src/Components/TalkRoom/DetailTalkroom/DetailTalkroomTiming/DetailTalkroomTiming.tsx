'use client'

import { memo, useMemo } from 'react'

import { TalkRoomDetail } from '@/apis/talkRoomApis'
import {
	formatTalkRoomStartTime,
	getTalkRoomCountWaitingSecondsLeft,
	getTalkRoomPreStartTimingDescription,
	getTalkRoomScheduledStartAt,
	isTalkRoomCountWaitingVisible,
	isTalkRoomPreStartTimingVisible,
} from '@/ultis/talkRoom'

import PreStartTiming from './PreStartTiming'
import WaitingTiming from './WaitingTiming'

type DetailTalkroomTimingProps = {
	talkRoomDetail?: TalkRoomDetail | null
}

/** Renders the in-room timing banner based on the current talk room phase. */
function DetailTalkroomTiming({ talkRoomDetail }: DetailTalkroomTimingProps) {
	const scheduledAt = useMemo(
		() => getTalkRoomScheduledStartAt(talkRoomDetail ?? undefined),
		[talkRoomDetail],
	)

	const showPreStart = isTalkRoomPreStartTimingVisible(
		talkRoomDetail ?? undefined,
	)
	const showCountWaiting = isTalkRoomCountWaitingVisible(
		talkRoomDetail ?? undefined,
	)

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

		return <WaitingTiming secondsLeft={waitingSeconds} />
	}

	return null
}

export default memo(DetailTalkroomTiming)
