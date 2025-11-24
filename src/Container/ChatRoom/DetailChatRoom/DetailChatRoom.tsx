import { memo } from 'react'

import useDetailChatRoom from '@/hooks/ChatRoom/useDetailChatRoom'

import ModalNotiChatRoom from '@/Components/ChatRoom/ModalNotiChatRoom'

const DetailChatRoom = ({ id }) => {
	const { modal, setModal, onSetTimesJoin } = useDetailChatRoom({ id })

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

	return <div>{_renderModal()}</div>
}

export default memo(DetailChatRoom)
