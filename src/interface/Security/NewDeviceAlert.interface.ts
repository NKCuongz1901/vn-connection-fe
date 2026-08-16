export type NewDeviceInfo = {
	id?: string
	name?: string
	model?: string
	platform?: 'ios' | 'android' | 'web' | string
}

export type NewDeviceAlert = {
	id: string
	event_type?: string
	action?: string
	message?: string
	login_at?: string
	location?: string
	device?: NewDeviceInfo
	new_device_id: string
	created_at?: string
}

export type SessionRevokedPayload = {
	message?: string
	except_device_id?: string
	reason?: 'security_action' | 'password_changed' | string
}

/** Parses device metadata sent as either an object or an FCM JSON string. */
const parseDevice = (device: unknown): NewDeviceInfo | undefined => {
	if (!device) return undefined

	if (typeof device === 'string') {
		try {
			const parsedDevice = JSON.parse(device)
			return typeof parsedDevice === 'object' && parsedDevice
				? parsedDevice
				: undefined
		} catch {
			return undefined
		}
	}

	return typeof device === 'object' ? (device as NewDeviceInfo) : undefined
}

/** Normalizes socket, FCM, and pending API payloads into one alert shape. */
export const parseNewDeviceAlert = (payload: unknown): NewDeviceAlert | null => {
	if (!payload || typeof payload !== 'object') return null

	const alert = payload as Record<string, unknown>
	const id = typeof alert.id === 'string' ? alert.id.trim() : ''
	const newDeviceId =
		typeof alert.new_device_id === 'string'
			? alert.new_device_id.trim()
			: ''

	if (!id || !newDeviceId) return null

	return {
		id,
		event_type:
			typeof alert.event_type === 'string' ? alert.event_type : undefined,
		action: typeof alert.action === 'string' ? alert.action : undefined,
		message: typeof alert.message === 'string' ? alert.message : undefined,
		login_at: typeof alert.login_at === 'string' ? alert.login_at : undefined,
		location:
			typeof alert.location === 'string' && alert.location.trim()
				? alert.location.trim()
				: 'Unknown',
		device: parseDevice(alert.device),
		new_device_id: newDeviceId,
		created_at:
			typeof alert.created_at === 'string' ? alert.created_at : undefined,
	}
}
