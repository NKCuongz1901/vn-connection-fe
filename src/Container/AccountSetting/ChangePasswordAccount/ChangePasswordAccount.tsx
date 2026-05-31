'use client'

import { IconArrowLeft } from '@tabler/icons-react'
import { Flex } from 'antd'
import React from 'react'

import CButton from '@/Components/Custom/CButton'
import CInputPassword from '@/Components/Custom/CInputPassword'
import useChangePasswordAccount from '@/hooks/AccountSetting/useChangePasswordAccount'

import classes from './ChangePasswordAccount.module.scss'

function ChangePasswordAccount() {
	const {
		oldPassword,
		newPassword,
		confirmPassword,
		errors,
		isValid,
		setOldPassword,
		setNewPassword,
		setConfirmPassword,
		onSubmit,
		onGoBack,
		onForgotPassword,
	} = useChangePasswordAccount()

	return (
		<div className={classes.wrapper}>
			<Flex className={classes.section}>
				<button
					type="button"
					className={classes.sectionTitle}
					onClick={onGoBack}
				>
					<IconArrowLeft size={20} color="#48546B" stroke={1.5} />
					<span>Change Password</span>
				</button>

				<Flex vertical className={classes.form} gap={16}>
					<div className={classes.oldPasswordGroup}>
						<div className={classes.passwordField}>
							<CInputPassword
								isRequired
								value={oldPassword}
								label="Old Password"
								error={errors.oldPassword}
								placeholder="Enter your old password"
								allowClear={false}
								bordered={false}
								onChange={(e) => setOldPassword(e.target.value)}
							/>
						</div>
						<button
							type="button"
							className={classes.forgotLink}
							onClick={onForgotPassword}
						>
							Forgot password ?
						</button>
					</div>

					<div className={classes.passwordField}>
						<CInputPassword
							isRequired
							value={newPassword}
							label="New Password"
							error={errors.newPassword}
							placeholder="Enter a new password"
							allowClear={false}
							bordered={false}
							onChange={(e) => setNewPassword(e.target.value)}
						/>
					</div>

					<div className={classes.passwordField}>
						<CInputPassword
							isRequired
							value={confirmPassword}
							label="Confirm Password"
							error={errors.confirmPassword}
							placeholder="Confirm your new password"
							allowClear={false}
							bordered={false}
							onChange={(e) => setConfirmPassword(e.target.value)}
						/>
					</div>

					<div className={classes.submitButton}>
						<CButton
							ctype={isValid ? 'oranger' : undefined}
							disabled={!isValid}
							style={{ width: '100%' }}
							onClick={onSubmit}
						>
							Change Password
						</CButton>
					</div>
				</Flex>
			</Flex>
		</div>
	)
}

export default ChangePasswordAccount
