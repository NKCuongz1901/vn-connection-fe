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

export const MINI_CHAT_JOINED_TOAST_ID = 'mini-chat-joined'
export const MINI_CHAT_LEFT_TOAST_ID = 'mini-chat-left'

export const showMiniChatJoinedToast = () => {
	showSocketToast({
		title: 'You joined this room',
		variant: 'success',
		toastId: MINI_CHAT_JOINED_TOAST_ID,
		showClose: false,
	})
}

export const showMiniChatLeftToast = () => {
	showSocketToast({
		title: 'You left this room',
		variant: 'error',
		toastId: MINI_CHAT_LEFT_TOAST_ID,
		showClose: false,
	})
}

export const TALK_ROOM_SPEAKER_PROMOTE_TOAST_ID = 'talkroom-speaker-promote'
export const TALK_ROOM_AUTO_CLOSE_TOAST_ID = 'talkroom-auto-close'
export const TALK_ROOM_USER_KICKED_TOAST_ID = 'talkroom-user-kicked'
export const TALK_ROOM_INVITE_SENT_TOAST_ID = 'talkroom-invite-sent'
export const TALK_ROOM_LISTENER_REJECT_INVITE_TOAST_ID =
	'talkroom-listener-reject-invite'
export const TALK_ROOM_RAISE_HAND_TOAST_ID = 'talkroom-raise-hand'
export const TALK_ROOM_NO_SPEAKER_SLOT_TOAST_ID = 'talkroom-no-speaker-slot'

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

export const showTalkRoomInviteSentToast = () => {
	showSocketToast({
		title: 'Speaker invitation sent',
		variant: 'success',
		toastId: TALK_ROOM_INVITE_SENT_TOAST_ID,
		showClose: false,
	})
}

export const showTalkRoomListenerRejectInviteToast = (userName?: string) => {
	const name = userName?.trim() || 'This user'
	showSocketToast({
		title: `${name} chose not to speak`,
		variant: 'error',
		toastId: TALK_ROOM_LISTENER_REJECT_INVITE_TOAST_ID,
	})
}

export const showTalkRoomRaiseHandToast = () => {
	showSocketToast({
		title: 'You have raised your hand',
		variant: 'success',
		toastId: TALK_ROOM_RAISE_HAND_TOAST_ID,
		showClose: false,
	})
}

export const showTalkRoomNoSpeakerSlotToast = () => {
	showSocketToast({
		title: 'The room has no available slot for new speakers',
		variant: 'error',
		toastId: TALK_ROOM_NO_SPEAKER_SLOT_TOAST_ID,
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
