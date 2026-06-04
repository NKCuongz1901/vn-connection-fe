import { useEffect, useState } from 'react'

import { getPublicEventDetail } from '@/apis/postApis'
import { useModal } from '@/context/ModalContext'

interface UsePublicDetailEventProps {
	id: string
}

export default function usePublicDetailEvent({
	id: _id,
}: UsePublicDetailEventProps) {
	const { openError } = useModal()
	const [id, setId] = useState(_id)
	const [detailPost, setDetailPost] = useState<any>({})
	const [loading, setLoading] = useState({ detailLoad: false })

	const fetchDetail = async () => {
		setLoading((prev) => ({ ...prev, detailLoad: true }))
		try {
			const res: any = await getPublicEventDetail({
				id,
				params: {
					// chỉnh theo field BE public cho phép
					fields: ['$all', { user: ['name', 'avatar', 'id'] }],
				},
			})
			if (res?.code === 200) {
				setDetailPost(res?.results?.object ?? {})
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoading((prev) => ({ ...prev, detailLoad: false }))
		}
	}

	useEffect(() => {
		if (!id) return
		fetchDetail()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id])

	useEffect(() => {
		setId(_id)
	}, [_id])

	return {
		id,
		detailPost,
		loading,
		onRefetch: fetchDetail,
	}
}
