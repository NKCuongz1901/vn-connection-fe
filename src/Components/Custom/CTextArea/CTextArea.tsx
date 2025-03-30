'use client'

import { Flex, Input } from 'antd'

import { CTextAreaProps } from '@/interface/CComponent/CComponent.interface'

import classes from './CTextArea.module.scss'

const { TextArea } = Input

const CTextArea = (_props: CTextAreaProps) => {
	const { error, label, isRequired, style, ...props } = _props
	return (
		<Flex vertical gap={4} className={classes.layout}>
			{label && (
				<span>
					{label} {isRequired && <span className="error">*</span>}
				</span>
			)}
			<TextArea
				allowClear
				className={classes.wrapper}
				style={{
					borderRadius: 16,
					background: '#f4f8fc',
					...style,
				}}
				{...props}
			/>
			{error && <span className="error">{error}</span>}
		</Flex>
	)
}

export default CTextArea
