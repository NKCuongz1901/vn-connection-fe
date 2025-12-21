import { memo } from 'react'

import useDetailChatRoom from '@/hooks/ChatRoom/useDetailChatRoom'

import ModalNotiChatRoom from '@/Components/ChatRoom/ModalNotiChatRoom'
import ChatRoomInboxChat from '@/Components/ChatRoomInbox/ChatRoomInboxChat'

import classes from './DetailChatRoom.module.scss'

interface DetailChatRoomProps {
	id: string
	onSuccess?: any
}

const DetailChatRoom = (props: DetailChatRoomProps) => {
	const { id, onSuccess = () => null } = props
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
				onSuccess={onSuccess}
				onChangeModal={setModal}
			/>
			{_renderModal()}
		</div>
	)
}

export default memo(DetailChatRoom)
