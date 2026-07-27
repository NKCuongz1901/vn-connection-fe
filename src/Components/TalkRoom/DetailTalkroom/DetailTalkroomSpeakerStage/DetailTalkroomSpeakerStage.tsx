'use client'

import { memo, useMemo } from 'react'

import { buildEmptyTalkRoomSpeakerSlots } from '@/ultis/talkRoom'

import DetailTalkroomSpeakerSlot from '../DetailTalkroomSpeakerSlot'
import classes from './DetailTalkroomSpeakerStage.module.scss'

type DetailTalkroomSpeakerStageProps = {
	maxSpeakers?: number
}

function DetailTalkroomSpeakerStage({
	maxSpeakers = 2,
}: DetailTalkroomSpeakerStageProps) {
	const slots = useMemo(
		() => buildEmptyTalkRoomSpeakerSlots(maxSpeakers),
		[maxSpeakers],
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
