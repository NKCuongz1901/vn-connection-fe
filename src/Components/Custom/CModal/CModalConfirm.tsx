import { Flex } from 'antd'
import { memo } from 'react'

import { CModalProps } from '@/interface/CComponent/CComponent.interface'
import CButton from '../CButton'
import CModal from './CModal'

import './CModal.scss'
import { useLoading } from '@/context/LoadingContext'

const CModalConfirm = (_props: CModalProps) => {
	const { onCancel, onOk, message: _message, titleLabel, ...props } = _props
	const { loadingContext } = useLoading()
	let message = _message
	if (typeof message !== 'string') {
		message = 'Confirm action'
	}
	return (
		<CModal
			className="wrapperCModalConfirm"
			onCancel={onCancel}
			footer={[
				<Flex key="back" justify="center" gap={8}>
					<CButton
						disabled={loadingContext}
						onClick={onCancel}
						ctype="disabled"
						style={{ width: 240 }}
					>
						Cancel
					</CButton>
					<CButton
						disabled={loadingContext}
						onClick={onOk}
						ctype="oranger"
						style={{ width: 240 }}
					>
						Confirm
					</CButton>
				</Flex>,
			]}
			{...props}
		>
			<Flex vertical align="center" className="cModalContent flex-1" gap={12}>
				<span className="info CModalTitle">{titleLabel || 'Confirm'}</span>
				<Flex vertical className="CModalBody">
					{message}
				</Flex>
			</Flex>
		</CModal>
	)
}

export default memo(CModalConfirm)
