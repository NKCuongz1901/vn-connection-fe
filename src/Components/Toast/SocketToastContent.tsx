'use client'

import { IconCircleXFilled, IconX } from '@tabler/icons-react'
import clsx from 'clsx'
import { memo } from 'react'
import { toast } from 'react-toastify'

import type { ToastModel } from '@/interface/Toast/Toast.interface'
import TickCircleIcon from '@/svg/TickCircleIcon'

import classes from './SocketToastContent.module.scss'

export type SocketToastVariant = 'error' | 'success'

type SocketToastContentProps = {
	title?: string
	content?: string
	variant?: SocketToastVariant
	showClose?: boolean
	onClose?: () => void
}

function SocketToastContent({
	title,
	content,
	variant = 'error',
	showClose = variant === 'error',
	onClose,
}: SocketToastContentProps) {
	return (
		<div
			className={clsx(classes.toast, {
				[classes.toastError]: variant === 'error',
				[classes.toastSuccess]: variant === 'success',
			})}
		>
			<div className={classes.statusIcon}>
				{variant === 'success' ? (
					<TickCircleIcon fill="#1B8024" width={32} height={32} />
				) : (
					<IconCircleXFilled size={32} color="#CD3031" />
				)}
			</div>
			<div className={classes.textFrame}>
				{title ? <p className={classes.title}>{title}</p> : null}
				{content ? <p className={classes.content}>{content}</p> : null}
			</div>
			{showClose && onClose ? (
				<button
					type="button"
					className={classes.closeBtn}
					onClick={onClose}
					aria-label="Close"
				>
					<IconX size={24} color="#48546b" />
				</button>
			) : null}
		</div>
	)
}

export default memo(SocketToastContent)

type ShowSocketToastOptions = {
	title: string
	content?: string
	variant?: SocketToastVariant
	toastId?: string
	showClose?: boolean
}

/** Shows a pill toast via react-toastify with error or success styling. */
export const showSocketToast = ({
	title,
	content,
	variant = 'error',
	toastId,
	showClose,
}: ShowSocketToastOptions) => {
	toast(
		({ closeToast }) => (
			<SocketToastContent
				title={title}
				content={content}
				variant={variant}
				showClose={showClose ?? variant === 'error'}
				onClose={() => closeToast()}
			/>
		),
		{
			toastId,
			autoClose: 5000,
			closeButton: false,
			hideProgressBar: true,
			className: 'socketToastItem',
		},
	)
}

export const TALK_ROOM_SPEAKER_PROMOTE_TOAST_ID = 'talkroom-speaker-promote'
export const TALK_ROOM_AUTO_CLOSE_TOAST_ID = 'talkroom-auto-close'
export const TALK_ROOM_USER_KICKED_TOAST_ID = 'talkroom-user-kicked'

export const showTalkRoomSpeakerPromoteToast = () => {
	showSocketToast({
		title: "Mic is on. You're a speaker now.",
		content: 'Tap the mic to mute anytime',
		variant: 'success',
		toastId: TALK_ROOM_SPEAKER_PROMOTE_TOAST_ID,
		showClose: false,
	})
}

export const showTalkRoomAutoCloseToast = () => {
	showSocketToast({
		title: 'Room closed automatically',
		content: 'Room closed automatically when no one joined in 5 minutes',
		variant: 'error',
		toastId: TALK_ROOM_AUTO_CLOSE_TOAST_ID,
	})
}

export const showTalkRoomUserKickedToast = () => {
	showSocketToast({
		title: 'You have been removed from the room',
		content: 'You cannot rejoin this room session',
		variant: 'error',
		toastId: TALK_ROOM_USER_KICKED_TOAST_ID,
	})
}

export const showMessageDeleteToast = (data: ToastModel) => {
	const { id, title, content } = data

	showSocketToast({
		title,
		content,
		variant: 'error',
		toastId: id,
	})
}
