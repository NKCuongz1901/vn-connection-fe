import { Flex } from 'antd'
import { memo, useEffect } from 'react'

import { CModalProps } from '@/interface/CComponent/CComponent.interface'
import CButton from '../CButton'
import CModal from './CModal'

import './CModal.scss'

type CModalSuccessProps = CModalProps & {
	autoCloseMs?: number
	hideFooter?: boolean
}

const CModalSuccess = (_props: CModalSuccessProps) => {
	const {
		onCancel,
		message: _message,
		titleLabel,
		autoCloseMs,
		hideFooter,
		...props
	} = _props
	let message = _message
	if (typeof message !== 'string') {
		message = 'Success'
	}

	const showFooter = !hideFooter && !autoCloseMs

	useEffect(() => {
		if (!autoCloseMs || !onCancel) return

		const timer = setTimeout(() => {
			onCancel({
				stopPropagation: () => {},
			} as React.MouseEvent<HTMLButtonElement>)
		}, autoCloseMs)

		return () => clearTimeout(timer)
	}, [autoCloseMs, onCancel])

	return (
		<CModal
			className="wrapperCModalSuccess"
			onCancel={onCancel}
			footer={
				showFooter
					? [
							<Flex key="back" justify="center">
								<CButton
									onClick={onCancel}
									ctype="oranger"
									style={{ width: 240 }}
								>
									Confirm
								</CButton>
							</Flex>,
						]
					: null
			}
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
