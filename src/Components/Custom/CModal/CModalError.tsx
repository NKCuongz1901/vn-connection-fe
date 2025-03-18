import { Flex } from 'antd'
import { memo } from 'react'

import { CModalProps } from '@/interface/CComponent/CComponent.interface'
import CButton from '../CButton'
import CModal from './CModal'

import './CModal.scss'

const CModalError = (_props: CModalProps) => {
	const { onCancel, error, ...props } = _props
	let message = error?.response?.data?.message || error?.message || error
	// let code = error?.response?.data?.code || 0
	if (typeof message !== 'string') {
		message = 'Unknow error'
	}
	// if (code === 409) {
	// 	message = 'Login expired, please login again 🍁'
	// }
	// const onClose = () => {
	// 	handleClose()
	// 	if (code === 409) {
	// 		window.location.href = '/login'
	// 	}
	// }
	return (
		<CModal
			className="wrapperCModalError"
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
			<Flex
				vertical
				align="center"
				className="cModalErrorContent flex-1"
				gap={12}
			>
				<span className="error CModalErrorTitle">ERROR</span>
				<Flex vertical className="CModalErrorBody">
					{message}
				</Flex>
			</Flex>
		</CModal>
	)
}

export default memo(CModalError)
