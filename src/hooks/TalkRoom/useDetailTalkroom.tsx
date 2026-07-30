'use client'

import { useCallback, useEffect, useState } from 'react'

import {
	getDetailTalkRoom,
	getListenerInRoom,
	joinTalkroom,
	JoinTalkroomModel,
	leaveTalkroom,
	TalkRoomDetail,
	TalkRoomListenerInRoom,
	validatePreTalkroom,
	ValidatePreTalkroomModel,
} from '@/apis/talkRoomApis'
import { useModal } from '@/context/ModalContext'
import { TALK_ROOM_JOIN_REASON } from '@/Variable/talkRoom.variable'
import { useLocalePath } from '@/ultis/route'
import { mainRoutes } from '@/routes/MainRoutes'
import useTalkRoomSocket from './useTalkRoomSocket'

export type ValidatePreJoinRoomResult = ValidatePreTalkroomModel & {
	isRejoin: boolean
}

type UseDetailTalkroomOptions = {
	onRoomSocketEvent?: (event: string, data?: unknown) => void
}

export default function useDetailTalkroom(
	id: string,
	options?: UseDetailTalkroomOptions,
) {
	const { openError } = useModal()
	const { onChangeRoute } = useLocalePath()
	const [talkRoomDetail, setTalkRoomDetail] = useState<TalkRoomDetail | null>(
		null,
	)
	const [loadingTalkRoomDetail, setLoadingTalkRoomDetail] = useState(false)
	const [validatePreJoin, setValidatePreJoin] =
		useState<ValidatePreTalkroomModel | null>(null)
	const [loadingValidatePreJoin, setLoadingValidatePreJoin] = useState(false)
	const [joinTalkRoomResult, setJoinTalkRoomResult] =
		useState<JoinTalkroomModel | null>(null)
	const isJoined = joinTalkRoomResult?.success === true
	const [loadingJoinTalkRoom, setLoadingJoinTalkRoom] = useState(false)
	const [listenersInRoom, setListenersInRoom] = useState<
		TalkRoomListenerInRoom[]
	>([])
	const [totalListenersInRoom, setTotalListenersInRoom] = useState(0)
	const [loadingListenersInRoom, setLoadingListenersInRoom] = useState(false)

	const handleGetDetailTalkRoom = useCallback(
		async (
			roomId: string = id,
			params: { [key: string]: any } = { fields: ['$all'] },
		) => {
			if (!roomId) return null

			setLoadingTalkRoomDetail(true)
			try {
				const res: any = await getDetailTalkRoom({ id: roomId, params })
				const { code, results } = res || {}

				if (code === 200) {
					const room: TalkRoomDetail = results?.object ?? null
					setTalkRoomDetail(room)
					return room
				}
			} catch (error) {
				openError(error)
			} finally {
				setLoadingTalkRoomDetail(false)
			}

			return null
		},
		[id, openError],
	)

	const handleValidatePreJoinRoom = useCallback(
		async (
			roomId: string = id,
			params: { [key: string]: any } = { fields: ['$all'] },
		): Promise<ValidatePreJoinRoomResult | null> => {
			if (!roomId) return null

			setLoadingValidatePreJoin(true)
			try {
				const res: any = await validatePreTalkroom({ id: roomId, params })
				const { code, results } = res || {}

				if (code === 200) {
					const data: ValidatePreTalkroomModel = results?.object ?? null
					setValidatePreJoin(data)

					if (!data) return null

					return {
						...data,
						isRejoin: data.reason === TALK_ROOM_JOIN_REASON.USER_ALREADY_JOINED,
					}
				}
			} catch (error) {
				openError(error)
			} finally {
				setLoadingValidatePreJoin(false)
			}

			return null
		},
		[id, openError],
	)

	const handleJoinTalkRoom = useCallback(
		async (
			roomId: string = id,
			payload: { [key: string]: any } = { fields: ['$all'] },
		): Promise<JoinTalkroomModel | null> => {
			if (!roomId) return null

			setLoadingJoinTalkRoom(true)
			try {
				const res: any = await joinTalkroom({ id: roomId, payload })
				const { code, results } = res || {}

				if (code === 200) {
					const data: JoinTalkroomModel = results?.object ?? null

					if (data?.success) {
						setJoinTalkRoomResult(data)
						return data
					}
				}
			} catch (error) {
				openError(error)
			} finally {
				setLoadingJoinTalkRoom(false)
			}

			return null
		},
		[id, openError],
	)
	const handleGetListenerInRoom = useCallback(
		async (
			roomId: string = id,
			params: { [key: string]: any } = {
				fields: ['$all'],
				page: 1,
				limit: 30,
			},
		) => {
			if (!roomId) return null

			setLoadingListenersInRoom(true)
			try {
				const res: any = await getListenerInRoom({ id: roomId, params })
				const { code, results, pagination } = res || {}

				if (code === 200) {
					const rows: TalkRoomListenerInRoom[] = results?.objects?.rows ?? []
					const count =
						results?.objects?.count ?? pagination?.total ?? rows.length

					setListenersInRoom(rows)
					setTotalListenersInRoom(count)

					return { rows, count, pagination }
				}
			} catch (error) {
				openError(error)
			} finally {
				setLoadingListenersInRoom(false)
			}

			return null
		},
		[id, openError],
	)

	const handleLeaveRoom = useCallback(async () => {
		if (!id) return
		try {
			await leaveTalkroom({ id })
		} catch (error) {
			openError(error)
		}
	}, [id, openError])

	const handleRoomSocketEvent = useCallback(
		(event: string, data?: unknown) => {
			switch (event) {
				case 'user_joined_room':
				case 'user_left_room':
					handleGetDetailTalkRoom(id)
					handleGetListenerInRoom(id)
					break
				case 'room_went_live':
					handleGetDetailTalkRoom(id)
					break
				case 'room_start_countdown':
				case 'speaker_on_mic':
				case 'speaker_off_mic':
					handleGetDetailTalkRoom(id)
					break
				case 'room_inactive_warning':
					// openSuccess({ message: '...' }) hoặc toast sau
					break
				case 'room_force_closed':
				case 'room_inactive_force_closed':
					handleLeaveRoom().finally(() => {
						onChangeRoute(mainRoutes.talkroom)
					})
					break
				default:
					break
			}

			options?.onRoomSocketEvent?.(event, data)
		},
		[
			id,
			handleGetDetailTalkRoom,
			handleGetListenerInRoom,
			handleLeaveRoom,
			onChangeRoute,
			options?.onRoomSocketEvent,
		],
	)

	const { isConnected } = useTalkRoomSocket({
		roomId: id,
		enabled: isJoined,
		onRoomEvent: handleRoomSocketEvent,
	})

	const handleEnterRoom = useCallback(async () => {
		if (!id) return

		const validation = await handleValidatePreJoinRoom(id)
		if (!validation) return

		const canProceed =
			validation.canJoin === true ||
			validation.isRejoin === true ||
			validation.reason === TALK_ROOM_JOIN_REASON.HOST_NOT_JOINED

		if (!canProceed) return

		const joinResult = await handleJoinTalkRoom(id)
		if (!joinResult?.success) return

		await Promise.all([
			handleGetDetailTalkRoom(id),
			handleGetListenerInRoom(id),
		])
	}, [
		id,
		handleValidatePreJoinRoom,
		handleJoinTalkRoom,
		handleGetDetailTalkRoom,
		handleGetListenerInRoom,
	])

	useEffect(() => {
		if (!id) return
		handleEnterRoom()
	}, [id, handleEnterRoom])

	return {
		talkRoomDetail,
		loadingTalkRoomDetail,
		validatePreJoin,
		loadingValidatePreJoin,
		joinTalkRoomResult,
		loadingJoinTalkRoom,
		listenersInRoom,
		totalListenersInRoom,
		loadingListenersInRoom,

		onGetDetailTalkRoom: handleGetDetailTalkRoom,
		onGetListenerInRoom: handleGetListenerInRoom,
		onValidatePreJoinRoom: handleValidatePreJoinRoom,
		onJoinTalkRoom: handleJoinTalkRoom,
		onLeaveRoom: handleLeaveRoom,
	}
}
