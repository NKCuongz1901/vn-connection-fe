'use client'

import { IconChevronDown } from '@tabler/icons-react'
import { Popover } from 'antd'
import clsx from 'clsx'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'

import CButton from '@/Components/Custom/CButton'
import CRadioItem from '@/Components/Custom/CRadioItem'

import classes from './CRadioSelect.module.scss'

export type CRadioSelectOption = {
	label: string
	value: string
	[key: string]: any
}

export type CRadioSelectProps = {
	label?: string
	placeholder?: string
	options?: CRadioSelectOption[]
	value?: string
	onChange?: (value: string) => void
	isRequired?: boolean
	error?: string
	disabled?: boolean
	className?: string
	/** Chọn xong đóng popover ngay (mặc định). false = cần bấm Select */
	immediateSelect?: boolean
	cancelLabel?: string
	confirmLabel?: string
}

const CRadioSelect = ({
	label,
	placeholder = 'Select',
	options = [],
	value,
	onChange,
	isRequired,
	error,
	disabled,
	className,
	immediateSelect = true,
	cancelLabel = 'Cancel',
	confirmLabel = 'Select',
}: CRadioSelectProps) => {
	const [open, setOpen] = useState(false)
	const [draft, setDraft] = useState<string | undefined>(value)

	useEffect(() => {
		if (!open) {
			setDraft(value)
		}
	}, [open, value])

	const displayText = useMemo(() => {
		if (!value) return placeholder
		return options.find((item) => item.value === value)?.label || placeholder
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

	const handleSelect = useCallback(
		(optionValue: string) => {
			setDraft(optionValue)
			if (immediateSelect) {
				onChange?.(optionValue)
				setOpen(false)
			}
		},
		[immediateSelect, onChange],
	)

	const handleCancel = useCallback(() => {
		setDraft(value)
		setOpen(false)
	}, [value])

	const handleConfirm = useCallback(() => {
		if (draft) {
			onChange?.(draft)
		}
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
					<CRadioItem
						key={item.value}
						label={item.label}
						checked={draft === item.value}
						onClick={() => handleSelect(item.value)}
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
						<CButton
							ctype="oranger"
							onClick={handleConfirm}
							disabled={!draft}
						>
							{confirmLabel}
						</CButton>
					</div>
				</div>
			)}
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
							[classes.triggerPlaceholder]: !value,
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

export default memo(CRadioSelect)
