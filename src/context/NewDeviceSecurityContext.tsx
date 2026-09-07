'use client'

import { onMessage } from 'firebase/messaging'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

import {
	acknowledgeSecurityAlert,
	getPendingSecurityAlerts,
	logoutOtherDevices,
} from '@/apis/userApis'
import NewDeviceSecurityModal from '@/Components/Modal/NewDeviceSecurityModal'
import { showSocketToast } from '@/Components/Toast/SocketToastContent'
import { getFid, messaging } from '@/config/firebase'
import {
	getLegacyEventDeviceId,
	getLegacyEventMessage,
	LegacyDeviceEvent,
	NewDeviceAlert,
	parseNewDeviceAlert,
	SessionRevokedPayload,
} from '@/interface/Security/NewDeviceAlert.interface'
import { mainRoutes } from '@/routes/MainRoutes'
import { useLocalePath } from '@/ultis/route'
import {
	ensureSecurityAlertAnchor,
	isSecurityAlertBeforeAnchor,
	isWithinPendingAlertGrace,
} from '@/ultis/security'
import {
	handleRemoveAllCookie,
	handleRemoveAllSession,
	isLogin,
	setSessionStorage,
} from '@/ultis/storage'
import { SECURITY_ALERT_ACK_SESSION_KEY } from '@/Variable/common.variable'

import { useSocket } from './SocketContext'

type SecurityStep = 'notice' | 'secure'

/** Temporary kill-switch for the "New login detected" popup. Set true to restore. */
const NEW_DEVICE_LOGIN_CHECK_ENABLED = true

/** Kill-switch for the legacy change_device / change_password sign-out events. */
const LEGACY_DEVICE_EVENTS_ENABLED = true

/** Extracts pending alerts from the supported API response envelopes. */
const getAlertsFromResponse = (response: any): unknown[] => {
	const alerts =
		response?.results?.object?.alerts ??
		response?.results?.alerts ??
		response?.alerts

	return Array.isArray(alerts) ? alerts : []
}

/** Returns a user-safe API error message. */
const getErrorMessage = (error: any) => {
	return (
		error?.message ||
		error?.errors?.[0]?.message ||
		'Please try again in a moment.'
	)
}

