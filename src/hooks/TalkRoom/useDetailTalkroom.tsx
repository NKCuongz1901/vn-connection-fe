'use client'

import { useCallback, useEffect, useState } from 'react'

import {
	getDetailTalkRoom,
	joinTalkroom,
	JoinTalkroomModel,
	TalkRoomDetail,
	validatePreTalkroom,
	ValidatePreTalkroomModel,
} from '@/apis/talkRoomApis'
import { useModal } from '@/context/ModalContext'
import { TALK_ROOM_JOIN_REASON } from '@/Variable/talkRoom.variable'

export type ValidatePreJoinRoomResult = ValidatePreTalkroomModel & {
	isRejoin: boolean
}

export default function useDetailTalkroom(id: string) {
	const { openError } = useModal()
	const [talkRoomDetail, setTalkRoomDetail] = useState<TalkRoomDetail | null>(
		null,
	)
	const [loadingTalkRoomDetail, setLoadingTalkRoomDetail] = useState(false)
	const [validatePreJoin, setValidatePreJoin] =
		useState<ValidatePreTalkroomModel | null>(null)
	const [loadingValidatePreJoin, setLoadingValidatePreJoin] = useState(false)
	const [joinTalkRoomResult, setJoinTalkRoomResult] =
		useState<JoinTalkroomModel | null>(null)
	const [loadingJoinTalkRoom, setLoadingJoinTalkRoom] = useState(false)

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

		await handleGetDetailTalkRoom(id)
	}, [
		id,
		handleValidatePreJoinRoom,
		handleJoinTalkRoom,
		handleGetDetailTalkRoom,
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

		onGetDetailTalkRoom: handleGetDetailTalkRoom,
		onValidatePreJoinRoom: handleValidatePreJoinRoom,
		onJoinTalkRoom: handleJoinTalkRoom,
	}
}
