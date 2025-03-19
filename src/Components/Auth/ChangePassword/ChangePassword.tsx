import { Flex } from 'antd'
import { memo } from 'react'

import CButton from '@/Components/Custom/CButton'
import CInputPassword from '@/Components/Custom/CInputPassword'
import ImageChangePassword from './ImageChangePassword'

import classes from './ChangePassword.module.scss'

interface ChangePasswordProps {
	disabled?: boolean
	password?: string
	confirmPassword?: string
	title: string
	note: string
	errors?: {
		[key: string]: any
	}
	onChangePassword?: any
	onChangeConfirmPassword?: any
	onAccept?: any
	[key: string]: any
}

const ChangePassword = ({
	disabled,
	password,
	confirmPassword,
	errors,
	title = 'Change your password',
	note,
	onChangePassword,
	onChangeConfirmPassword,
	onAccept,
}: ChangePasswordProps) => {
	return (
		<div className={classes.wrapper}>
			<Flex
				vertical
				gap={24}
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
					<CInputPassword
						isRequired
						value={password}
						label="New password"
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
					<CButton ctype="disabled" style={{ flex: 1 }}>
						Cancel
					</CButton>
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
