'use client'

import { Flex, Input } from 'antd'
import { memo } from 'react'

import { CInputProps } from '@/interface/CComponent/CComponent.interface'

import classes from './Input.module.scss'

const CInput = (_props: CInputProps) => {
	const { error, label, isRequired, style, ...props } = _props
	const status = error ? 'error' : ''
	return (
		<Flex vertical gap={4} className={classes.layout}>
			{label && (
				<span className="bold">
					{label} {isRequired && <span className="error">*</span>}
				</span>
			)}
			<Input
				allowClear
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
		</Flex>
	)
}

export default memo(CInput)
