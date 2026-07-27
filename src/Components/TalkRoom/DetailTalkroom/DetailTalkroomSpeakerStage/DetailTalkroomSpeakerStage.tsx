'use client'

import { memo, useMemo } from 'react'

import { TalkRoomDetail } from '@/apis/talkRoomApis'
import { buildTalkRoomSpeakerSlots } from '@/ultis/talkRoom'

import DetailTalkroomSpeakerSlot from '../DetailTalkroomSpeakerSlot'
import classes from './DetailTalkroomSpeakerStage.module.scss'

type DetailTalkroomSpeakerStageProps = {
	talkRoomDetail?: TalkRoomDetail | null
	maxSpeakers?: number
}

function DetailTalkroomSpeakerStage({
	talkRoomDetail,
	maxSpeakers = 2,
}: DetailTalkroomSpeakerStageProps) {
	const slots = useMemo(
		() =>
			buildTalkRoomSpeakerSlots(
				talkRoomDetail ?? undefined,
				talkRoomDetail?.max_speakers ?? maxSpeakers,
			),
		[talkRoomDetail, maxSpeakers],
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
