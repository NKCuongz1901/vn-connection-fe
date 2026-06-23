'use client'

import { IconX } from '@tabler/icons-react'
import { memo } from 'react'

import CButton from '@/Components/Custom/CButton'
import CModal from '@/Components/Custom/CModal/CModal'
import HeadPhoneIcon from '@/svg/Talkroom/HeadPhoneIcon'

import classes from './ModalTalkRoomSoundQuality.module.scss'

export interface ModalTalkRoomSoundQualityProps {
	open: boolean
	onClose: () => void
	onConfirm: () => void
}

function ModalTalkRoomSoundQuality({
	open,
	onClose,
	onConfirm,
}: ModalTalkRoomSoundQualityProps) {
	if (!open) return null

	return (
		<CModal
			open
			centered
			closable={false}
			footer={null}
			onCancel={onClose}
			styles={{
				content: {
					width: 352,
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
					className={classes.closeBtn}
					aria-label="Close"
					onClick={onClose}
				>
					<IconX size={20} />
				</button>

				<div className={classes.body}>
					<div className={classes.iconWrap}>
						<HeadPhoneIcon />
					</div>

					<div className={classes.info}>
						<h2 className={classes.title}>For best sound quality</h2>
						<p className={classes.description}>
							Stay in a quiet place or use headphones for clearer audio before
							joining.
						</p>
					</div>
				</div>

				<div className={classes.footer}>
					<CButton
						ctype="oranger"
						className={classes.gotItBtn}
						onClick={onConfirm}
					>
						Got it
					</CButton>
				</div>
			</div>
		</CModal>
	)
}

export default memo(ModalTalkRoomSoundQuality)
