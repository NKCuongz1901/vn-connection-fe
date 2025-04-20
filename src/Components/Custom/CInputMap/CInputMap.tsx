'use client'

import { Flex, Input } from 'antd'
import { memo, useCallback, useState } from 'react'

import { CInputProps } from '@/interface/CComponent/CComponent.interface'

import classes from './CInputMap.module.scss'
import CGGMap from '../CGGMap/CGGMap'

interface CInputMapProps {
	longitude: number
	latitude: number
	onSubmitModal?: any
}

const CInputMap = (_props: CInputMapProps & CInputProps) => {
	const {
		error,
		label,
		isRequired,
		style,
		onSubmitModal,
		longitude,
		latitude,
		...props
	} = _props
	const [openModal, setOpenModal] = useState(false)
	const status = error ? 'error' : ''
	const handleCloseModal = useCallback((e) => {
		e?.stopPropagation?.()
		setOpenModal(false)
	}, [])
	return (
		<Flex
			vertical
			gap={4}
			className={classes.layout}
			onClick={() => {
				setOpenModal(true)
			}}
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
				/>
			)}
		</Flex>
	)
}

export default memo(CInputMap)
