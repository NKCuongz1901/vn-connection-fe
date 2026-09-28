'use client'

import { memo, useState } from 'react'
import { toast } from 'react-toastify'

import { sendMessageById } from '@/apis/conversationApis'
import CButton from '@/Components/Custom/CButton'
import ModalMyFriend from '@/Components/Friend/ModalMyFriend'
import { copyToClipboard } from '@/ultis/string'

type BookShareModalProps = {
	open: boolean
	/** share_link of the book (falls back to the page URL upstream) */
	url: string
	onClose: () => void
}

/** UniVini share: copy the book link, or send it to a friend in chat */
function BookShareModal({ open, url, onClose }: BookShareModalProps) {
	const [sending, setSending] = useState<Record<string, boolean>>({})
	const [sent, setSent] = useState<Record<string, boolean>>({})

	if (!open) return null

	const onCopy = () => {
		copyToClipboard(url)
		toast.success('Link copied successfully!')
	}

	const onSend = async (friendId: string) => {
		setSending((prev) => ({ ...prev, [friendId]: true }))
		try {
			const res = (await sendMessageById({
				receiver_id: friendId,
				message: { content: url, type: 'TEXT' },
			})) as { code?: number }
			if (res?.code === 200) setSent((prev) => ({ ...prev, [friendId]: true }))
		} catch {
			toast.error('Could not share the book. Please try again.')
		} finally {
			setSending((prev) => ({ ...prev, [friendId]: false }))
		}
	}

	return (
		<ModalMyFriend
			title="Share"
			onClose={onClose}
			onCopy={onCopy}
			customComp={(item: { friend?: { id?: string } }) => {
				const id = item?.friend?.id
				if (!id) return null
				return (
					<CButton
						ctype="oranger"
						onClick={() => onSend(id)}
						loading={sending[id]}
						disabled={sent[id]}
					>
						{sent[id] ? 'Sent' : 'Share'}
					</CButton>
				)
			}}
		/>
	)
}

export default memo(BookShareModal)
