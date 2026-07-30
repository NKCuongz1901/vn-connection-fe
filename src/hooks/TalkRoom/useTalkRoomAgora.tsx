'use client'

import { useCallback, useEffect, useState } from 'react'
import { useJoin, useLocalMicrophoneTrack, usePublish } from 'agora-rtc-react'

import { JoinTalkroomAgora } from '@/apis/talkRoomApis'
import { TALK_ROOM_CONNECTION_TYPE } from '@/Variable/talkRoom.variable'

type UseTalkRoomAgoraProps = {
	agoraIntegration?: JoinTalkroomAgora | null
	enabled?: boolean
}

export default function useTalkRoomAgora({
	agoraIntegration,
	enabled = false,
}: UseTalkRoomAgoraProps) {
	const [isJoined, setIsJoined] = useState(false)
	const [micEnabled, setMicEnabled] = useState(false)

	const canUseAgora =
		enabled &&
		agoraIntegration?.connection_type === TALK_ROOM_CONNECTION_TYPE.AGORA_RTC &&
		!!agoraIntegration?.channel_name &&
		!!agoraIntegration?.agora_token

	useJoin(
		{
			appid: process.env.NEXT_PUBLIC_AGORA_APP_ID!,
			channel: agoraIntegration?.channel_name ?? '',
			token: agoraIntegration?.agora_token ?? '',
			uid: agoraIntegration?.agora_uid,
		},
		canUseAgora && isJoined,
	)

	const { localMicrophoneTrack, error } = useLocalMicrophoneTrack(
		canUseAgora && isJoined && micEnabled,
	)
	useEffect(() => {
		if (localMicrophoneTrack)
			console.log('Mic track ready', localMicrophoneTrack)
		if (error) console.error('Mic error', error)
	}, [localMicrophoneTrack, error])

	useEffect(() => {
		console.log('[Agora debug]', {
			enabled,
			canUseAgora,
			isJoined,
			micEnabled,
			ready: canUseAgora && isJoined && micEnabled,
			agoraIntegration,
			hasTrack: !!localMicrophoneTrack,
			error,
		})
	}, [
		enabled,
		canUseAgora,
		isJoined,
		micEnabled,
		agoraIntegration,
		localMicrophoneTrack,
		error,
	])
	usePublish(canUseAgora && isJoined ? [localMicrophoneTrack] : [])

	const connect = useCallback(async ({ micOn = true } = {}) => {
		setIsJoined(true)
		setMicEnabled(micOn)
	}, [])

	const setMic = useCallback((on: boolean) => {
		setMicEnabled(on)
	}, [])

	const disconnect = useCallback(async () => {
		setMicEnabled(false)
		setIsJoined(false)
		localMicrophoneTrack?.close()
	}, [localMicrophoneTrack])

	return { connect, setMic, disconnect, isAgoraJoined: isJoined }
}
