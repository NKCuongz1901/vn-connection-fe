import { useEffect, useRef, useState } from 'react'

import { getListSticket } from '@/apis/postApis'

import { useModal } from '@/context/ModalContext'
import { ItemType } from 'antd/es/menu/interface'

type useHangoutChatProps = {
	type?: string
	onLoadMore?: any
	[key: string]: any
}
export default function useChatBox({
	onLoadMore,
	type,
	onActionMessage,
}: useHangoutChatProps) {
	const { openError } = useModal()
	const _refInput = useRef() as any
	const [stickerList, setStickerList] = useState([]) as any[]
	const [activeSticker, setActiveSticker] = useState(0)
	const [showSticker, setShowSticker] = useState(false)
	const [text, setText] = useState('')
	const [reply, setReply] = useState() as any
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
		setReply(item)
		_refInput?.current?.focus()
	}
	const handleGetMenus = ({ isMe, item }: { [key: string]: any }) => {
		const _props = []
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
		const menus: ItemType[] = [
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
	useEffect(() => {
		handleGetSticker()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return {
		_refInput,
		activeSticker,
		showSticker,
		stickerList,
		text,
		reply,
		setReply,
		setText,
		setActiveSticker,
		setShowSticker,
		onScroll: handleScroll,
		onGetMenus: handleGetMenus,
	}
}
