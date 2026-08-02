'use client'

import { memo, useMemo } from 'react'

import { TalkRoomDetail } from '@/apis/talkRoomApis'
import { buildTalkRoomSpeakerSlots, TalkRoomSpeakerStatusMap } from '@/ultis/talkRoom'

import DetailTalkroomSpeakerSlot from '../DetailTalkroomSpeakerSlot'
import classes from './DetailTalkroomSpeakerStage.module.scss'

type DetailTalkroomSpeakerStageProps = {
	talkRoomDetail?: TalkRoomDetail | null
	maxSpeakers?: number
	speakerStatusMap?: TalkRoomSpeakerStatusMap
}

function DetailTalkroomSpeakerStage({
	talkRoomDetail,
	maxSpeakers = 2,
	speakerStatusMap,
}: DetailTalkroomSpeakerStageProps) {
	const slots = useMemo(
		() =>
			buildTalkRoomSpeakerSlots(
				talkRoomDetail ?? undefined,
				talkRoomDetail?.max_speakers ?? maxSpeakers,
				speakerStatusMap,
			),
		[talkRoomDetail, maxSpeakers, speakerStatusMap],
	)

	return (
		<div className={classes.stage}>
			{slots.map((slot) => (
				<DetailTalkroomSpeakerSlot key={slot.key} slot={slot} />
			))}
		</div>
	)
}

export default memo(DetailTalkroomSpeakerStage)
