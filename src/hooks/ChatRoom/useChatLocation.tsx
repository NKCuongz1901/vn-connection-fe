import {
	findChatLocation,
	getListActiveChatLocation,
	getListMyChatLocation,
	getListSuggestChatLocation,
} from '@/apis/conversationApis'
import { useModal } from '@/context/ModalContext'
import { ChatLocationItemProps } from '@/interface/Conversation/Conversation.interface'
import { getUserInfo } from '@/ultis/storage'
import { useEffect, useState } from 'react'

interface useChatLocationProps {
	tabOpts?: { value: string; label: string }[]
}

export interface FindChatLocationItem {
	id: string | null
	title: string
	level: number
}

export default function useChatLocation(props: useChatLocationProps) {
	const { tabOpts } = props
	const { openError } = useModal()
	const [loading, setLoading] = useState({
		myChatLocation: false,
		activeChatLocation: false,
		suggestChatLocation: false,
		findChatLocation: false,
	})
	const [listMyChatLocation, setListMyChatLocation] = useState<
		ChatLocationItemProps[]
	>([])
	const [listActiveChatLocation, setListActiveChatLocation] = useState<
		ChatLocationItemProps[]
	>([])
	const [listSuggestChatLocation, setListSuggestChatLocation] = useState([])
	const [listFindChatLocation, setListFindChatLocation] = useState<
		FindChatLocationItem[]
	>([])
	const [findKeyword, setFindKeyword] = useState('')

	const handleGetListMyChatLocation = async () => {
		setLoading((prev) => ({ ...prev, myChatLocation: true }))
		try {
			const res: any = await getListMyChatLocation({
				fields: ['$all'],
				page: 1,
				limit: 50,
			})
			const { code, results } = res
			if (code === 200) {
				setListMyChatLocation(results.objects.rows || [])
			}
		} catch (error) {
			openError(error.message)
		} finally {
			setLoading((prev) => ({ ...prev, myChatLocation: false }))
		}
	}

	const handleGetListActiveChatLocation = async () => {
		setLoading((prev) => ({ ...prev, activeChatLocation: true }))
		try {
			const res: any = await getListActiveChatLocation({
				fields: ['$all'],
				page: 1,
				limit: 50,
			})
			const { code, results } = res
			if (code === 200) {
				setListActiveChatLocation(results.objects.rows || [])
			}
		} catch (error) {
			openError(error.message)
		} finally {
			setLoading((prev) => ({ ...prev, activeChatLocation: false }))
		}
	}

	const handleGetListSuggestChatLocation = async () => {
		setLoading((prev) => ({ ...prev, suggestChatLocation: true }))
		try {
			const res: any = await getListSuggestChatLocation({
				latitude: 0,
				longitude: 0,
			})
			const { code, results } = res
			if (code === 200) {
				setListSuggestChatLocation(results.object || [])
			}
		} catch (error) {
			openError(error.message)
		} finally {
			setLoading((prev) => ({ ...prev, suggestChatLocation: false }))
		}
	}

	// Find chat locations by latitude and longitude.
	const handleFindChatLocation = async ({
		latitude,
		longitude,
		keyword = '',
	}: {
		latitude?: number
		longitude?: number
		keyword?: string
	} = {}) => {
		const { latitude: userLat, longitude: userLng } = getUserInfo() || {}
		const lat = Number(latitude ?? userLat) || 0
		const lng = Number(longitude ?? userLng) || 0

		setLoading((prev) => ({ ...prev, findChatLocation: true }))
		try {
			const res: any = await findChatLocation({
				latitude: lat,
				longitude: lng,
			})
			const { code, results } = res
			if (code === 200) {
				setListFindChatLocation(results?.object?.rows || [])
				setFindKeyword(keyword)
			}
		} catch (error) {
			openError(error.message)
		} finally {
			setLoading((prev) => ({ ...prev, findChatLocation: false }))
		}
	}

	useEffect(() => {
		handleGetListMyChatLocation()
		handleGetListActiveChatLocation()
		handleGetListSuggestChatLocation()
	}, [])

	return {
		loading,
		listMyChatLocation,
		listActiveChatLocation,
		listSuggestChatLocation,
		listFindChatLocation,
		findKeyword,

		// Actions
		onFindChatLocation: handleFindChatLocation,
	}
}
