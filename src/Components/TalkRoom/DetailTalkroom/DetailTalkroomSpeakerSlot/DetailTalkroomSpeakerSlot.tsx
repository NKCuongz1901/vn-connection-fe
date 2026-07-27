'use client'

import { IconPlus } from '@tabler/icons-react'
import { memo } from 'react'

import { TalkRoomSpeakerSlot } from '@/ultis/talkRoom'

import classes from './DetailTalkroomSpeakerSlot.module.scss'

type DetailTalkroomSpeakerSlotProps = {
	slot: TalkRoomSpeakerSlot
}

function DetailTalkroomSpeakerSlot({ slot }: DetailTalkroomSpeakerSlotProps) {
	if (slot.type !== 'empty') return null

	return (
		<div className={classes.slot}>
			<div className={classes.emptyAvatar}>
				<IconPlus size={24} stroke={1.5} color="#fff" />
			</div>
			<span className={classes.label}>{slot.label}</span>
		</div>
	)
}

export default memo(DetailTalkroomSpeakerSlot)
