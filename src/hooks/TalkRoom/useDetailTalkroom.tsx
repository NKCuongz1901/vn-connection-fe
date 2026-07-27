'use client'

import { useCallback, useEffect, useState } from 'react'

import { getDetailTalkRoom, TalkRoomDetail } from '@/apis/talkRoomApis'
import { useModal } from '@/context/ModalContext'

export default function useDetailTalkroom(id: string) {
	const { openError } = useModal()
	const [talkRoomDetail, setTalkRoomDetail] = useState<TalkRoomDetail | null>(
		null,
	)
	const [loadingTalkRoomDetail, setLoadingTalkRoomDetail] = useState(false)

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

	useEffect(() => {
		if (!id) return
		handleGetDetailTalkRoom(id)
	}, [id, handleGetDetailTalkRoom])

	return {
		talkRoomDetail,
		loadingTalkRoomDetail,

		// Actión
		onGetDetailTalkRoom: handleGetDetailTalkRoom,
	}
}
