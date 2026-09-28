'use client'

import { IconX } from '@tabler/icons-react'
import { Flex, Input } from 'antd'
import { memo, useCallback, useState } from 'react'

import { CInputProps } from '@/interface/CComponent/CComponent.interface'

import classes from './CInputMap.module.scss'
import CGGMap from '../CGGMap/CGGMap'

interface CInputMapProps {
	longitude: number
	latitude: number
	title?: string
	onSubmitModal?: any
	onInputClick?: () => void
	onClear?: () => void
	open?: boolean
	onOpenChange?: (open: boolean) => void
}

const CInputMap = (_props: CInputMapProps & CInputProps) => {
	const {
		title,
		error,
		label,
		isRequired,
		style,
		onSubmitModal,
		longitude,
		latitude,
		onInputClick,
		onClear,
		open,
		onOpenChange,
		value,
		suffix,
		...props
	} = _props
	const [internalOpen, setInternalOpen] = useState(false)
	const isControlled = open !== undefined
	const openModal = isControlled ? open : internalOpen
	const hasValue = typeof value === 'string' ? value.trim().length > 0 : !!value
	const setOpenModal = useCallback(
		(next: boolean) => {
			if (isControlled) {
				onOpenChange?.(next)
			} else {
				setInternalOpen(next)
			}
		},
		[isControlled, onOpenChange],
	)
	const status = error ? 'error' : ''
	const handleCloseModal = useCallback(
		(e) => {
			e?.stopPropagation?.()
			setOpenModal(false)
		},
		[setOpenModal],
	)
	const handleInputClick = useCallback(() => {
		if (onInputClick) {
			onInputClick()
			return
		}
		setOpenModal(true)
	}, [onInputClick, setOpenModal])
	/** Clears the selected address without opening the map modal. */
	const handleClear = useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation()
			onClear?.()
		},
		[onClear],
	)
	return (
		<Flex
			vertical
			gap={4}
			className={classes.layout}
			onClick={handleInputClick}
		>
			{label && (
				<span className="bold">
					{label} {isRequired && <span className="error">*</span>}
				</span>
			)}
			<Input
				readOnly
				className={classes.wrapper}
				style={{
					borderRadius: 16,
					background: '#f4f8fc',
					height: 44,
					...style,
				}}
				status={status}
				{...props}
				value={value}
				suffix={
					<>
						{hasValue && onClear ? (
							<button
								type="button"
								className={classes.clearBtn}
								aria-label="Clear"
								onClick={handleClear}
							>
								<IconX size={16} stroke={2} color="#7987A4" />
							</button>
						) : null}
						{suffix}
					</>
				}
			/>
			{error && <span className="error">{error}</span>}
			{openModal && (
				<CGGMap
					onClose={handleCloseModal}
					onSubmit={onSubmitModal}
					longitude={longitude}
					latitude={latitude}
					title={title}
				/>
			)}
		</Flex>
	)
}

export default memo(CInputMap)