/** Coordinates new-device alerts and revoked sessions across all app pages. */
export const NewDeviceSecurityProvider = ({
	children,
}: {
	children: React.ReactNode
}) => {
	const { socket } = useSocket() ?? { socket: null }
	const router = useRouter()
	const { onGetPath, onChangeRoute } = useLocalePath()

	const [currentAlert, setCurrentAlert] = useState<NewDeviceAlert | null>(null)
	const [step, setStep] = useState<SecurityStep>('notice')
	const [loading, setLoading] = useState(false)

	const currentAlertRef = useRef<NewDeviceAlert | null>(null)
	const handledAlertIdsRef = useRef(new Set<string>())
	const isSessionRevokedRef = useRef(false)

	/** Closes the current alert modal. */
	const handleCompleteCurrentAlert = useCallback(() => {
		currentAlertRef.current = null
		setCurrentAlert(null)
		setStep('notice')
	}, [])

	/** Validates, deduplicates, and displays an incoming new-device alert. */
	const handleNewDeviceAlert = useCallback(async (payload: unknown) => {
		if (!NEW_DEVICE_LOGIN_CHECK_ENABLED) return

		const alert = parseNewDeviceAlert(payload)
		if (!alert || handledAlertIdsRef.current.has(alert.id)) return

		// Logins that happened before this browser signed in are backlog, not a warning
		// about the current session.
		if (isSecurityAlertBeforeAnchor(alert.login_at ?? alert.created_at)) return

		const ownDeviceId = await getFid()
		if (!ownDeviceId || ownDeviceId === alert.new_device_id) return

		handledAlertIdsRef.current.add(alert.id)
		if (currentAlertRef.current) return

		currentAlertRef.current = alert
		setCurrentAlert(alert)
		setStep('notice')
	}, [])

	/** Drops the local session and sends this device back to sign-in. */
	const handleForceSignOut = useCallback(
		({
			title,
			content,
			toastId,
		}: {
			title: string
			content: string
			toastId: string
		}) => {
			if (isSessionRevokedRef.current) return

			isSessionRevokedRef.current = true
			socket?.disconnect()
			handleRemoveAllCookie()
			handleRemoveAllSession()

			showSocketToast({ title, content, toastId })
			router.replace(onGetPath(mainRoutes.login))
		},
		[onGetPath, router, socket],
	)

	/** Clears the local session after the backend revokes this device. */
	const handleSessionRevoked = useCallback(
		async (payload: SessionRevokedPayload = {}) => {
			if (isSessionRevokedRef.current) return

			const ownDeviceId = await getFid()
			if (
				payload.except_device_id &&
				ownDeviceId === payload.except_device_id
			) {
				return
			}

			const passwordChanged = payload.reason === 'password_changed'
			handleForceSignOut({
				title: passwordChanged ? 'Password changed' : 'Session ended',
				content: passwordChanged
					? 'Your password was changed. Please sign in again.'
					: 'This device was signed out to secure your account.',
				toastId: 'session-revoked',
			})
		},
		[handleForceSignOut],
	)

	/** Handles the legacy single-session events kept for older backends. */
	const handleLegacyDeviceEvent = useCallback(
		async (payload: unknown, event: LegacyDeviceEvent) => {
			if (!LEGACY_DEVICE_EVENTS_ENABLED) return
			if (isSessionRevokedRef.current) return

			// Without an identifier this device cannot be told apart from the new one,
			// so staying signed in is safer than a wrong sign-out.
			const validDeviceId = getLegacyEventDeviceId(payload)
			if (!validDeviceId) return

			const ownDeviceId = await getFid()
			if (!ownDeviceId || ownDeviceId === validDeviceId) return

			const passwordChanged = event === 'change_password'
			handleForceSignOut({
				title: passwordChanged
					? 'Password changed'
					: 'Signed in on another device',
				content:
					getLegacyEventMessage(payload, event) ||
					(passwordChanged
						? 'Your password was changed. Please sign in again.'
						: 'Your account is now in use on another device. Please sign in again.'),
				toastId: `legacy-${event}`,
			})
		},
		[handleForceSignOut],
	)

	/** Acknowledges that the new login belongs to the current user. */
	const handleConfirmLogin = useCallback(async () => {
		const alert = currentAlertRef.current
		if (!alert || loading) return

		setLoading(true)
		handleCompleteCurrentAlert()

		try {
			await acknowledgeSecurityAlert(alert.id)
		} catch (error) {
			handledAlertIdsRef.current.delete(alert.id)
			showSocketToast({
				title: 'Unable to confirm this login',
				content: getErrorMessage(error),
				toastId: 'acknowledge-security-alert-error',
			})
		} finally {
			setLoading(false)
		}
	}, [handleCompleteCurrentAlert, loading])

	/** Opens the second security-action step. */
	const handleSecureAccount = useCallback(() => {
		setStep('secure')
	}, [])

	/** Acknowledges the alert and revokes all other device sessions. */
	const handleLogoutOtherDevices = useCallback(async () => {
		if (!currentAlertRef.current || loading) return

		setLoading(true)
		try {
			await acknowledgeSecurityAlert(currentAlertRef.current.id)
			await logoutOtherDevices()
			handleCompleteCurrentAlert()
			showSocketToast({
				title: 'Account secured',
				content: 'All other devices have been signed out.',
				variant: 'success',
				toastId: 'logout-other-devices-success',
				showClose: false,
			})
		} catch (error) {
			showSocketToast({
				title: 'Unable to sign out other devices',
				content: getErrorMessage(error),
				toastId: 'logout-other-devices-error',
			})
		} finally {
			setLoading(false)
		}
	}, [handleCompleteCurrentAlert, loading])

	/** Closes the alert and opens the account password screen. */
	const handleChangePassword = useCallback(() => {
		const alertId = currentAlertRef.current?.id
		// The password screen acknowledges this alert once the change succeeds.
		if (alertId) {
			setSessionStorage({
				key: SECURITY_ALERT_ACK_SESSION_KEY,
				data: { alertId },
			})
		}

		currentAlertRef.current = null
		setCurrentAlert(null)
		setStep('notice')
		onChangeRoute(`${mainRoutes.accountSetting}/manage-account/change`)
	}, [onChangeRoute])

	/** Fetches alerts missed while the app was closed or disconnected. */
	const handleFetchPendingAlerts = useCallback(async () => {
		if (!NEW_DEVICE_LOGIN_CHECK_ENABLED) return
		if (!isLogin()) return
		// Right after signing in, realtime events already cover new logins.
		if (isWithinPendingAlertGrace()) return

		try {
			const response = await getPendingSecurityAlerts()
			const alerts = getAlertsFromResponse(response)
			if (alerts[0]) {
				void handleNewDeviceAlert(alerts[0])
			}
		} catch (error) {
			console.error('Unable to fetch pending security alerts', error)
		}
	}, [handleNewDeviceAlert])

	useEffect(() => {
		if (!socket) return

		const handleChangeDevice = (payload: unknown) => {
			void handleLegacyDeviceEvent(payload, 'change_device')
		}
		const handleChangePassword = (payload: unknown) => {
			void handleLegacyDeviceEvent(payload, 'change_password')
		}

		socket.on('new_device_login', handleNewDeviceAlert)
		socket.on('session_revoked', handleSessionRevoked)
		socket.on('change_device', handleChangeDevice)
		socket.on('change_password', handleChangePassword)
		return () => {
			socket.off('new_device_login', handleNewDeviceAlert)
			socket.off('session_revoked', handleSessionRevoked)
			socket.off('change_device', handleChangeDevice)
			socket.off('change_password', handleChangePassword)
		}
	}, [
		handleLegacyDeviceEvent,
		handleNewDeviceAlert,
		handleSessionRevoked,
		socket,
	])

	useEffect(() => {
		if (!messaging) return

		return onMessage(messaging, (payload) => {
			const data = payload?.data
			if (
				data?.action === 'NEW_DEVICE_LOGIN' ||
				data?.message === 'new_device_login'
			) {
				void handleNewDeviceAlert(data)
			}
		})
	}, [handleNewDeviceAlert])

	useEffect(() => {
		if (!isLogin()) return

		// Sessions signed in before this check shipped get an anchor from now on.
		ensureSecurityAlertAnchor()
		void handleFetchPendingAlerts()
	}, [handleFetchPendingAlerts])

	useEffect(() => {
		if (!socket) return

		/** Catches alerts missed while the socket was disconnected. */
		const handleReconnect = () => {
			void handleFetchPendingAlerts()
		}

		socket.on('connect', handleReconnect)
		return () => {
			socket.off('connect', handleReconnect)
		}
	}, [handleFetchPendingAlerts, socket])

	return (
		<>
			{children}
			{currentAlert ? (
				<NewDeviceSecurityModal
					alert={currentAlert}
					step={step}
					loading={loading}
					onConfirmLogin={handleConfirmLogin}
					onSecureAccount={handleSecureAccount}
					onLogoutOtherDevices={handleLogoutOtherDevices}
					onChangePassword={handleChangePassword}
				/>
			) : null}
		</>
	)
}
