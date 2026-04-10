import { Flex } from 'antd'
import { memo } from 'react'

import CButton from '@/Components/Custom/CButton'
import CInputPassword from '@/Components/Custom/CInputPassword'
import ImageChangePassword from './ImageChangePassword'

import classes from './ChangePassword.module.scss'
import CInput from '@/Components/Custom/CInput'
import CCheckbox from '@/Components/Custom/CCheckbox'
import Link from 'next/link'
import { mainRoutes } from '@/routes/MainRoutes'

interface ChangePasswordProps {
	disabled?: boolean
	isRegister?: boolean
	password?: string
	confirmPassword?: string
	title: string
	note: string
	name?: string
	errors?: {
		[key: string]: any
	}
	onChangePassword?: any
	onChangeConfirmPassword?: any
	onChangeCommonData?: any
	onAccept?: any
	[key: string]: any
}

const ChangePassword = ({
	disabled,
	checked,
	isRegister,
	password,
	name,
	email,
	invite_code,
	confirmPassword,
	errors,
	title = 'Change your password',
	note,
	onChangePassword,
	onChangeConfirmPassword,
	onChangeCommonData,
	onAccept,
}: ChangePasswordProps) => {
	return (
		<div className={classes.wrapper}>
			<Flex
				vertical
				align="center"
				justify="center"
				className={classes.container}
			>
				<ImageChangePassword />
				<Flex vertical align="center" gap={4}>
					<div className={classes.title}>{title}</div>
					<div className={classes.note}>{note}</div>
				</Flex>
				<Flex vertical gap={12} className="fullW">
					{isRegister && (
						<CInput
							isRequired
							value={name}
							label={'Name'}
							error={errors?.name}
							placeholder={'Your name [5-30] letter'}
							onChange={(e) => onChangeCommonData('name')(e.target.value)}
							minLength={5}
							maxLength={30}
						/>
					)}
					<CInputPassword
						isRequired
						value={password}
						label={isRegister ? 'Password' : 'New password'}
						onChange={(e) => onChangePassword(e.target.value)}
					/>
					<CInputPassword
						isRequired
						value={confirmPassword}
						error={errors?.confirmPassword}
						label="Confirm password"
						onChange={(e) => onChangeConfirmPassword(e.target.value)}
					/>
					{isRegister && (
						<CInput
							value={email}
							label={'Email'}
							error={errors?.email}
							placeholder={'Email (Optional)'}
							onChange={(e) => onChangeCommonData('email')(e.target.value)}
						/>
					)}
					{isRegister && (
						<CInput
							value={invite_code}
							label={'Referral Code'}
							error={errors?.invite_code}
							placeholder={'Referral Code (Optional)'}
							onChange={(e) =>
								onChangeCommonData('invite_code')(e.target.value)
							}
						/>
					)}
					{isRegister && (
						<Flex align="center" gap={4}>
							<CCheckbox
								value={checked}
								onChange={() => onChangeCommonData('checked')(!checked)}
							/>
							<div>
								{' '}
								I agree to the app's{' '}
								<Link
									href={`${mainRoutes.policyTerm}?type=TERMS`}
									className={classes.highlight}
									target="_blank"
								>
									Terms
								</Link>{' '}
								and{' '}
								<Link
									href={`${mainRoutes.policyTerm}?type=TERMS`}
									className={classes.highlight}
									target="_blank"
								>
									Privacy Policy
								</Link>
							</div>
						</Flex>
					)}
				</Flex>

				<Flex className={classes.buttonWrapper}>
					<CButton
						ctype="oranger"
						disabled={disabled}
						style={{ flex: 1 }}
						onClick={onAccept}
					>
						Continue
					</CButton>
				</Flex>
			</Flex>
		</div>
	)
}

export default memo(ChangePassword)
