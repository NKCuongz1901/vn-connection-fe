'use client'

import { memo, useMemo } from 'react'

import { TalkRoomDetail } from '@/apis/talkRoomApis'
import {
	buildTalkRoomSpeakerSlots,
	resolveSpeakerUserId,
	TalkRoomSpeakerStatusMap,
} from '@/ultis/talkRoom'

import DetailTalkroomSpeakerSlot from '../DetailTalkroomSpeakerSlot'
import classes from './DetailTalkroomSpeakerStage.module.scss'

type DetailTalkroomSpeakerStageProps = {
	talkRoomDetail?: TalkRoomDetail | null
	maxSpeakers?: number
	speakerStatusMap?: TalkRoomSpeakerStatusMap
	isHost?: boolean
	totalRaiseHand?: number
	onSpeakerSlotClick?: (userId?: string, isHostSlot?: boolean) => void
	onEmptySlotClick?: () => void
}

function DetailTalkroomSpeakerStage({
	talkRoomDetail,
	maxSpeakers = 2,
	speakerStatusMap,
	isHost = false,
	totalRaiseHand = 0,
	onSpeakerSlotClick,
	onEmptySlotClick,
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
					totalRaiseHand={slot.type === 'empty' ? totalRaiseHand : 0}
					onClick={
						slot.type === 'filled' && onSpeakerSlotClick
							? () =>
									onSpeakerSlotClick(
										resolveSpeakerUserId(slot.speaker),
										slot.isHost,
									)
							: slot.type === 'empty' && isHost && onEmptySlotClick
								? onEmptySlotClick
								: undefined
					}
				/>
			))}
		</div>
	)
}

export default memo(DetailTalkroomSpeakerStage)
