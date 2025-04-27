import { Flex } from 'antd'
import { memo } from 'react'

import CButton from '../CButton'
import CModal from './CModal'

import { CModalProps } from '@/interface/CComponent/CComponent.interface'

import './CModal.scss'

interface CModalSelectProps {
	options: { value: string; label: string; [key: string]: any }[]
	onChoose?: any
}

const CModalSelect = (_props: CModalSelectProps & CModalProps) => {
	const { options, onCancel, onChoose, message, titleLabel, ...props } = _props
	return (
		<CModal
			className="wrapperCModalConfirm"
			onCancel={onCancel}
			footer={[<div key={1}></div>]}
			{...props}
		>
			<Flex vertical align="center" className="cModalContent flex-1" gap={12}>
				<span className="info CModalTitle">{titleLabel || 'Confirm'}</span>
				<Flex vertical className="CModalBody">
					{message}
				</Flex>
				<Flex vertical className="CModalBodySelect">
					{options.map((option) => {
						const { value, label, ...optionProps } = option
						return (
							<CButton
								key={value}
								{...optionProps}
								onClick={() => onChoose(value)}
							>
								{label}
							</CButton>
						)
					})}
				</Flex>
			</Flex>
		</CModal>
	)
}

export default memo(CModalSelect)
