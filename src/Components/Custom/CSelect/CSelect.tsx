'use client'

import { Flex, Select } from 'antd'
import { memo } from 'react'
import { IconChevronDown } from '@tabler/icons-react'

import { CSelectProps } from '@/interface/CComponent/CComponent.interface'

import classes from './CSelect.module.scss'
import clsx from 'clsx'

const CSelect = (_props: CSelectProps) => {
	const { isWhite, isMaxRadius, error, label, isRequired, style, ...props } =
		_props
	const status = error ? 'error' : ''
	return (
		<Flex
			vertical
			gap={4}
			className={clsx(classes.layout, {
				[classes.layoutWhite]: isWhite,
			})}
		>
			{label && (
				<span className="bold">
					{label} {isRequired && <span className="error">*</span>}
				</span>
			)}
			<Select
				className={clsx(classes.wrapper, {
					[classes.wrapperRadius]: isMaxRadius,
				})}
				suffixIcon={<IconChevronDown />}
				style={{
					// borderRadius: 16,
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
