'use client'

import { IconCircleXFilled } from '@tabler/icons-react'
import { Radio } from 'antd'
import clsx from 'clsx'
import { memo, useEffect, useMemo, useState } from 'react'

import CModal from '@/Components/Custom/CModal/CModal'

import {
	getReportReasonPayload,
	ReportContentItem,
} from './adminDeleteMessage.utils'
import classes from './AdminDeleteMessageReasonModal.module.scss'

export type AdminDeleteReason = {
	title: string
	content: string
}

export interface AdminDeleteMessageReasonModalProps {
	open: boolean
	options: ReportContentItem[]
	loading?: boolean
	onClose: () => void
	onConfirm: (reason: AdminDeleteReason) => void
}

function AdminDeleteMessageReasonModal({
	open,
	options,
	loading,
	onClose,
	onConfirm,
}: AdminDeleteMessageReasonModalProps) {
	const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

	useEffect(() => {
		if (open) {
			setSelectedIndex(options.length === 1 ? 0 : null)
		}
	}, [open, options.length])

	const selectedReason = useMemo(() => {
		if (selectedIndex === null || !options[selectedIndex]) return null
		return getReportReasonPayload(options[selectedIndex])
	}, [options, selectedIndex])

	const canSubmit = !!selectedReason?.title

	const handleConfirm = () => {
		if (!selectedReason?.title) return
		onConfirm(selectedReason)
	}

	const handleSelectOption = (index: number) => {
		setSelectedIndex(index)
	}

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
					width: 375,
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
				<div className={classes.header}>
					<div className={classes.title}>Send delete reasons</div>
					{/* <button
						type="button"
						className={classes.closeBtn}
						aria-label="Close"
						onClick={onClose}
					>
						<IconCircleXFilled size={20} />
					</button> */}
				</div>

				<div className={classes.divider} />

				<div className={classes.body}>
					{loading ? (
						<div className={classes.empty}>Loading...</div>
					) : options.length ? (
						<Radio.Group
							value={selectedIndex ?? undefined}
							onChange={(e) => setSelectedIndex(e.target.value)}
							className={classes.list}
						>
							{options.map((option, index) => {
								const title = option.title || option.label || ''
								const description = option.content || option.description || ''

								return (
									<div
										key={`${title}-${index}`}
										className={classes.optionRow}
										role="button"
										tabIndex={0}
										onClick={() => handleSelectOption(index)}
										onKeyDown={(e) => {
											if (e.key === 'Enter' || e.key === ' ') {
												e.preventDefault()
												handleSelectOption(index)
											}
										}}
									>
										<div
											className={classes.radioCol}
											onClick={(e) => e.stopPropagation()}
										>
											<Radio
												className={clsx(classes.radio)}
												value={index}
												checked={selectedIndex === index}
												onChange={() => handleSelectOption(index)}
											/>
										</div>
										<div className={classes.optionText}>
											<span className={classes.optionTitle}>{title}</span>
											{description && (
												<span className={classes.optionDesc}>
													{description}
												</span>
											)}
										</div>
									</div>
								)
							})}
						</Radio.Group>
					) : (
						<div className={classes.empty}>No report reasons available.</div>
					)}
				</div>

				<div className={classes.footer}>
					<button
						type="button"
						className={classes.submitBtn}
						disabled={!canSubmit || loading}
						onClick={handleConfirm}
					>
						Send to user
					</button>
				</div>
			</div>
		</CModal>
	)
}

export default memo(AdminDeleteMessageReasonModal)
