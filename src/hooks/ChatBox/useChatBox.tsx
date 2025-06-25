import { useEffect, useState } from 'react'

import { getListSticket } from '@/apis/postApis'

import { useModal } from '@/context/ModalContext'

type useHangoutChatProps = {
	onLoadMore?: any
}
export default function useChatBox({ onLoadMore }: useHangoutChatProps) {
	const { openError } = useModal()

	const [stickerList, setStickerList] = useState([]) as any[]
	const [activeSticker, setActiveSticker] = useState(0)
	const [showSticker, setShowSticker] = useState(false)
	const [text, setText] = useState('')

	const handleScroll = (e: any) => {
		const clientHeight = e.target.clientHeight
		const scrollHeight = e.target.scrollHeight
		const scrollTop = Math.abs(e.target.scrollTop)
		const isReachedEnd = scrollTop + clientHeight >= scrollHeight - 50
		if (!isReachedEnd) return
		if (onLoadMore) {
			onLoadMore()
		}
	}

	const handleGetSticker = async () => {
		try {
			const res: any = await getListSticket({
				fields: ['$all'],
			})
			setStickerList(res?.results?.objects?.rows || [])
		} catch (error) {
			openError(error)
		}
	}

	useEffect(() => {
		handleGetSticker()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return {
		activeSticker,
		showSticker,
		stickerList,
		text,
		setText,
		setActiveSticker,
		setShowSticker,
		onScroll: handleScroll,
	}
}
