'use client'

import { Flex, Select } from 'antd'
import { memo } from 'react'
import { IconChevronDown } from '@tabler/icons-react'

import { CSelectProps } from '@/interface/CComponent/CComponent.interface'

import classes from './CSelect.module.scss'

const CSelect = (_props: CSelectProps) => {
	const { error, label, isRequired, style, ...props } = _props
	const status = error ? 'error' : ''
	return (
		<Flex vertical gap={4} className={classes.layout}>
			{label && (
				<span className="bold">
					{label} {isRequired && <span className="error">*</span>}
				</span>
			)}
			<Select
				className={classes.wrapper}
				suffixIcon={<IconChevronDown />}
				style={{
					// borderRadius: 16,
					// background: '#f4f8fc',
					// height: 44,
					...style,
				}}
				status={status}
				{...props}
			/>
			{error && <span className="error">{error}</span>}
		</Flex>
	)
}

export default memo(CSelect)
