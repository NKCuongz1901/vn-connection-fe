'use client'

import { onMessage } from 'firebase/messaging'
import { useRouter } from 'next/navigation'
import {
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'react'

import {
	acknowledgeSecurityAlert,
	getPendingSecurityAlerts,
	logoutOtherDevices,
} from '@/apis/userApis'
import NewDeviceSecurityModal from '@/Components/Modal/NewDeviceSecurityModal'
import { showSocketToast } from '@/Components/Toast/SocketToastContent'
import { getFid, messaging } from '@/config/firebase'
import {
	NewDeviceAlert,
	parseNewDeviceAlert,
	SessionRevokedPayload,
} from '@/interface/Security/NewDeviceAlert.interface'
import { mainRoutes } from '@/routes/MainRoutes'
import { useLocalePath } from '@/ultis/route'
import {
	handleRemoveAllCookie,
	handleRemoveAllSession,
	isLogin,
} from '@/ultis/storage'

import { useSocket } from './SocketContext'

type SecurityStep = 'notice' | 'secure'

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
		const alert = parseNewDeviceAlert(payload)
		if (!alert || handledAlertIdsRef.current.has(alert.id)) return

		const ownDeviceId = await getFid()
		if (!ownDeviceId || ownDeviceId === alert.new_device_id) return

		handledAlertIdsRef.current.add(alert.id)
		if (currentAlertRef.current) return

		currentAlertRef.current = alert
		setCurrentAlert(alert)
		setStep('notice')
	}, [])

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

			isSessionRevokedRef.current = true
			socket?.disconnect()
			handleRemoveAllCookie()
			handleRemoveAllSession()

			const passwordChanged = payload.reason === 'password_changed'
			showSocketToast({
				title: passwordChanged ? 'Password changed' : 'Session ended',
				content: passwordChanged
					? 'Your password was changed. Please sign in again.'
					: 'This device was signed out to secure your account.',
				toastId: 'session-revoked',
			})
			router.replace(onGetPath(mainRoutes.login))
		},
		[onGetPath, router, socket],
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
		currentAlertRef.current = null
		setCurrentAlert(null)
		setStep('notice')
		onChangeRoute(`${mainRoutes.accountSetting}/manage-account/change`)
	}, [onChangeRoute])

	/** Fetches alerts missed while the app was closed or disconnected. */
	const handleFetchPendingAlerts = useCallback(async () => {
		if (!isLogin()) return

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

		socket.on('new_device_login', handleNewDeviceAlert)
		socket.on('session_revoked', handleSessionRevoked)
		return () => {
			socket.off('new_device_login', handleNewDeviceAlert)
			socket.off('session_revoked', handleSessionRevoked)
		}
	}, [handleNewDeviceAlert, handleSessionRevoked, socket])

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
		void handleFetchPendingAlerts()

		/** Checks for missed alerts whenever the browser tab becomes active. */
		const handleVisibilityChange = () => {
			if (document.visibilityState === 'visible') {
				void handleFetchPendingAlerts()
			}
		}

		document.addEventListener('visibilitychange', handleVisibilityChange)
		return () => {
			document.removeEventListener('visibilitychange', handleVisibilityChange)
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
