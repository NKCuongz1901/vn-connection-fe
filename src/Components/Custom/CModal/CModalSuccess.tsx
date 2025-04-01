import { Flex } from 'antd'
import { memo } from 'react'

import { CModalProps } from '@/interface/CComponent/CComponent.interface'
import CButton from '../CButton'
import CModal from './CModal'

import './CModal.scss'

const CModalSuccess = (_props: CModalProps) => {
	const { onCancel, message: _message, titleLabel, ...props } = _props
	let message = _message
	if (typeof message !== 'string') {
		message = 'Success'
	}
	return (
		<CModal
			className="wrapperCModalSuccess"
			onCancel={onCancel}
			footer={[
				<Flex key="back" justify="center">
					<CButton onClick={onCancel} ctype="oranger" style={{ width: 240 }}>
						Confirm
					</CButton>
				</Flex>,
			]}
			{...props}
		>
			<Flex vertical align="center" className="cModalContent flex-1" gap={12}>
				<span className="success CModalTitle">
					{titleLabel || 'Successfull'}
				</span>
				<Flex vertical className="CModalBody">
					{message}
				</Flex>
			</Flex>
		</CModal>
	)
}

export default memo(CModalSuccess)
