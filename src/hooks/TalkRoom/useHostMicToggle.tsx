'use client'

import { useCallback, useMemo } from 'react'

import { TalkRoomDetail, toogleMic } from '@/apis/talkRoomApis'
import { mainRoutes } from '@/routes/MainRoutes'
import { getHostMicState, HostMicState } from '@/ultis/talkRoom'

type UseHostMicToggleProps = {
	roomId: string
	talkRoomDetail?: TalkRoomDetail | null
	isHost?: boolean
	onGetDetailTalkRoom: (roomId?: string) => Promise<TalkRoomDetail | null>
	onLeaveRoom: () => Promise<void>
	onChangeRoute: (path: string) => void
	onMicOn?: () => void | Promise<void>
	onMicOff?: () => void
}

/** Host mic toggle, invite share, and leave room actions for in-room detail. */
export default function useHostMicToggle({
	roomId,
	talkRoomDetail,
	isHost = false,
	onGetDetailTalkRoom,
	onLeaveRoom,
	onChangeRoute,
	onMicOn,
	onMicOff,
}: UseHostMicToggleProps) {
	const micState = useMemo(
		() => getHostMicState(talkRoomDetail ?? undefined, { isHost }),
		[talkRoomDetail, isHost],
	)

	const handleToggleMic = useCallback(async () => {
		if (!roomId || micState === 'disabled') return

		const nextIsOn = micState === 'off'

		try {
			await toogleMic({
				id: roomId,
				payload: { is_on: nextIsOn },
			})
			if (nextIsOn) {
				await onMicOn?.()
			} else {
				onMicOff?.()
			}

			await onGetDetailTalkRoom(roomId)
		} catch (error) {
			console.error('Failed to toggle mic', error)
		}
	}, [roomId, micState, onGetDetailTalkRoom, onMicOn, onMicOff])

	const handleInvite = useCallback(() => {
		const dynamicLink = talkRoomDetail?.dynamic_link
		if (!dynamicLink) return

		if (navigator.share) {
			navigator.share({ url: dynamicLink }).catch(() => undefined)
			return
		}

		navigator.clipboard?.writeText(dynamicLink)
	}, [talkRoomDetail?.dynamic_link])

	const handleLeave = useCallback(async () => {
		await onLeaveRoom()
		onChangeRoute(mainRoutes.talkroom)
	}, [onLeaveRoom, onChangeRoute])

	return {
		micState: micState as HostMicState,
		onToggleMic: handleToggleMic,
		onInvite: handleInvite,
		onLeave: handleLeave,
	}
}
