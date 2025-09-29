'use client'
import { memo } from 'react'
import { Flex } from 'antd'

import useNetwork from '@/hooks/Network/useNetwork'

import CButton from '@/Components/Custom/CButton'
import ModalCRUDNetwork from '@/Components/Network/ModalCRUDNetwork'

import classes from './Network.module.scss'

const Network = () => {
	const { modal, setModal } = useNetwork({})
	const _renderModal = () => {
		const { type } = modal || {}
		let Content = <></>
		const propsModal = {
			open: true,
			onCancel: () => setModal({}),
			onClose: () => setModal({}),
		}
		switch (type) {
			case 'add':
				Content = <ModalCRUDNetwork {...propsModal} />
				break

			default:
				break
		}
		return Content
	}
	return (
		<div className={classes.wrapper}>
			<Flex className={classes.container}>
				<CButton onClick={() => setModal({ type: 'add', data: null })}>
					create
				</CButton>
			</Flex>
			{_renderModal()}
		</div>
	)
}

export default memo(Network)
