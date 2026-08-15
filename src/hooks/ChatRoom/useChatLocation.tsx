import {
	getListActiveChatLocation,
	getListMyChatLocation,
	getListSuggestChatLocation,
} from '@/apis/conversationApis'
import { useModal } from '@/context/ModalContext'
import { ChatLocationItemProps } from '@/interface/Conversation/Conversation.interface'
import { useEffect, useState } from 'react'

interface useChatLocationProps {
	tabOpts?: { value: string; label: string }[]
}

export default function useChatLocation(props: useChatLocationProps) {
	const { tabOpts } = props
	const { openError } = useModal()
	const [loading, setLoading] = useState({
		myChatLocation: false,
		activeChatLocation: false,
		suggestChatLocation: false,
	})
	const [listMyChatLocation, setListMyChatLocation] = useState<
		ChatLocationItemProps[]
	>([])
	const [listActiveChatLocation, setListActiveChatLocation] = useState<
		ChatLocationItemProps[]
	>([])
	const [listSuggestChatLocation, setListSuggestChatLocation] = useState([])

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
	}
}
