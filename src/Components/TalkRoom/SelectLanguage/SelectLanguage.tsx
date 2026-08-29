'use client'

import { IconChevronDown } from '@tabler/icons-react'
import clsx from 'clsx'
import {
	memo,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
	type CSSProperties,
} from 'react'
import { createPortal } from 'react-dom'

import CButton from '@/Components/Custom/CButton'
import { isArray } from '@/ultis/array'
import TickCircleIcon from '@/svg/TickCircleIcon'

import classes from './SelectLanguage.module.scss'

export type SelectLanguageOption = {
	label: string
	value: string
	flag?: string
}

export type SelectLanguageProps = {
	placeholder?: string
	title?: string
	options?: SelectLanguageOption[]
	value?: string[]
	onChange?: (languageIds: string[]) => void
	disabled?: boolean
	confirmLabel?: string
}

const DROPDOWN_WIDTH = 343
const DROPDOWN_GAP = 4

/** Multi-select language picker with flag list UI for TalkRoom filters */
const SelectLanguage = ({
	placeholder = 'Language',
	title = 'Select language',
	options = [],
	value = [],
	onChange,
	disabled,
	confirmLabel = 'Confirm',
}: SelectLanguageProps) => {
	const [open, setOpen] = useState(false)
	const [draft, setDraft] = useState<string[]>(value)
	const [dropdownStyle, setDropdownStyle] = useState<CSSProperties>({})
	const triggerRef = useRef<HTMLDivElement>(null)
	const dropdownRef = useRef<HTMLDivElement>(null)

	const displayText = useMemo(() => {
		if (!isArray(value, 1)) return placeholder
		return options
			.filter((item) => value.includes(item.value))
			.map((item) => item.label)
			.join(', ')
	}, [value, options, placeholder])

	const updateDropdownPosition = useCallback(() => {
		if (!triggerRef.current) return

		const rect = triggerRef.current.getBoundingClientRect()
		const maxWidth = Math.min(DROPDOWN_WIDTH, window.innerWidth * 0.9)
		const left = Math.min(rect.left, window.innerWidth - maxWidth - 16)

		setDropdownStyle({
			position: 'fixed',
			top: rect.bottom + DROPDOWN_GAP,
			left: Math.max(16, left),
			width: maxWidth,
			zIndex: 1050,
		})
	}, [])

	useEffect(() => {
		if (!open) return

		updateDropdownPosition()

		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as Node
			if (
				!triggerRef.current?.contains(target) &&
				!dropdownRef.current?.contains(target)
			) {
				setOpen(false)
			}
		}

		const handleReposition = () => updateDropdownPosition()

		document.addEventListener('mousedown', handleClickOutside)
		window.addEventListener('resize', handleReposition)
		window.addEventListener('scroll', handleReposition, true)

		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
			window.removeEventListener('resize', handleReposition)
			window.removeEventListener('scroll', handleReposition, true)
		}
	}, [open, updateDropdownPosition])

	/** Sync draft from applied value when opening or when parent value changes while closed */
	useEffect(() => {
		if (!open) {
			setDraft(value)
		}
	}, [open, value])

	const handleToggleOpen = useCallback(() => {
		if (disabled) return
		setOpen((prev) => {
			const next = !prev
			if (next) {
				setDraft(value)
			}
			return next
		})
	}, [disabled, value])

	/** Toggle selection in draft only; filter applies on Confirm */
	const handleToggle = useCallback((optionValue: string) => {
		setDraft((prev) =>
			prev.includes(optionValue)
				? prev.filter((item) => item !== optionValue)
				: [...prev, optionValue],
		)
	}, [])

	/** Apply draft selection and close dropdown */
	const handleConfirm = useCallback(() => {
		onChange?.(draft)
		setOpen(false)
	}, [draft, onChange])

	const dropdownContent = (
		<div ref={dropdownRef} className={classes.dropdown} style={dropdownStyle}>
			<div className={classes.panel}>
				<div className={classes.header}>
					<span className={classes.title}>{title}</span>
					<div className={classes.divider} />
				</div>
				<div className={classes.list}>
					{options.map((item) => {
						const checked = draft.includes(item.value)
						return (
							<div
								key={item.value}
								className={classes.item}
								role="checkbox"
								aria-checked={checked}
								tabIndex={0}
								onClick={() => handleToggle(item.value)}
								onKeyDown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') {
										e.preventDefault()
										handleToggle(item.value)
									}
								}}
							>
								<div className={classes.itemInfo}>
									{item.flag && (
										<div className={classes.flagWrap}>
											<img
												src={item.flag}
												alt={item.label}
												className={classes.flag}
											/>
										</div>
									)}
									<span className={classes.label}>{item.label}</span>
								</div>
								<span className={classes.checkIcon}>
									{checked ? (
										<TickCircleIcon fill="#48546B" width={24} height={24} />
									) : (
										<span className={classes.checkIconOutline} />
									)}
								</span>
							</div>
						)
					})}
				</div>
				<div className={classes.footer}>
					<CButton ctype="oranger" onClick={handleConfirm}>
						{confirmLabel}
					</CButton>
				</div>
			</div>
		</div>
	)

	return (
		<div className={classes.wrapper}>
			<div
				ref={triggerRef}
				className={clsx(classes.trigger, {
					[classes.triggerDisabled]: disabled,
					[classes.triggerOpen]: open,
				})}
				onClick={handleToggleOpen}
			>
				<span
					className={clsx(classes.triggerText, {
						[classes.triggerPlaceholder]: !isArray(value, 1),
					})}
				>
					{displayText}
				</span>
				<span className={classes.triggerIcon}>
					<IconChevronDown size={16} />
				</span>
			</div>

			{open &&
				typeof document !== 'undefined' &&
				createPortal(dropdownContent, document.body)}
		</div>
	)
}

export default memo(SelectLanguage)
