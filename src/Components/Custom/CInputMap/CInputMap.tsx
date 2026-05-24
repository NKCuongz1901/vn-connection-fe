'use client'

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
		open,
		onOpenChange,
		...props
	} = _props
	const [internalOpen, setInternalOpen] = useState(false)
	const isControlled = open !== undefined
	const openModal = isControlled ? open : internalOpen
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
				allowClear
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
