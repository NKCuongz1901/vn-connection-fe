'use client'

import { Flex, Switch, SwitchProps } from 'antd'
import clsx from 'clsx'
import { memo } from 'react'

import classes from './CSwitch.module.scss'

type VariantType = 'oranger' | 'disabled' | 'success' | '' | undefined | null

const CSwitch = (_props: SwitchProps & { ctype?: VariantType }) => {
	const { ctype, ...props } = _props
	return (
		<Flex
			vertical
			gap={4}
			className={clsx(classes.layout, classes[ctype || ''])}
		>
			<Switch {...props} />
		</Flex>
	)
}

export default memo(CSwitch)
