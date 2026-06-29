'use client'

import dayjs from 'dayjs'
import { IconX } from '@tabler/icons-react'
import { memo } from 'react'

import CAvatar from '@/Components/Custom/CAvatar'
import CModal from '@/Components/Custom/CModal/CModal'

import classes from './ModalViewThought.module.scss'

const formatThoughtTimeShort = (ts?: string | number | null): string => {
	if (ts === undefined || ts === null || ts === '') return ''
	const target = dayjs(typeof ts === 'string' ? Number(ts) : ts)
	if (!target.isValid()) return ''

	const now = dayjs()
	const min = now.diff(target, 'minute')
	if (min < 1) return '1m'
	if (min < 60) return `${min}m`

	const hr = now.diff(target, 'hour')
	if (hr < 24) return `${hr}h`

	const days = now.diff(target, 'day')
	return `${days}d`
}

export interface ModalViewThoughtProps {
	open: boolean
	onClose: () => void
	thought: string
	avatar?: string
	name?: string
	updatedAt?: string | number | null
	showFooter?: boolean
	onUpdate?: () => void
	onDelete?: () => void | Promise<void>
	loading?: boolean
}

function ModalViewThought({
	open,
	onClose,
	thought,
	avatar,
	name = 'You',
	updatedAt,
	showFooter = true,
	onUpdate,
	onDelete,
	loading = false,
}: ModalViewThoughtProps) {
	if (!open) return null

	const timeLabel = formatThoughtTimeShort(updatedAt)

	const handleDelete = async () => {
		if (loading) return
		await onDelete?.()
	}

	const handleUpdate = () => {
		onUpdate?.()
	}

	return (
		<CModal
			open
			centered
			closable={false}
			footer={null}
			onCancel={onClose}
			styles={{
				content: {
					width: 375,
					maxWidth: 'calc(100vw - 32px)',
					padding: 0,
					borderRadius: 24,
					boxShadow: '-2px 0px 12px 0px rgba(0, 13, 25, 0.1)',
					overflow: 'hidden',
				},
				body: {
					padding: 0,
				},
			}}
		>
			<div className={classes.wrapper}>
				<div className={classes.header}>
					<h2 className={classes.title}>Share your thought</h2>
					<button
						type="button"
						className={classes.closeBtn}
						aria-label="Close"
						onClick={onClose}
					>
						<IconX size={20} stroke={1.5} />
					</button>
				</div>

				<div className={classes.divider} />

				<div className={classes.body}>
					<div className={classes.content}>
						<div className={classes.thoughtBubble}>{thought}</div>
						<div className={classes.avatarWrap}>
							<CAvatar src={avatar} size={80} />
						</div>
						<div className={classes.info}>
							<span className={classes.infoName}>{name}</span>
							{timeLabel && (
								<>
									<span className={classes.infoDivider} />
									<span className={classes.infoTime}>{timeLabel}</span>
								</>
							)}
						</div>
					</div>
				</div>

				{showFooter && (
					<div className={classes.footer}>
						<button
							type="button"
							className={classes.deleteBtn}
							disabled={loading}
							onClick={handleDelete}
						>
							Delete
						</button>
						<button
							type="button"
							className={classes.updateBtn}
							disabled={loading}
							onClick={handleUpdate}
						>
							Update your note
						</button>
					</div>
				)}
			</div>
		</CModal>
	)
}

export default memo(ModalViewThought)
