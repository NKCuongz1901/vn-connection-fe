import { Modal } from 'antd'
import { memo } from 'react'

import { CModalProps } from '@/interface/CComponent/CComponent.interface'

const CModal = (_props: CModalProps) => {
	const { children, ...props } = _props
	return (
		<Modal
			centered
			open={true}
			style={{}}
			styles={{
				content: {
					borderRadius: 24,
					minHeight: 240,
					display: 'flex',
					justifyContent: 'space-between',
					flexDirection: 'column',
				},
				body: {
					display: 'flex',
					flexDirection: 'column',
					flex: 1,
				},
			}}
			{...props}
		>
			{children}
		</Modal>
	)
}

export default memo(CModal)
