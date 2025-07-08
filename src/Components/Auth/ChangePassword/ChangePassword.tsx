import { Flex } from 'antd'
import { memo } from 'react'

import CButton from '@/Components/Custom/CButton'
import CInputPassword from '@/Components/Custom/CInputPassword'
import ImageChangePassword from './ImageChangePassword'

import classes from './ChangePassword.module.scss'
import CInput from '@/Components/Custom/CInput'

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
	isRegister,
	password,
	name,
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
							onChange={(e) => onChangeCommonData(e.target.value)}
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
