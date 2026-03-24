'use client'

import { AutoComplete, Flex } from 'antd'
import { forwardRef, memo } from 'react'

import { CAutoCompleteProps } from '@/interface/CComponent/CComponent.interface'

import classes from './CAutoComplete.module.scss'

const CAutoComplete = forwardRef((_props: CAutoCompleteProps, ref: any) => {
	const {
		isNotBold,
		error,
		label,
		isRequired,
		style,
		desc,
		subLabel,
		...props
	} = _props
	const status = error ? 'error' : ''
	return (
		<Flex vertical gap={4} className={classes.layout}>
			{label && (
				<span className={isNotBold ? '' : 'bold'}>
					{label} {isRequired && <span className="error">*</span>}
				</span>
			)}
			{subLabel && <span style={{ opacity: 0.5 }}>{subLabel}</span>}
			<AutoComplete
				ref={ref}
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
			{error ? (
				<span className="error">{error}</span>
			) : (
				!!desc && <span>{desc}</span>
			)}
		</Flex>
	)
})
CAutoComplete.displayName = 'CAutoComplete' // 👈 THÊM DÒNG NÀY ĐỂ FIX

export default memo(CAutoComplete) as React.FC<CAutoCompleteProps>
