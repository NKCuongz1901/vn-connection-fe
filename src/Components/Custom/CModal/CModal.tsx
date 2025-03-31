import { Modal } from 'antd'
import { memo } from 'react'

import { CModalProps } from '@/interface/CComponent/CComponent.interface'

import './CModal.scss'

const CModal = (_props: CModalProps) => {
	const { children, styles: _styles, ...props } = _props
	const { content, body, ...styles } = _styles || {}
	return (
		<Modal
			className="wrapperCModal"
			centered
			open={true}
			style={{}}
			styles={{
				content: {
					borderRadius: 24,
					minHeight: 240,
					maxHeight: '70vh',
					display: 'flex',
					justifyContent: 'space-between',
					flexDirection: 'column',
					maxWidth: '100%',
					...content,
				},
				body: {
					display: 'flex',
					flexDirection: 'column',
					flex: 1,
					overflow: 'auto',
					...body,
				},
				...styles,
			}}
			{...props}
		>
			{children}
		</Modal>
	)
}

export default memo(CModal)
