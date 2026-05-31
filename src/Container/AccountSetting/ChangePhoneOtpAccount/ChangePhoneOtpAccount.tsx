'use client'

import { IconArrowLeft } from '@tabler/icons-react'
import { Flex, Input } from 'antd'
import React, { useMemo, useState } from 'react'

import CButton from '@/Components/Custom/CButton'
import { formatPhone } from '@/ultis/common'
import { mainRoutes } from '@/routes/MainRoutes'
import { useLocalePath, useQuery } from '@/ultis/route'

import formClasses from '../shared/accountSettingForm.module.scss'

function ChangePhoneOtpAccount() {
	const { onChangeRoute } = useLocalePath()
	const { onGetQuerry } = useQuery()
	const { phone = '', prefix = '+84' } = onGetQuerry()
	const [otp, setOtp] = useState('')

	const formattedPhone = useMemo(
		() => formatPhone(prefix, phone) || phone,
		[phone, prefix],
	)
	const isValid = otp.length >= 6

	const handleGoBack = () => {
		const params = new URLSearchParams({ phone, prefix })
		onChangeRoute(
			`${mainRoutes.accountSetting}/manage-account/change-phone?${params.toString()}`,
		)
	}

	const handleSave = () => {
		if (!isValid) return
		// TODO: call verify OTP + update phone API
		onChangeRoute(`${mainRoutes.accountSetting}/manage-account`)
	}

	return (
		<div className={formClasses.wrapper}>
			<Flex className={formClasses.section}>
				<button
					type="button"
					className={formClasses.sectionTitle}
					onClick={handleGoBack}
				>
					<IconArrowLeft size={20} color="#48546B" stroke={1.5} />
					<span>OTP Verify</span>
				</button>

				<Flex vertical className={formClasses.form} gap={16}>
					<Flex vertical gap={12} className={formClasses.otpBlock}>
						<p className={formClasses.otpDescription}>
							To verify that the phone number is yours, enter the 6-digit code
							sent to{' '}
							<span className={formClasses.phoneHighlight}>
								&apos;{formattedPhone}&apos;
							</span>
						</p>

						<div className={formClasses.otpInput}>
							<Input.OTP
								length={6}
								value={otp}
								variant="filled"
								formatter={(str) => str.replace(/\D/g, '')}
								onChange={setOtp}
							/>
						</div>

						<div className={formClasses.resendRow}>
							<span>Didn&apos;t receive the code?</span>
							<button type="button" className={formClasses.resendLink}>
								Send again
							</button>
						</div>
					</Flex>

					<div className={formClasses.submitButton}>
						<CButton
							ctype={isValid ? 'oranger' : undefined}
							disabled={!isValid}
							style={{ width: '100%' }}
							onClick={handleSave}
						>
							Save
						</CButton>
					</div>
				</Flex>
			</Flex>
		</div>
	)
}

export default ChangePhoneOtpAccount
