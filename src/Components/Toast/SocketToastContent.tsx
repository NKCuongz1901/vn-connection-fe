'use client'

import { IconCircleXFilled, IconX } from '@tabler/icons-react'
import { memo } from 'react'
import { toast } from 'react-toastify'

import type { ToastModel } from '@/interface/Toast/Toast.interface'

import classes from './SocketToastContent.module.scss'

type SocketToastContentProps = {
	title?: string
	content?: string
	onClose: () => void
}

function SocketToastContent({
	title,
	content,
	onClose,
}: SocketToastContentProps) {
	return (
		<div className={classes.toast}>
			<div className={classes.statusIcon}>
				<IconCircleXFilled size={32} color="#CD3031" />
			</div>
			<div className={classes.textFrame}>
				{title ? <p className={classes.title}>{title}</p> : null}
				{content ? <p className={classes.content}>{content}</p> : null}
			</div>
			<button
				type="button"
				className={classes.closeBtn}
				onClick={onClose}
				aria-label="Close"
			>
				<IconX size={24} color="#48546b" />
			</button>
		</div>
	)
}

export default memo(SocketToastContent)

export const showMessageDeleteToast = (data: ToastModel) => {
	const { id, title, content } = data

	toast(
		({ closeToast }) => (
			<SocketToastContent
				title={title}
				content={content}
				onClose={() => closeToast()}
			/>
		),
		{
			toastId: id,
			autoClose: 5000,
			closeButton: false,
			hideProgressBar: true,
			className: 'socketToastItem',
		},
	)
}
