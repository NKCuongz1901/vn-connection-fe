'use client'

import { IconX } from '@tabler/icons-react'
import { Spin } from 'antd'
import { memo } from 'react'

import CModal from '@/Components/Custom/CModal/CModal'
import UserTagIcon from '@/svg/Talkroom/UserTagIcon'

import classes from './TalkRoomTransferHostRoleModal.module.scss'

export type TalkRoomTransferHostSpeakerOption = {
	slotId: 1 | 2
	label: string
	disabled?: boolean
	userId?: string
}

export interface TalkRoomTransferHostRoleModalProps {
	open: boolean
	loading?: boolean
	speakerOptions?: TalkRoomTransferHostSpeakerOption[]
	onClose: () => void
	onAssignSpeaker?: (slotId: 1 | 2) => void | Promise<void>
	onSkipAssigning?: () => void | Promise<void>
}

/** Modal for host to transfer role to a guest speaker before leaving. */
function TalkRoomTransferHostRoleModal({
	open,
	loading = false,
	speakerOptions = [],
	onClose,
	onAssignSpeaker,
	onSkipAssigning,
}: TalkRoomTransferHostRoleModalProps) {
	if (!open) return null

	const defaultOptions: TalkRoomTransferHostSpeakerOption[] = [
		{ slotId: 1, label: 'Assign to speaker 1' },
		{ slotId: 2, label: 'Assign to speaker 2' },
	]
	const options = speakerOptions.length > 0 ? speakerOptions : defaultOptions

	return (
		<CModal
			open
			centered
			closable={false}
			footer={null}
			onCancel={loading ? undefined : onClose}
			styles={{
				content: {
					width: 343,
					maxWidth: 'calc(100vw - 32px)',
					padding: 0,
					borderRadius: 24,
					overflow: 'hidden',
				},
				body: {
					padding: 0,
				},
			}}
		>
			<div className={classes.wrapper}>
				<button
					type="button"
					className={classes.closeButton}
					disabled={loading}
					onClick={onClose}
					aria-label="Close"
				>
					<IconX size={20} />
				</button>

				<div className={classes.iconSection}>
					<UserTagIcon width={40} height={32} />
				</div>

				<div className={classes.info}>
					<h2 className={classes.title}>Transfer host role</h2>
				</div>

				<div className={classes.footer}>
					{options.map((option) => (
						<button
							key={option.slotId}
							type="button"
							className={classes.assignBtn}
							disabled={loading || option.disabled}
							onClick={() => onAssignSpeaker?.(option.slotId)}
						>
							{loading ? <Spin size="small" /> : option.label}
						</button>
					))}

					<button
						type="button"
						className={classes.skipBtn}
						disabled={loading}
						onClick={() => onSkipAssigning?.()}
					>
						Skip assigning
					</button>
				</div>
			</div>
		</CModal>
	)
}

export default memo(TalkRoomTransferHostRoleModal)
