'use client'

import { useCallback, useEffect, useState } from 'react'
import {
	useJoin,
	useLocalMicrophoneTrack,
	usePublish,
	useRemoteAudioTracks,
	useRemoteUsers,
} from 'agora-rtc-react'

import { JoinTalkroomAgora } from '@/apis/talkRoomApis'
import { TALK_ROOM_CONNECTION_TYPE } from '@/Variable/talkRoom.variable'

type ConnectOptions = {
	micOn?: boolean
	integration?: JoinTalkroomAgora | null
}

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
	const [activeIntegration, setActiveIntegration] =
		useState<JoinTalkroomAgora | null>(agoraIntegration ?? null)

	useEffect(() => {
		if (isJoined) return
		if (agoraIntegration) {
			setActiveIntegration(agoraIntegration)
		}
	}, [agoraIntegration, isJoined])

	const canUseAgora =
		enabled &&
		activeIntegration?.connection_type === TALK_ROOM_CONNECTION_TYPE.AGORA_RTC &&
		!!activeIntegration?.channel_name &&
		!!activeIntegration?.agora_token

	const isAgoraActive = canUseAgora && isJoined

	useJoin(
		{
			appid: process.env.NEXT_PUBLIC_AGORA_APP_ID!,
			channel: activeIntegration?.channel_name ?? '',
			token: activeIntegration?.agora_token ?? '',
			uid: activeIntegration?.agora_uid,
		},
		isAgoraActive,
	)

	// Keep the mic track while joined; on/off = setMuted (mobile muteLocalAudioStream).
	const { localMicrophoneTrack, error } = useLocalMicrophoneTrack(isAgoraActive)

	const remoteUsers = useRemoteUsers()
	const { audioTracks, error: remoteAudioError } = useRemoteAudioTracks(
		isAgoraActive ? remoteUsers : [],
	)

	useEffect(() => {
		if (!localMicrophoneTrack) return

		let cancelled = false

		const applyMute = async () => {
			try {
				await localMicrophoneTrack.setMuted(!micEnabled)
			} catch (muteError) {
				if (!cancelled) {
					console.error('Failed to mute local mic', muteError)
				}
			}
		}

		void applyMute()

		return () => {
			cancelled = true
		}
	}, [localMicrophoneTrack, micEnabled])

	useEffect(() => {
		if (!isAgoraActive) return

		audioTracks.forEach((track) => {
			try {
				track.play()
			} catch (playError) {
				console.error('Failed to play remote audio track', playError)
			}
		})

		return () => {
			audioTracks.forEach((track) => {
				track.stop()
			})
		}
	}, [audioTracks, isAgoraActive])

	useEffect(() => {
		if (error) console.error('Local mic error', error)
		if (remoteAudioError) console.error('Remote audio error', remoteAudioError)
	}, [error, remoteAudioError])

	usePublish(
		isAgoraActive && localMicrophoneTrack ? [localMicrophoneTrack] : [],
	)

	const connect = useCallback(async ({ micOn = true, integration }: ConnectOptions = {}) => {
		if (integration) {
			setActiveIntegration(integration)
		}

		setIsJoined(true)
		setMicEnabled(micOn)
	}, [])

	const setMic = useCallback((on: boolean) => {
		setMicEnabled(on)
	}, [])

	const disconnect = useCallback(async () => {
		setMicEnabled(false)
		setIsJoined(false)
		try {
			localMicrophoneTrack?.close()
		} catch {
			// Track may already be closed by useLocalMicrophoneTrack.
		}
	}, [localMicrophoneTrack])

	return { connect, setMic, disconnect, isAgoraJoined: isJoined, micEnabled }
}
