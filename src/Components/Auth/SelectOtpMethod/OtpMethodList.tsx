'use client'

import clsx from 'clsx'
import { memo, useMemo } from 'react'

import SecuritySafeIcon from '@/svg/SecuritySafeIcon'

import classes from './SelectOtpMethod.module.scss'

export type OtpSendMethod = 'whatsapp' | 'zalo' | 'sms'

type OtpMethodOption = {
	value: OtpSendMethod
	label: string
	description: string
	iconSrc: string
}

const OTP_METHOD_OPTIONS: OtpMethodOption[] = [
	{
		value: 'whatsapp',
		label: 'WhatsApp',
		description: 'Receive OTP via WhatsApp',
		iconSrc: '/images/otp/whatsapp.png',
	},
	{
		value: 'zalo',
		label: 'Zalo',
		description: 'Receive OTP via Zalo',
		iconSrc: '/images/otp/zalo.png',
	},
	{
		value: 'sms',
		label: 'SMS',
		description: 'Receive OTP via SMS',
		iconSrc: '/images/otp/sms.png',
	},
]

interface OtpMethodListProps {
	value: OtpSendMethod
	isVnPhone?: boolean
	onChange: (method: OtpSendMethod) => void
}

/** Renders WhatsApp / Zalo / SMS OTP method radio cards. */
function OtpMethodList({
	value,
	isVnPhone = false,
	onChange,
}: OtpMethodListProps) {
	const options = useMemo(
		() =>
			OTP_METHOD_OPTIONS.filter(
				(option) => option.value !== 'zalo' || isVnPhone,
			),
		[isVnPhone],
	)

	return (
		<>
			<div className={classes.list} role="radiogroup" aria-label="OTP method">
				{options.map((option) => {
					const selected = value === option.value
					return (
						<button
							key={option.value}
							type="button"
							role="radio"
							aria-checked={selected}
							className={clsx(classes.option, {
								[classes.optionSelected]: selected,
							})}
							onClick={() => onChange(option.value)}
						>
							<div className={classes.optionLeft}>
								<div className={classes.iconWrap}>
									<img src={option.iconSrc} alt="" width={40} height={40} />
								</div>
								<div className={classes.optionText}>
									<p className={classes.optionLabel}>{option.label}</p>
									<p className={classes.optionDesc}>{option.description}</p>
								</div>
							</div>
							<span
								className={clsx(classes.radio, {
									[classes.radioChecked]: selected,
								})}
								aria-hidden
							/>
						</button>
					)
				})}
			</div>

			<div className={classes.securityNote}>
				<span className={classes.securityIcon}>
					<SecuritySafeIcon width={12} height={14} />
				</span>
				<p className={classes.securityText}>
					Your information is secure and will not be shared with anyone.
				</p>
			</div>
		</>
	)
}

export default memo(OtpMethodList)
