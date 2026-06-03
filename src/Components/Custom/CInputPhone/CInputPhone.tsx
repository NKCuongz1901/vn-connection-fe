'use client'

import { Select } from 'antd'
import { memo } from 'react'

import CInput from '../CInput/CInput'

import { CInputProps } from '@/interface/CComponent/CComponent.interface'

import { countryCodes } from '@/Variable/common.variable'

const { Option } = Select

interface CInputPhoneProps {
	prefix?: string
	onChangePrefix?: any
}

const getFlagEmoji = (code: string) =>
	code
		.toUpperCase()
		.split('')
		.map((c) => String.fromCodePoint(0x1f1e6 - 65 + c.charCodeAt(0)))
		.join('')

const CInputPhone = ({
	prefix,
	onChangePrefix,
	...props
}: CInputPhoneProps & CInputProps) => {
	const selectBefore = (
		<Select
			value={prefix}
			onChange={onChangePrefix}
			style={{ minWidth: 115, width: 'auto' }}
			dropdownStyle={{ width: 280 }}
			showSearch
			filterOption={(input, option) => {
				const lower = input.toLowerCase()
				const item = countryCodes.find((c) => c.dial_code === option?.value)
				return (
					(option?.value as string)?.includes(input) ||
					(item?.name?.toLowerCase().includes(lower) ?? false)
				)
			}}
			optionLabelProp="label"
		>
			{countryCodes.map((i) => (
				<Option
					key={i.dial_code}
					value={i.dial_code}
					label={`${getFlagEmoji(i.code)} ${i.dial_code}`}
				>
					<span style={{ marginRight: 8 }}>{getFlagEmoji(i.code)}</span>
					<span style={{ marginRight: 8 }}>{i.name}</span>
					<span style={{ color: '#888' }}>{i.dial_code}</span>
				</Option>
			))}
		</Select>
	)
	return <CInput addonBefore={selectBefore} {...props} />
}

export default memo(CInputPhone)
