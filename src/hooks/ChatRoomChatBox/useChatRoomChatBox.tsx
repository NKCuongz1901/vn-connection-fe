import { ItemType } from 'antd/es/menu/interface'
import { useEffect, useRef, useState } from 'react'

import { getListSticket } from '@/apis/postApis'
import { getUserProfile, updateUserProfile } from '@/apis/userApis'

import { useModal } from '@/context/ModalContext'

import { getReact, textToSpeech, translate } from '@/apis/conversationApis'
import { handleUploadFile } from '@/apis/uploadApis'

import { playAudio, stopAudio } from '@/ultis/file'
import { copyToClipboard } from '@/ultis/string'

import { ReactionPtops } from '@/interface/Conversation/Conversation.interface'

type useHangoutChatProps = {
	type?: string
	onLoadMore?: any
	onAddReact?: any
	[key: string]: any
}
export default function useChatRoomChatBox({
	onLoadMore,
	type,
	onActionMessage,
	onAddReact,
	onCancelEdit,
}: useHangoutChatProps) {
	const { openError, openSuccess } = useModal()
	const _refInput = useRef() as any
	const prevAudioId = useRef('')

	const [stickerList, setStickerList] = useState([]) as any[]
	const [reactList, setReactList] = useState<ReactionPtops[]>([])
	const [activeSticker, setActiveSticker] = useState(0)
	const [showSticker, setShowSticker] = useState(false)
	const [text, setText] = useState('')
	const [reply, setReply] = useState() as any
	const [searchCountry, setSearchCountry] = useState('')

	const [isAudio, setIsAudio] = useState(false)

	const [openReact, setOpenReact] = useState() as any

	const [listSpToText, setListSpToText] = useState({})
	const [listSpToTextLoading, setListSpToTextLoading] = useState({})

	const [listTextToSpeech, setListTextToSpeech] = useState({})
	const [listTextToSpeechLoading, setListTextToSpeechLoading] = useState({})

	const [listTranslate, setListTranslate] = useState({})
	const [listTranslateLoading, setListTranslateLoading] = useState({})

	const [playAudioId, setPlayAudioId] = useState('')
	const [language, setLanguage] = useState('en')
	const handleAddMp3 = async (url) => {
		const res = await fetch('/api/proxy', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				url: url,
				fileName: 'audio.mp3',
			}),
		})

		const blob = await res.blob()
		const file = new File([blob], 'audio.mp3', { type: blob.type })
		return file
	}
	const handleAddSpToText = async (item) => {
		const { id, medias } = item || {}
		setListSpToTextLoading((prev) => ({ ...prev, [id]: true }))
		try {
			const res1 = await handleAddMp3(medias[0]?.url)

			// giả lập như file được chọn từ input
			const res: any = await handleUploadFile(res1)
			const text = res?.results?.object?.text
			setListSpToText((prev) => ({ ...prev, [id]: text }))
		} catch (error) {
			openError(error)
		} finally {
			setListSpToTextLoading((prev) => ({ ...prev, [id]: false }))
		}
	}
	const handleAddTextToSpeech = async (item) => {
		const { id, content } = item || {}
		if (listTextToSpeech[id]) {
			setPlayAudioId(id)

			return
		}
		setListTextToSpeechLoading((prev) => ({ ...prev, [id]: true }))
		try {
			const payload = {
				text: content,
			}
			const res: any = await textToSpeech({ payload })
			const url = res?.results?.object?.url
			setListTextToSpeech((prev) => ({ ...prev, [id]: url }))
			setPlayAudioId(id)
		} catch (error) {
			openError(error)
		} finally {
			setListTextToSpeechLoading((prev) => ({ ...prev, [id]: false }))
		}
	}

	const handleAddTranslate = async (item, code?: string) => {
		const { id, content } = item || {}

		setListTranslateLoading((prev) => ({ ...prev, [id]: true }))
		try {
			const payload = {
				text: content,
				targetLanguage: code || language || 'en',
			}
			const res: any = await translate({ payload })
			const example = res?.results?.object?.translated_text
			setListTranslate((prev) => ({ ...prev, [id]: example }))
		} catch (error) {
			openError(error)
		} finally {
			setListTranslateLoading((prev) => ({ ...prev, [id]: false }))
		}
	}

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
	const handleReply = (item) => {
		onCancelEdit?.()
		setReply(item)
		_refInput?.current?.focus()
	}
	const handleOpenReact = (item, event?: React.MouseEvent) => {
		setOpenReact((prev) => {
			if (prev?.id === item?.id) return null
			return {
				...item,
				menuAnchorX: event?.clientX ?? 0,
				menuAnchorY: event?.clientY ?? 0,
			}
		})
	}
	const handleCopy = (data) => {
		copyToClipboard(data, {
			callback: openSuccess({ message: 'Link copied successfully! ' }),
		})
	}
	const handleActionMessage = ({ key, value }) => {
		switch (key) {
			case 'copy':
				handleCopy(value?.content)
				break

			default:
				break
		}
	}
	const handleGetMenus = ({ isMe, item }: { [key: string]: any }) => {
		const _props = []
		const { type: typeMessage } = item || {}
		switch (typeMessage) {
			case 'TEXT':
				_props.push({
					key: 'copy',
					label: 'Copy',
					onClick: () => handleActionMessage({ key: 'copy', value: item }),
				})
				break

			default:
				break
		}
		switch (type) {
			case 'inbox':
				{
					const { pin_message_at } = item || {}
					if (pin_message_at) {
						_props.push({
							key: 'unpin',
							label: 'Unpin',
							onClick: () => onActionMessage({ key: 'unpin', value: item }),
						})
					} else {
						_props.push({
							key: 'pin',
							label: 'Pin',
							onClick: () => onActionMessage({ key: 'pin', value: item }),
						})
					}
				}
				break
			default:
				break
		}
		const canEdit =
			isMe && (item?.type === 'TEXT' || item?.type === 'MEDIAS')

		const menus: ItemType[] = [
			...(canEdit
				? [
						{
							key: 'EDIT',
							label: 'Edit',
							onClick: () => onActionMessage({ key: 'edit', value: item }),
						},
					]
				: []),
			{
				key: 'REPLY',
				label: 'Reply',
				onClick: () => handleReply(item),
			},
			..._props,
			...(isMe
				? [
						{
							key: 'DELETE',
							label: 'Delete',
							style: { color: '#F80024' },
							onClick: () => onActionMessage({ key: 'delete', value: item }),
						},
					]
				: []),
		]
		return menus
	}
	const handlePlayAudio = (playAudioId) => {
		stopAudio(prevAudioId.current)

		playAudio(playAudioId, listTextToSpeech[playAudioId], () =>
			setPlayAudioId(''),
		)
	}
	const handleStopAudio = (id) => {
		stopAudio(id)
		setPlayAudioId('')
	}
	const handleGetReact = async () => {
		try {
			const res: any = await getReact({ fields: ['$all'] })
			setReactList(res?.results?.objects?.rows || [])
		} catch (error) {
			openError(error)
		}
	}
	const handleAddReact = async (values) => {
		await onAddReact(values)
		setOpenReact(null)
	}

	const handleChangeLanguage = async ({ item, code }) => {
		try {
			await updateUserProfile({ language_for_translate: code })
			setLanguage(code || 'en')
			handleAddTranslate(item, code)
		} catch (error) {
			openError(error)
		}
	}

	const handleGetProfile = async () => {
		try {
			const res: any = await getUserProfile({
				params: {
					fields: ['$all'],
				},
			})
			setLanguage(res?.results?.object?.language_for_translate)
		} catch (error) {
			openError(error)
		}
	}

	useEffect(() => {
		handleGetSticker()
		handleGetReact()
		handleGetProfile()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	useEffect(() => {
		if (playAudioId) {
			handlePlayAudio(playAudioId)
			prevAudioId.current = playAudioId
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [playAudioId])
	return {
		isAudio,
		listTranslateLoading,

		_refInput,
		activeSticker,
		showSticker,
		stickerList,
		text,
		reply,
		listSpToText,
		listSpToTextLoading,
		listTextToSpeechLoading,
		listTextToSpeech,
		playAudioId,
		listTranslate,
		reactList,
		openReact,
		language,
		searchCountry,

		setSearchCountry,
		setOpenReact,
		setIsAudio,
		setReply,
		setText,
		setActiveSticker,
		setShowSticker,
		onScroll: handleScroll,
		onGetMenus: handleGetMenus,
		onAddSpToText: handleAddSpToText,
		onAddTextToSpeech: handleAddTextToSpeech,
		onPlayAudio: handlePlayAudio,
		onStopAudio: handleStopAudio,
		onAddTranslate: handleAddTranslate,
		onAddReact: handleAddReact,
		onOpenReact: handleOpenReact,
		onChangeLanguage: handleChangeLanguage,
	}
}
