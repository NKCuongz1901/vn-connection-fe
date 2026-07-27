'use client'

import { memo, useMemo } from 'react'

import { TalkRoomDetail } from '@/apis/talkRoomApis'
import {
	formatTalkRoomStartTime,
	getTalkRoomPreStartTimingDescription,
	getTalkRoomScheduledStartAt,
	isTalkRoomPreStartTimingVisible,
} from '@/ultis/talkRoom'

import PreStartTiming from './PreStartTiming'

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

	if (!showPreStart) return null

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

export default memo(DetailTalkroomTiming)
