'use client'

import { IconArrowLeft } from '@tabler/icons-react'
import { Flex } from 'antd'
import React, { useMemo, useState } from 'react'

import CButton from '@/Components/Custom/CButton'
import CInputPhone from '@/Components/Custom/CInputPhone'
import { mainRoutes } from '@/routes/MainRoutes'
import { useLocalePath, useQuery } from '@/ultis/route'

import formClasses from '../shared/accountSettingForm.module.scss'

function ChangePhoneAccount() {
	const { onChangeRoute } = useLocalePath()
	const { onGetQuerry } = useQuery()
	const query = onGetQuerry()
	const [prefix, setPrefix] = useState(query.prefix || '+84')
	const [phone, setPhone] = useState(query.phone || '')

	const isValid = useMemo(() => phone.replace(/\D/g, '').length >= 9, [phone])

	const handleGoBack = () => {
		onChangeRoute(`${mainRoutes.accountSetting}/manage-account`)
	}

	const handleContinue = () => {
		if (!isValid) return
		const params = new URLSearchParams({
			phone,
			prefix,
		})
		onChangeRoute(
			`${mainRoutes.accountSetting}/manage-account/change-phone/verify?${params.toString()}`,
		)
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
					<span>Change Phone Number</span>
				</button>

				<Flex vertical className={formClasses.form} gap={16}>
					<div className={formClasses.phoneField}>
						<CInputPhone
							isRequired
							isNotBold
							label="Phone Number"
							prefix={prefix}
							value={phone}
							placeholder="Phone number"
							allowClear={false}
							bordered={false}
							maxLength={15}
							onChangePrefix={setPrefix}
							onChange={(e) =>
								setPhone(e.target.value.replace(/[^0-9]/g, ''))
							}
						/>
					</div>

					<div className={formClasses.submitButton}>
						<CButton
							ctype={isValid ? 'oranger' : undefined}
							disabled={!isValid}
							style={{ width: '100%' }}
							onClick={handleContinue}
						>
							Continue
						</CButton>
					</div>
				</Flex>
			</Flex>
		</div>
	)
}

export default ChangePhoneAccount
