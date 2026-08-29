'use client'

import { IconLogout } from '@tabler/icons-react'
import { Spin } from 'antd'
import { memo } from 'react'

import CModal from '@/Components/Custom/CModal/CModal'

import classes from './ModalLeaveMiniChat.module.scss'

interface ModalLeaveMiniChatProps {
	loading?: boolean
	onCancel: () => void
	onConfirm: () => void
}

// Confirm leaving an already joined mini-chat room.
const ModalLeaveMiniChat = (props: ModalLeaveMiniChatProps) => {
	const { loading, onCancel, onConfirm } = props

	return (
		<CModal
			closable={false}
			footer={null}
			keyboard={!loading}
			maskClosable={!loading}
			onCancel={loading ? undefined : onCancel}
			styles={{
				content: {
					width: 360,
					minHeight: 0,
					padding: 24,
					borderRadius: 20,
				},
				body: {
					overflow: 'hidden',
				},
			}}
		>
			<div className={classes.content}>
				<IconLogout size={36} stroke={2.5} color="#CD3031" />
				<div className={classes.title}>Leave room</div>
				<div className={classes.message}>
					Too many notifications? Turn them off in Settings. And you’re
					always welcome back!
				</div>
				<button
					type="button"
					className={classes.confirm}
					disabled={loading}
					onClick={onConfirm}
				>
					{loading ? <Spin size="small" /> : 'Leave group'}
				</button>
				<button
					type="button"
					className={classes.cancel}
					disabled={loading}
					onClick={onCancel}
				>
					Cancel
				</button>
			</div>
		</CModal>
	)
}

export default memo(ModalLeaveMiniChat)
