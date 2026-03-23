import { Flex } from 'antd'
import { memo } from 'react'

import { useLocalePath } from '@/ultis/route'
import { handleRemoveAllCookie } from '@/ultis/storage'

import { CModalProps } from '@/interface/CComponent/CComponent.interface'
import CButton from '../CButton'
import CModal from './CModal'

import { mainRoutes } from '@/routes/MainRoutes'

import './CModal.scss'
const codes = [409, 401, 410, 412]
const codeMessage = {
	409: 'Login expired, please login again 🍁',
	410: 'Change password',
	412: 'User was blocked',
}
const CModalError = (_props: CModalProps) => {
	const { onCancel, error, ...props } = _props
	const { onChangeRoute } = useLocalePath()
	let message = error?.response?.data?.message || error?.message || error
	const code = error?.response?.data?.code || error?.code || 0
	if (typeof message !== 'string') {
		message = 'Unknow error'
	}
	if (codes.includes(code)) {
		message = codeMessage[code] || message
	}

	const onClose = (e: any) => {
		e.stopPropagation()
		if (onCancel) {
			onCancel(e)
		}

		if (codes.includes(code)) {
			onChangeRoute(mainRoutes.login)
			handleRemoveAllCookie()
		}
	}
	return (
		<CModal
			className="wrapperCModalError"
			onCancel={onClose}
			footer={[
				<Flex key="back" justify="center">
					<CButton onClick={onClose} ctype="oranger" style={{ width: 240 }}>
						Confirm
					</CButton>
				</Flex>,
			]}
			{...props}
		>
			<Flex vertical align="center" className="cModalContent flex-1" gap={12}>
				<span className="error CModalTitle">ERROR</span>
				<Flex vertical className="CModalBody">
					{message}
				</Flex>
			</Flex>
		</CModal>
	)
}

export default memo(CModalError)
