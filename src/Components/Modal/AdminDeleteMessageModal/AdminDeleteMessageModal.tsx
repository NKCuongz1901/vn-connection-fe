'use client'

import { IconCircleXFilled } from '@tabler/icons-react'
import { Checkbox } from 'antd'
import clsx from 'clsx'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'

import CModal from '@/Components/Custom/CModal/CModal'

import { getAdminDeleteMessageOptions } from './adminDeleteMessage.utils'
import classes from './AdminDeleteMessageModal.module.scss'

export type BlockType = 'ONE_DAY' | 'THREE_DAYS' | 'FOREVER'

export type AdminDeleteSelection = {
	isReportSpam: boolean
	isDeleteAllFromUser: boolean
	blockType: BlockType | null
}

const EMPTY_SELECTION: AdminDeleteSelection = {
	isReportSpam: false,
	isDeleteAllFromUser: false,
	blockType: null,
}

export interface AdminDeleteMessageModalProps {
	open: boolean
	senderName: string
	onClose: () => void
	onConfirm: (selection: AdminDeleteSelection) => void
}

function AdminDeleteMessageModal({
	open,
	senderName,
	onClose,
	onConfirm,
}: AdminDeleteMessageModalProps) {
	const [selection, setSelection] =
		useState<AdminDeleteSelection>(EMPTY_SELECTION)

	useEffect(() => {
		if (open) {
			setSelection(EMPTY_SELECTION)
		}
	}, [open, senderName])

	const options = useMemo(
		() => getAdminDeleteMessageOptions(senderName),
		[senderName],
	)

	const canSubmit =
		selection.isReportSpam ||
		selection.isDeleteAllFromUser ||
		!!selection.blockType

	const isOptionChecked = useCallback(
		(option: (typeof options)[number]) => {
			if (option.kind === 'toggle') {
				if (option.key === 'report_spam') return selection.isReportSpam
				if (option.key === 'delete_all') return selection.isDeleteAllFromUser
			}
			if (option.kind === 'block') {
				return selection.blockType === option.blockType
			}
			return false
		},
		[selection],
	)

	const handleToggleOption = useCallback((option: (typeof options)[number]) => {
		if (option.kind === 'toggle') {
			if (option.key === 'report_spam') {
				setSelection((prev) => ({
					...prev,
					isReportSpam: !prev.isReportSpam,
				}))
				return
			}
			if (option.key === 'delete_all') {
				setSelection((prev) => ({
					...prev,
					isDeleteAllFromUser: !prev.isDeleteAllFromUser,
				}))
			}
			return
		}

		if (option.kind === 'block') {
			setSelection((prev) => ({
				...prev,
				blockType:
					prev.blockType === option.blockType ? null : option.blockType,
			}))
		}
	}, [])

	const handleConfirm = () => {
		if (!canSubmit) return
		onConfirm(selection)
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
					<div className={classes.title}>Delete 1 message</div>
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
					<div className={classes.sectionLabel}>Additional actions</div>

					{options.map((option) => (
						<div
							key={option.key}
							className={classes.optionRow}
							role="button"
							tabIndex={0}
							onClick={() => handleToggleOption(option)}
							onKeyDown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault()
									handleToggleOption(option)
								}
							}}
						>
							<div
								className={classes.checkboxCol}
								onClick={(e) => e.stopPropagation()}
							>
								<Checkbox
									className={clsx(classes.checkbox)}
									checked={isOptionChecked(option)}
									onChange={() => handleToggleOption(option)}
								/>
							</div>
							<div className={classes.optionLabel}>{option.label}</div>
						</div>
					))}
				</div>

				<div className={classes.footer}>
					<button
						type="button"
						className={classes.deleteBtn}
						disabled={!canSubmit}
						onClick={handleConfirm}
					>
						Delete
					</button>
				</div>
			</div>
		</CModal>
	)
}

export default memo(AdminDeleteMessageModal)
