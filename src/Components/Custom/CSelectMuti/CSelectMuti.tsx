'use client'

import { IconChevronDown } from '@tabler/icons-react'
import { Flex, Select } from 'antd'
import clsx from 'clsx'
import { memo } from 'react'

import { CSelectProps } from '@/interface/CComponent/CComponent.interface'

import classes from './CSelectMuti.module.scss'

interface CSelectMutiProps extends CSelectProps {
	withCheckbox?: boolean
}

const CSelectMuti = (_props: CSelectMutiProps) => {
	const {
		error,
		label,
		isRequired,
		isSimple,
		withCheckbox,
		style,
		...props
	} = _props
	const status = error ? 'error' : ''

	const renderOption = (oriOption: any) => {
		const selected = Array.isArray(props.value)
			? (props.value as any[]).includes(oriOption.value)
			: false
		return (
			<Flex align="center" gap={10} className={classes.optionRow}>
				<span
					className={clsx(classes.checkbox, { [classes.checked]: selected })}
				/>
				<span>{oriOption.label}</span>
			</Flex>
		)
	}

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
				{...(isSimple && {
					tagRender: (values) => {
						const isLast = values.value === props?.value?.at(-1)
						return (
							<span style={{ margin: 2 }}>
								{values.value}
								{!isLast && ', '}
							</span>
						)
					},
				})}
				{...(withCheckbox && {
					menuItemSelectedIcon: null,
					optionRender: renderOption,
				})}
				{...props}
			/>
			{error && <span className="error">{error}</span>}
		</Flex>
	)
}

export default memo(CSelectMuti)
