import { memo } from 'react'

import useDetailChatRoom from '@/hooks/ChatRoom/useDetailChatRoom'

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
	onSelectMiniChat?: (item: Pick<MiniChatItemProps, 'id'>) => void
	onSelectParentChat?: () => void
	onLeaveMiniChat?: (item: FullMiniChatItemProps) => Promise<boolean>
	onSuccess?: any
}

const DetailChatRoom = (props: DetailChatRoomProps) => {
	const {
		id,
		isChatLocation,
		miniChats,
		fullMiniChats,
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

	return (
		<div className={classes.wrapper}>
			{/* <InboxChat convId={id} /> */}
			<ChatRoomInboxChat
				key={id}
				convId={id}
				isChatLocation={isChatLocation}
				miniChats={miniChats}
				fullMiniChats={fullMiniChats}
				activeMiniChatId={activeMiniChatId}
				miniChatsLoading={miniChatsLoading}
				fullMiniChatsLoading={fullMiniChatsLoading}
				miniChatActionId={miniChatActionId}
				onSelectMiniChat={onSelectMiniChat}
				onSelectParentChat={onSelectParentChat}
				onLeaveMiniChat={onLeaveMiniChat}
				onSuccess={onSuccess}
				onChangeModal={setModal}
			/>
			{_renderModal()}
		</div>
	)
}

export default memo(DetailChatRoom)
