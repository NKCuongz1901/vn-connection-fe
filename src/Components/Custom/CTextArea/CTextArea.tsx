'use client'

import { Flex, Input } from 'antd'

import { CTextAreaProps } from '@/interface/CComponent/CComponent.interface'

import classes from './CTextArea.module.scss'
import clsx from 'clsx'

const { TextArea } = Input

const CTextArea = (_props: CTextAreaProps) => {
	const { error, label, isRequired, isFullHeight, style, ...props } = _props
	const status = error ? 'error' : ''

	return (
		<Flex vertical gap={4} className={classes.layout}>
			{label && (
				<span className="bold">
					{label} {isRequired && <span className="error">*</span>}
				</span>
			)}
			<TextArea
				allowClear
				className={clsx(classes.wrapper, {
					[classes.fullHeight]: isFullHeight,
				})}
				style={{
					borderRadius: 16,
					background: '#f4f8fc',
					...style,
				}}
				status={status}
				{...props}
			/>
			{error && <span className="error">{error}</span>}
		</Flex>
	)
}

export default CTextArea
