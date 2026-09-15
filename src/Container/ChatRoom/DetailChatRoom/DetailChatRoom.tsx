import { memo, useState } from 'react'

import useDetailChatRoom from '@/hooks/ChatRoom/useDetailChatRoom'

import MiniChatTopicBar from '@/Components/ChatLocation/MiniChatTopicBar/MiniChatTopicBar'
import ModalLeaveMiniChat from '@/Components/ChatLocation/ModalSelectMiniChat/ModalLeaveMiniChat'
import ModalSelectMiniChat from '@/Components/ChatLocation/ModalSelectMiniChat/ModalSelectMiniChat'
import ModalNotiChatRoom from '@/Components/ChatRoom/ModalNotiChatRoom'
import ChatRoomInboxChat from '@/Components/ChatRoomInbox/ChatRoomInboxChat'

import {
	FullMiniChatItemProps,
	MiniChatItemProps,
} from '@/interface/Conversation/Conversation.interface'

import classes from './DetailChatRoom.module.scss'

interface DetailChatRoomProps {
	id: string
	isChatLocation?: boolean
	miniChats?: MiniChatItemProps[]
	fullMiniChats?: FullMiniChatItemProps[]
	activeMiniChatId?: string
	miniChatsLoading?: boolean
	fullMiniChatsLoading?: boolean
	miniChatActionId?: string
	onSelectMiniChat?: (
		item: Pick<MiniChatItemProps, 'id'>,
		options?: { isJoining?: boolean },
	) => void
	onSelectParentChat?: () => void
	onLeaveMiniChat?: (item: FullMiniChatItemProps) => Promise<boolean>
	onSuccess?: any
}

const DetailChatRoom = (props: DetailChatRoomProps) => {
	const {
		id,
		isChatLocation,
		miniChats = [],
		fullMiniChats = [],
		activeMiniChatId,
		miniChatsLoading,
		fullMiniChatsLoading,
		miniChatActionId,
		onSelectMiniChat,
		onSelectParentChat,
		onLeaveMiniChat,
		onSuccess = () => null,
	} = props
	const { modal, setModal, onSetTimesJoin } = useDetailChatRoom(props)
	const [openSelectMiniChat, setOpenSelectMiniChat] = useState(false)
	const [leaveMiniChatTarget, setLeaveMiniChatTarget] =
		useState<FullMiniChatItemProps | null>(null)

	/** Opens a mini chat or asks to leave if already joined. */
	const handleSelectFullMiniChat = (item: FullMiniChatItemProps) => {
		setOpenSelectMiniChat(false)
		if (item.joined) {
			setLeaveMiniChatTarget(item)
			return
		}
		onSelectMiniChat?.(item, { isJoining: true })
	}

	/** Confirms leave for the selected joined mini chat. */
	const handleConfirmLeaveMiniChat = async () => {
		if (!leaveMiniChatTarget || !onLeaveMiniChat) return
		const success = await onLeaveMiniChat(leaveMiniChatTarget)
		if (success) setLeaveMiniChatTarget(null)
	}

	const _renderModal = () => {
		const { type } = modal || {}
		let Content = <></>
		const propsModal = {
			open: true,
			onCancel: () => {
				setModal({})
				if (type === 'noti') {
					onSetTimesJoin()
				}
			},
			onClose: () => {
				setModal({})
			},
		}
		switch (type) {
			case 'noti':
				Content = (
					<ModalNotiChatRoom open {...propsModal} onSubmit={onSetTimesJoin} />
				)
				break
			case 'rule':
				Content = (
					<ModalNotiChatRoom
						open
						{...propsModal}
						onSubmit={() => setModal({})}
					/>
				)
				break
			default:
				break
		}
		return Content
	}

	const topicBar =
		isChatLocation ? (
			<MiniChatTopicBar
				key="mini-chat-topic-bar"
				items={miniChats}
				activeId={activeMiniChatId}
				loading={miniChatsLoading}
				onExpand={() => setOpenSelectMiniChat(true)}
				onSelect={onSelectMiniChat}
				onSelectHome={onSelectParentChat}
			/>
		) : null

	return (
		<div className={classes.wrapper}>
			{/* Inbox remounts chat body via convId; topic bar stays mounted here. */}
			<ChatRoomInboxChat
				convId={id}
				isChatLocation={isChatLocation}
				activeMiniChatId={activeMiniChatId}
				topicBar={topicBar}
				onSuccess={onSuccess}
				onChangeModal={setModal}
			/>
			{openSelectMiniChat && (
				<ModalSelectMiniChat
					items={fullMiniChats}
					loading={fullMiniChatsLoading}
					onClose={() => setOpenSelectMiniChat(false)}
					onSelect={handleSelectFullMiniChat}
				/>
			)}
			{leaveMiniChatTarget && (
				<ModalLeaveMiniChat
					loading={miniChatActionId === leaveMiniChatTarget.id}
					onCancel={() => setLeaveMiniChatTarget(null)}
					onConfirm={handleConfirmLeaveMiniChat}
				/>
			)}
			{_renderModal()}
		</div>
	)
}

export default memo(DetailChatRoom)
