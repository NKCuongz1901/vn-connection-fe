'use client'

import { IconX } from '@tabler/icons-react'
import { memo } from 'react'

import CButton from '@/Components/Custom/CButton'
import CModal from '@/Components/Custom/CModal/CModal'
import MicroPhoneIcon from '@/svg/MicroPhoneIcon'
import ShareRoomIcon from '@/svg/Talkroom/ShareRoomIcon'
import WorldIcon from '@/svg/WorldIcon'

import classes from './ModalTalkRoomWelcome.module.scss'

const FEATURE_ITEMS = [
	{
		key: 'duration',
		icon: <MicroPhoneIcon fill="#006B35" />,
		text: 'Every Talk Room lasts 20 minutes, feel free to join or create one anytime!',
	},
	{
		key: 'worldwide',
		icon: <WorldIcon fill="#006B35" />,
		text: 'Meet people worldwide and build confidence.',
	},
	{
		key: 'host',
		icon: <ShareRoomIcon />,
		text: 'Host rooms, share your voice, inspire others.',
	},
]

export interface ModalTalkRoomWelcomeProps {
	open: boolean
	onClose: () => void
	onConfirm: () => void
}

function ModalTalkRoomWelcome({
	open,
	onClose,
	onConfirm,
}: ModalTalkRoomWelcomeProps) {
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
					width: 660,
					maxWidth: 'calc(100vw - 32px)',
					maxHeight: '90vh',
					minHeight: 'auto',
					padding: 0,
					borderRadius: 8,
					overflow: 'hidden',
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'flex-start',
				},
				body: {
					padding: 0,
					flex: 1,
					minHeight: 0,
					overflow: 'hidden',
					display: 'flex',
					flexDirection: 'column',
				},
			}}
		>
			<div className={classes.wrapper}>
				<div className={classes.header}>
					<h2 className={classes.title}>Talk Room</h2>
					<button
						type="button"
						className={classes.closeBtn}
						aria-label="Close"
						onClick={onClose}
					>
						<IconX size={16} />
					</button>
				</div>

				<div className={classes.body}>
					<div className={classes.welcomeSection}>
						<img
							src="/images/talkroom.png"
							alt=""
							className={classes.illustration}
						/>

						<div className={classes.welcomeTexts}>
							<h3 className={classes.welcomeTitle}>
								Welcome to{' '}
								<span className={classes.welcomeHighlight}>Talk Room</span>
							</h3>
							<p className={classes.welcomeDescription}>
								Speak freely and Exchange languages
								<br />
								and connect with the world.
							</p>
						</div>
					</div>

					<div className={classes.featureList}>
						{FEATURE_ITEMS.map((item) => (
							<div key={item.key} className={classes.featureItem}>
								<div className={classes.featureIconWrap}>
									<div className={classes.featureIcon}>{item.icon}</div>
								</div>
								<p className={classes.featureText}>{item.text}</p>
							</div>
						))}
					</div>
				</div>

				<div className={classes.footer}>
					<CButton
						ctype="oranger"
						className={classes.startBtn}
						onClick={onConfirm}
					>
						Let&apos;s get started
					</CButton>
				</div>
			</div>
		</CModal>
	)
}

export default memo(ModalTalkRoomWelcome)
