'use client'

import { IconChevronDown } from '@tabler/icons-react'
import { Popover } from 'antd'
import clsx from 'clsx'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'

import { isArray } from '@/ultis/array'

import CButton from '@/Components/Custom/CButton'
import CSelectionItem from '@/Components/Custom/CSelectionItem'

import classes from './CCheckboxSelect.module.scss'

export type CCheckboxSelectOption = {
	label: string
	value: string
	[key: string]: any
}

export type CCheckboxSelectProps = {
	label?: string
	placeholder?: string
	options?: CCheckboxSelectOption[]
	value?: string[]
	onChange?: (values: string[]) => void
	maxSelected?: number
	onMaxSelectedExceeded?: () => void
	isRequired?: boolean
	error?: string
	disabled?: boolean
	cancelLabel?: string
	confirmLabel?: string
	className?: string
	/** Chọn xong áp dụng ngay, không cần bấm Select */
	immediateSelect?: boolean
	/** compact pill style for filter chips */
	variant?: 'default' | 'chip'
}

const CCheckboxSelect = ({
	label,
	placeholder = 'Select',
	options = [],
	value = [],
	onChange,
	maxSelected,
	onMaxSelectedExceeded,
	isRequired,
	error,
	disabled,
	cancelLabel = 'Cancel',
	confirmLabel = 'Select',
	className,
	immediateSelect = false,
	variant = 'default',
}: CCheckboxSelectProps) => {
	const [open, setOpen] = useState(false)
	const [draft, setDraft] = useState<string[]>(value)

	useEffect(() => {
		if (!open) {
			setDraft(value)
		}
	}, [open, value])

	const displayText = useMemo(() => {
		if (!isArray(value, 1)) return placeholder
		return options
			.filter((item) => value.includes(item.value))
			.map((item) => item.label)
			.join(', ')
	}, [value, options, placeholder])

	const handleOpenChange = useCallback(
		(nextOpen: boolean) => {
			if (disabled) return
			if (nextOpen) {
				setDraft(value)
			}
			setOpen(nextOpen)
		},
		[disabled, value],
	)

	const handleToggle = useCallback(
		(optionValue: string) => {
			const isDeselecting = draft.includes(optionValue)
			const isAtMax =
				!isDeselecting && !!maxSelected && draft.length >= maxSelected

			if (isAtMax) {
				setOpen(false)
				onMaxSelectedExceeded?.()
				return
			}

			setDraft((prev) => {
				const next = isDeselecting
					? prev.filter((item) => item !== optionValue)
					: [...prev, optionValue]
				if (immediateSelect) {
					onChange?.(next)
				}
				return next
			})
		},
		[draft, maxSelected, onMaxSelectedExceeded, immediateSelect, onChange],
	)

	const handleCancel = useCallback(() => {
		setDraft(value)
		setOpen(false)
	}, [value])

	const handleConfirm = useCallback(() => {
		onChange?.(draft)
		setOpen(false)
	}, [draft, onChange])

	const panelContent = (
		<div className={classes.panel}>
			<div
				className={clsx(classes.list, {
					[classes.listWithFooter]: !immediateSelect,
				})}
			>
				{options.map((item) => (
					<CSelectionItem
						key={item.value}
						label={item.label}
						checked={draft.includes(item.value)}
						onClick={() => handleToggle(item.value)}
					/>
				))}
			</div>
			{!immediateSelect && (
				<div className={classes.footer}>
					<div className={classes.footerBtn}>
						<CButton ctype="disabled" onClick={handleCancel}>
							{cancelLabel}
						</CButton>
					</div>
					<div className={classes.footerBtn}>
						<CButton ctype="oranger" onClick={handleConfirm}>
							{confirmLabel}
						</CButton>
					</div>
				</div>
			)}
		</div>
	)

	const isChip = variant === 'chip'

	return (
		<div
			className={clsx(classes.wrapper, className, {
				[classes.wrapperChip]: isChip,
			})}
		>
			{label && (
				<div className={classes.label}>
					{label}
					{isRequired && <span className="error"> *</span>}
				</div>
			)}
			<Popover
				trigger="click"
				placement="bottomLeft"
				open={open}
				onOpenChange={handleOpenChange}
				overlayClassName={classes.popover}
				arrow={false}
				content={panelContent}
			>
				<div
					className={clsx(classes.trigger, {
						[classes.triggerChip]: isChip,
						[classes.triggerDisabled]: disabled,
						[classes.triggerError]: !!error,
					})}
				>
					<span
						className={clsx(classes.triggerText, {
							[classes.triggerPlaceholder]: !isArray(value, 1) && !isChip,
							[classes.triggerTextChip]: isChip,
						})}
					>
						{displayText}
					</span>
					<span
						className={clsx(classes.triggerIcon, {
							[classes.triggerIconChip]: isChip,
						})}
					>
						<IconChevronDown size={isChip ? 16 : 20} />
					</span>
				</div>
			</Popover>
			{!!error && <span className={classes.errorText}>{error}</span>}
		</div>
	)
}

export default memo(CCheckboxSelect)
