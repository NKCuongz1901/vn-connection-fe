'use client'

import { IconChevronDown } from '@tabler/icons-react'
import { Flex, Select } from 'antd'
import { memo } from 'react'

import { CSelectProps } from '@/interface/CComponent/CComponent.interface'

import classes from './CSelectMuti.module.scss'

const CSelectMuti = (_props: CSelectProps) => {
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
				mode="multiple"
				className={classes.wrapper}
				suffixIcon={<IconChevronDown />}
				style={{
					...style,
				}}
				status={status}
				{...props}
			/>
			{error && <span className="error">{error}</span>}
		</Flex>
	)
}

export default memo(CSelectMuti)
