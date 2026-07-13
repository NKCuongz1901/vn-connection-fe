'use client'

import { Flex } from 'antd'
import clsx from 'clsx'
import { ChangeEvent, memo, useCallback, useMemo } from 'react'
import PhoneInput, {
	Country,
	Value,
	getCountries,
	getCountryCallingCode,
	parsePhoneNumber,
} from 'react-phone-number-input'
import en from 'react-phone-number-input/locale/en.json'

import { CInputProps } from '@/interface/CComponent/CComponent.interface'
import { formatPhone } from '@/ultis/common'

import classes from './CInputPhone.module.scss'
import PhoneCountrySelect from './PhoneCountrySelect'

const DEFAULT_PREFIX = '+84'
const DEFAULT_COUNTRY: Country = 'VN'

interface CInputPhoneProps {
	prefix?: string
	onChangePrefix?: (value: string) => void
}

/** Map stored prefix + national number to E.164 for react-phone-number-input. */
const toE164 = (prefix?: string, phone?: string): Value | undefined => {
	if (!phone) return undefined
	if (phone.startsWith('+')) return phone as Value
	return formatPhone(prefix || DEFAULT_PREFIX, phone) as Value
}

/** Resolve country from prefix (and optional phone) for the country select. */
const getCountryFromPrefix = (prefix?: string, phone?: string): Country => {
	const e164 = toE164(prefix, phone)
	if (e164) {
		const parsed = parsePhoneNumber(e164)
		if (parsed?.country) return parsed.country
	}

	const dialCode = (prefix || DEFAULT_PREFIX).replace('+', '')
	const match = getCountries().find(
		(country) => getCountryCallingCode(country) === dialCode,
	)
	return match || DEFAULT_COUNTRY
}

/** Emit a change event compatible with existing CInput onChange handlers. */
const createPhoneChangeEvent = (value: string): ChangeEvent<HTMLInputElement> =>
	({ target: { value } }) as ChangeEvent<HTMLInputElement>

const CInputPhone = ({
	prefix,
	onChangePrefix,
	isNotBold,
	error,
	label,
	isRequired,
	desc,
	subLabel,
	isFullHeight: _isFullHeight,
	value,
	onChange,
	style,
	bordered = true,
	disabled,
	placeholder,
	maxLength,
	...rest
}: CInputPhoneProps & CInputProps) => {
	const phone = typeof value === 'string' ? value : ''
	const e164Value = useMemo(() => toE164(prefix, phone), [prefix, phone])
	const defaultCountry = useMemo(
		() => getCountryFromPrefix(prefix, phone),
		[prefix, phone],
	)

	const handleChange = useCallback(
		(nextValue?: Value) => {
			if (!nextValue) {
				onChange?.(createPhoneChangeEvent(''))
				return
			}

			const parsed = parsePhoneNumber(nextValue)
			if (!parsed) return

			onChangePrefix?.(`+${parsed.countryCallingCode}`)
			onChange?.(createPhoneChangeEvent(parsed.nationalNumber))
		},
		[onChange, onChangePrefix],
	)

	const handleCountryChange = useCallback(
		(country?: Country) => {
			if (!country) return
			onChangePrefix?.(`+${getCountryCallingCode(country)}`)
		},
		[onChangePrefix],
	)

	return (
		<Flex
			vertical
			gap={4}
			className={classes.layout}
			style={style}
		>
			{label && (
				<span className={isNotBold ? '' : 'bold'}>
					{label} {isRequired && <span className="error">*</span>}
				</span>
			)}
			{subLabel && <span style={{ opacity: 0.5 }}>{subLabel}</span>}
			<PhoneInput
				international={false}
				countryCallingCodeEditable={false}
				defaultCountry={defaultCountry}
				countrySelectComponent={PhoneCountrySelect}
				labels={en}
				value={e164Value}
				onChange={handleChange}
				onCountryChange={handleCountryChange}
				disabled={disabled}
				placeholder={placeholder}
				limitMaxLength={Boolean(maxLength)}
				className={clsx(
					classes.phoneInput,
					!bordered && classes.borderless,
					error && classes.hasError,
				)}
				numberInputProps={{
					maxLength,
					...rest,
				}}
			/>
			{error ? (
				<span className="error">{error}</span>
			) : (
				!!desc && <span>{desc}</span>
			)}
		</Flex>
	)
}

export default memo(CInputPhone)
