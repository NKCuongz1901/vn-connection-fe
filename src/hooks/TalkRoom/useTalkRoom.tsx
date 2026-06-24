import { getMyTalkRoomAnalysis } from '@/apis/talkRoomApis'
import { useModal } from '@/context/ModalContext'
import { useEffect, useState } from 'react'

export default function useTalkRoom() {
	const [loading, setLoading] = useState(false)
	const { openError, openSuccess } = useModal()
	const [myTalkRoomAnalysis, setMyTalkRoomAnalysis] = useState<any>(null)

	const handleGetMyTalkRoomAnalysis = async () => {
		setLoading(true)
		try {
			const res: any = await getMyTalkRoomAnalysis({
				params: {
					fields: ['$all'],
				},
			})
			const { code, results } = res || {}
			if (code === 200) {
				setMyTalkRoomAnalysis(results?.object)
				setLoading(false)
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		handleGetMyTalkRoomAnalysis()
	}, [])

	return {
		loading,
		myTalkRoomAnalysis,
	}
}
