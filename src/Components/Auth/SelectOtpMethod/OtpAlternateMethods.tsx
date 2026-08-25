'use client'

import { memo, useMemo } from 'react'

import SecuritySafeIcon from '@/svg/SecuritySafeIcon'

import type { OtpSendMethod } from './OtpMethodList'
import classes from './SelectOtpMethod.module.scss'

type OtpMethodOption = {
	value: OtpSendMethod
	label: string
	iconSrc: string
}

const OTP_ALTERNATE_OPTIONS: OtpMethodOption[] = [
	{
		value: 'whatsapp',
		label: 'WhatsApp',
		iconSrc: '/images/otp/whatsapp.png',
	},
	{
		value: 'zalo',
		label: 'Zalo',
		iconSrc: '/images/otp/zalo.png',
	},
	{
		value: 'sms',
		label: 'SMS',
		iconSrc: '/images/otp/sms.png',
	},
]

interface OtpAlternateMethodsProps {
	isVnPhone?: boolean
	disabled?: boolean
	onSelect: (method: OtpSendMethod) => void
}

/** Compact WhatsApp / Zalo / SMS rows shown after Get OTP via phone (Figma). */
function OtpAlternateMethods({
	isVnPhone = false,
	disabled = false,
	onSelect,
}: OtpAlternateMethodsProps) {
	const options = useMemo(
		() =>
			OTP_ALTERNATE_OPTIONS.filter(
				(option) => option.value !== 'zalo' || isVnPhone,
			),
		[isVnPhone],
	)

	return (
		<>
			<p className={classes.alternateHint}>
				or choose another ways to get OTP
			</p>
			<div className={classes.compactList}>
				{options.map((option) => (
					<button
						key={option.value}
						type="button"
						className={classes.compactOption}
						disabled={disabled}
						onClick={() => onSelect(option.value)}
					>
						<div className={classes.compactLeft}>
							<div className={classes.compactIconWrap}>
								<img src={option.iconSrc} alt="" width={24} height={24} />
							</div>
							<span className={classes.compactLabel}>{option.label}</span>
						</div>
					</button>
				))}
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

export default memo(OtpAlternateMethods)
