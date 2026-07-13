'use client'

import { Select } from 'antd'
import getUnicodeFlagIcon from 'country-flag-icons/unicode'
import { memo, useMemo } from 'react'
import { Country, getCountryCallingCode } from 'react-phone-number-input'

import classes from './CInputPhone.module.scss'

const { Option } = Select

interface CountryOption {
	value?: string
	label: string
	divider?: boolean
}

interface PhoneCountrySelectProps {
	value?: Country
	onChange: (country?: Country) => void
	options: CountryOption[]
	disabled?: boolean
	readOnly?: boolean
}

/** Build dial code label such as +84. */
const getDialCode = (country?: string) =>
	country ? `+${getCountryCallingCode(country as Country)}` : ''

/** Build collapsed select label: flag + dial code. */
const getFlagDialLabel = (country?: string) => {
	if (!country) return ''
	return `${getUnicodeFlagIcon(country)} ${getDialCode(country)}`
}

/** Country selector styled like the legacy Ant Design addonBefore select. */
const PhoneCountrySelect = ({
	value,
	onChange,
	options,
	disabled,
	readOnly,
}: PhoneCountrySelectProps) => {
	const countryOptions = useMemo(
		() => options.filter((option) => !option.divider && option.value),
		[options],
	)

	return (
		<div className={classes.countrySelect}>
			<Select
				className={classes.countrySelectInner}
				value={value}
				onChange={(country) => onChange(country || undefined)}
				disabled={disabled || readOnly}
				style={{ minWidth: 80, width: 'auto' }}
				dropdownStyle={{ width: 280 }}
				showSearch
				bordered={false}
				optionLabelProp="label"
				popupMatchSelectWidth={false}
				filterOption={(input, option) => {
					const lower = input.toLowerCase()
					const dialCode = getDialCode(option?.value as string)
					const country = countryOptions.find(
						(item) => item.value === option?.value,
					)
					return (
						dialCode.includes(input) ||
						(country?.label?.toLowerCase().includes(lower) ?? false)
					)
				}}
			>
				{countryOptions.map((option) => (
					<Option
						key={option.value}
						value={option.value}
						label={getFlagDialLabel(option.value)}
					>
						<span style={{ marginRight: 8 }}>
							{getUnicodeFlagIcon(option.value!)}
						</span>
						<span style={{ marginRight: 8 }}>{option.label}</span>
						<span style={{ color: '#888' }}>{getDialCode(option.value)}</span>
					</Option>
				))}
			</Select>
		</div>
	)
}

export default memo(PhoneCountrySelect)
