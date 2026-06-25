'use client'

import { IconChevronDown } from '@tabler/icons-react'
import { Popover } from 'antd'
import clsx from 'clsx'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'

import { useModal } from '@/context/ModalContext'

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
	isRequired?: boolean
	error?: string
	disabled?: boolean
	cancelLabel?: string
	confirmLabel?: string
	maxSelectedMessage?: string
	className?: string
}

const CCheckboxSelect = ({
	label,
	placeholder = 'Select',
	options = [],
	value = [],
	onChange,
	maxSelected,
	isRequired,
	error,
	disabled,
	cancelLabel = 'Cancel',
	confirmLabel = 'Select',
	maxSelectedMessage,
	className,
}: CCheckboxSelectProps) => {
	const { openError } = useModal()
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
			setDraft((prev) => {
				if (prev.includes(optionValue)) {
					return prev.filter((item) => item !== optionValue)
				}
				if (maxSelected && prev.length >= maxSelected) {
					openError(
						maxSelectedMessage ||
							`You can only select up to ${maxSelected} items`,
					)
					return prev
				}
				return [...prev, optionValue]
			})
		},
		[maxSelected, maxSelectedMessage, openError],
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
			<div className={classes.list}>
				{options.map((item) => (
					<CSelectionItem
						key={item.value}
						label={item.label}
						checked={draft.includes(item.value)}
						onClick={() => handleToggle(item.value)}
					/>
				))}
			</div>
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
		</div>
	)

	return (
		<div className={clsx(classes.wrapper, className)}>
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
						[classes.triggerDisabled]: disabled,
						[classes.triggerError]: !!error,
					})}
				>
					<span
						className={clsx(classes.triggerText, {
							[classes.triggerPlaceholder]: !isArray(value, 1),
						})}
					>
						{displayText}
					</span>
					<span className={classes.triggerIcon}>
						<IconChevronDown size={20} />
					</span>
				</div>
			</Popover>
			{!!error && <span className={classes.errorText}>{error}</span>}
		</div>
	)
}

export default memo(CCheckboxSelect)
