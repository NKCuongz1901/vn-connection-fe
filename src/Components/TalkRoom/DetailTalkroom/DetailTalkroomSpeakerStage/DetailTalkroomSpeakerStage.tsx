'use client'

import { memo, useMemo } from 'react'

import { TalkRoomDetail } from '@/apis/talkRoomApis'
import { buildTalkRoomSpeakerSlots, resolveSpeakerUserId, TalkRoomSpeakerStatusMap } from '@/ultis/talkRoom'

import DetailTalkroomSpeakerSlot from '../DetailTalkroomSpeakerSlot'
import classes from './DetailTalkroomSpeakerStage.module.scss'

type DetailTalkroomSpeakerStageProps = {
	talkRoomDetail?: TalkRoomDetail | null
	maxSpeakers?: number
	speakerStatusMap?: TalkRoomSpeakerStatusMap
	onSpeakerSlotClick?: (userId?: string, isHostSlot?: boolean) => void
}

function DetailTalkroomSpeakerStage({
	talkRoomDetail,
	maxSpeakers = 2,
	speakerStatusMap,
	onSpeakerSlotClick,
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
				<DetailTalkroomSpeakerSlot
					key={slot.key}
					slot={slot}
					onClick={
						onSpeakerSlotClick && slot.type === 'filled'
							? () =>
									onSpeakerSlotClick(
										resolveSpeakerUserId(slot.speaker),
										slot.isHost,
									)
							: undefined
					}
				/>
			))}
		</div>
	)
}

export default memo(DetailTalkroomSpeakerStage)
