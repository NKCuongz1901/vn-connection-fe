'use client'

import { IconCloud, IconX } from '@tabler/icons-react'
import { memo, useEffect, useState } from 'react'

import CButton from '@/Components/Custom/CButton'
import CModal from '@/Components/Custom/CModal/CModal'

import classes from './ModalShareThought.module.scss'

const THOUGHT_MAX_LENGTH = 40

export interface ModalShareThoughtProps {
	open: boolean
	onClose: () => void
	initialThought?: string
	onShare?: (thought: string) => void | Promise<void>
	loading?: boolean
}

function ModalShareThought({
	open,
	onClose,
	initialThought = '',
	onShare,
	loading = false,
}: ModalShareThoughtProps) {
	const [thought, setThought] = useState(initialThought)

	useEffect(() => {
		if (open) {
			setThought(initialThought)
		}
	}, [open, initialThought])

	if (!open) return null

	const handleChange = (value: string) => {
		setThought(value.slice(0, THOUGHT_MAX_LENGTH))
	}

	const handleShare = async () => {
		if (!canShare || loading) return
		await onShare?.(thought.trim())
	}

	const canShare = thought.trim().length > 0

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
					<div className={classes.inputGroup}>
						<span className={classes.counter}>
							{thought.length}/{THOUGHT_MAX_LENGTH}
						</span>
						<div className={classes.inputWrap}>
							<IconCloud
								size={20}
								stroke={1.5}
								className={classes.cloudIcon}
							/>
							<input
								type="text"
								className={classes.input}
								value={thought}
								placeholder="hmm"
								maxLength={THOUGHT_MAX_LENGTH}
								onChange={(e) => handleChange(e.target.value)}
							/>
						</div>
					</div>

					<p className={classes.helperText}>
						People can see your note until you update it.
					</p>
				</div>

				<div className={classes.footer}>
					<CButton
						ctype="oranger"
						className={classes.shareBtn}
						disabled={!canShare || loading}
						loading={loading}
						onClick={handleShare}
					>
						Share now
					</CButton>
				</div>
			</div>
		</CModal>
	)
}

export default memo(ModalShareThought)
