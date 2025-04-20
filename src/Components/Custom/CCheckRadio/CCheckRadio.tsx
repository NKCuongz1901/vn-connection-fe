'use client'

import { Flex } from 'antd'
import clsx from 'clsx'
import { memo } from 'react'

import classes from './CCheckRadio.module.scss'

interface CCheckRadio {
	label: string
	checked?: boolean
	onClick?: any
}
const CCheckRadio = (_props: CCheckRadio) => {
	const { checked, label, ...props } = _props
	return (
		<Flex
			gap={4}
			className={clsx(classes.layout, {
				[classes.checked]: checked,
			})}
			{...props}
		>
			<div className={classes.checkBox} />
			<span>{label}</span>
		</Flex>
	)
}

export default memo(CCheckRadio)
