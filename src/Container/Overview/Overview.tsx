import { memo, useCallback, useState } from 'react'

import CButton from '@/Components/Custom/CButton'
import ModalCRUDEvent from '@/Components/Overview/ModalCRUDEvent'

interface openModalProps {
	type: string | null
	data: any
}

const Overview = () => {
	const [openModal, setOpenModal] = useState<openModalProps>({
		type: null,
		data: null,
	})
	const _renderModal = useCallback(() => {
		const { type } = openModal
		let Content = <></>
		const propsModal = {
			open: true,
			onClose: () => setOpenModal({ type: null, data: null }),
		}
		switch (type) {
			case 'event':
				Content = <ModalCRUDEvent {...propsModal} />
				break
			default:
				break
		}
		return Content
	}, [openModal])
	return (
		<div>
			<CButton onClick={() => setOpenModal({ type: 'event', data: null })}>
				click
			</CButton>
			{_renderModal()}
		</div>
	)
}

export default memo(Overview)
