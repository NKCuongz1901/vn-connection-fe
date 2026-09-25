'use client'

import {
	acknowledgeSecurityAlert,
	getPendingSecurityAlerts,
} from '@/apis/userApis'
import { parseNewDeviceAlert } from '@/interface/Security/NewDeviceAlert.interface'

/** Extracts pending alerts from the supported API response envelopes. */
export const getAlertsFromResponse = (response: any): unknown[] => {
	const alerts =
		response?.results?.object?.alerts ??
		response?.results?.alerts ??
		response?.alerts

	return Array.isArray(alerts) ? alerts : []
}

/**
 * Acknowledges every pending alert for the same device so one "Yes" clears the backlog.
 * Falls back to a single alert id when pending cannot be loaded.
 */
export const acknowledgeAlertsForDevice = async ({
	deviceId,
	fallbackAlertId,
}: {
	deviceId?: string
	fallbackAlertId?: string
}) => {
	if (!deviceId && !fallbackAlertId) return [] as string[]

	try {
		const response = await getPendingSecurityAlerts()
		const alerts = getAlertsFromResponse(response)
			.map(parseNewDeviceAlert)
			.filter((alert): alert is NonNullable<typeof alert> => !!alert)
			.filter((alert) =>
				deviceId ? alert.new_device_id === deviceId : alert.id === fallbackAlertId,
			)

		const targets =
			alerts.length > 0
				? alerts
				: fallbackAlertId
					? [{ id: fallbackAlertId, new_device_id: deviceId || '' }]
					: []

		await Promise.allSettled(
			targets.map((alert) => acknowledgeSecurityAlert(alert.id)),
		)

		return targets.map((alert) => alert.id)
	} catch (error) {
		if (fallbackAlertId) {
			await acknowledgeSecurityAlert(fallbackAlertId)
			return [fallbackAlertId]
		}
		throw error
	}
}
