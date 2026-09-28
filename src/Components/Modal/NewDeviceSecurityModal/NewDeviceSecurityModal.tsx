'use client'

import {
	IconDeviceMobileFilled,
	IconKey,
	IconLogin2,
	IconLogout,
	IconShieldLock,
	IconX,
} from '@tabler/icons-react'
import { memo } from 'react'

import CModal from '@/Components/Custom/CModal/CModal'
import type {
	NewDeviceAlert,
	NewDeviceInfo,
} from '@/interface/Security/NewDeviceAlert.interface'

import classes from './NewDeviceSecurityModal.module.scss'

type NewDeviceSecurityStep = 'notice' | 'secure'

const PLATFORM_LABELS: Record<string, string> = {
	ios: 'iPhone',
	android: 'Android',
	mobile: 'Mobile app',
	web: 'Web browser',
}

/** Builds a human label for the device that triggered the alert. */
const getDeviceLabel = (device?: NewDeviceInfo) => {
	const name = device?.name?.trim()
	const model = device?.model?.trim()
	const platform = device?.platform?.trim().toLowerCase()

	return name || model || PLATFORM_LABELS[platform || ''] || ''
}

type NewDeviceSecurityModalProps = {
	alert: NewDeviceAlert
	step: NewDeviceSecurityStep
	loading?: boolean
	onConfirmLogin: () => void
	onSecureAccount: () => void
	onLogoutOtherDevices: () => void
	onChangePassword: () => void
}

/** Displays the two-step new-device security flow. */
function NewDeviceSecurityModal({
	alert,
	step,
	loading,
	onConfirmLogin,
	onSecureAccount,
	onLogoutOtherDevices,
	onChangePassword,
}: NewDeviceSecurityModalProps) {
	const deviceLabel = getDeviceLabel(alert?.device)
	const location =
		alert?.location && alert.location !== 'Unknown' ? alert.location : ''

	return (
		<CModal
			open
			centered
			closable={false}
			maskClosable={false}
			keyboard={false}
			footer={null}
			styles={{
				content: {
					width: 480,
					maxWidth: 'calc(100vw - 32px)',
					minHeight: 0,
					padding: 0,
					borderRadius: 24,
					overflow: 'hidden',
				},
				body: {
					padding: 0,
					overflow: 'visible',
				},
			}}
		>
			<div className={classes.wrapper}>
				<div className={classes.header}>
					<div className={classes.iconFrame}>
						{step === 'notice' ? (
							<IconLogin2 size={26} stroke={2.2} />
						) : (
							<IconShieldLock size={26} stroke={2.2} />
						)}
					</div>
					<button
						type="button"
						className={classes.closeButton}
						aria-label="Close"
						disabled={loading}
						onClick={onConfirmLogin}
					>
						<IconX size={24} stroke={2} />
					</button>
				</div>

				<h2 className={classes.title}>
					{step === 'notice' ? 'New login detected' : 'Secure your account'}
				</h2>

				{step === 'notice' ? (
					<>
						<p className={classes.description}>
							Your account was signed in on another device.
						</p>

						{deviceLabel || location ? (
							<div className={classes.device}>
								<span className={classes.deviceIcon}>
									<IconDeviceMobileFilled size={30} />
								</span>
								<div className={classes.deviceInfo}>
									{deviceLabel ? (
										<strong className={classes.deviceName}>
											{deviceLabel}
										</strong>
									) : null}
									{location ? (
										<span className={classes.deviceLocation}>{location}</span>
									) : null}
								</div>
							</div>
						) : null}

						<div className={classes.actions}>
							<button
								type="button"
								className={classes.primaryButton}
								disabled={loading}
								onClick={onConfirmLogin}
							>
								{loading ? 'Please wait...' : 'Yes, it was me'}
							</button>
							<button
								type="button"
								className={classes.linkButton}
								disabled={loading}
								onClick={onSecureAccount}
							>
								Secure account
							</button>
						</div>
					</>
				) : (
					<>
						<p className={classes.description}>
							Choose how you want to protect your account.
						</p>

						<div className={classes.securityActions}>
							<button
								type="button"
								className={classes.securityButton}
								disabled={loading}
								onClick={onLogoutOtherDevices}
							>
								<span className={classes.securityIcon}>
									<IconLogout size={22} />
								</span>
								<span>
									<strong>Log out all devices</strong>
									<small>Keep this device signed in</small>
								</span>
							</button>
							<button
								type="button"
								className={classes.securityButton}
								disabled={loading}
								onClick={onChangePassword}
							>
								<span className={classes.securityIcon}>
									<IconKey size={22} />
								</span>
								<span>
									<strong>Change password</strong>
									<small>Create a new password for your account</small>
								</span>
							</button>
						</div>

						{loading ? (
							<p className={classes.loadingText}>Securing your account...</p>
						) : null}
					</>
				)}
			</div>
		</CModal>
	)
}

export default memo(NewDeviceSecurityModal)
