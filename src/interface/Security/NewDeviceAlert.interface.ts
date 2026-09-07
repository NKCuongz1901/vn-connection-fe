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

export type LegacyDeviceEvent = 'change_device' | 'change_password'

/** Reads a socket payload that may arrive as an object or a JSON string. */
const toPayloadObject = (payload: unknown): Record<string, unknown> | null => {
	if (!payload) return null

	if (typeof payload === 'string') {
		try {
			const parsed = JSON.parse(payload)
			return typeof parsed === 'object' && parsed
				? (parsed as Record<string, unknown>)
				: null
		} catch {
			return null
		}
	}

	return typeof payload === 'object'
		? (payload as Record<string, unknown>)
		: null
}

const getTrimmedString = (value: unknown) =>
	typeof value === 'string' && value.trim() ? value.trim() : ''

/** Extracts the device the legacy change_device / change_password event keeps valid. */
export const getLegacyEventDeviceId = (payload: unknown): string => {
	const data = toPayloadObject(payload)
	if (!data) return ''

	return (
		getTrimmedString(data.fcm_token_valid) ||
		getTrimmedString(data.device_id) ||
		getTrimmedString(data.fcm_token)
	)
}

/** Extracts the server message of a legacy event, ignoring raw event names. */
export const getLegacyEventMessage = (
	payload: unknown,
	event: LegacyDeviceEvent,
): string => {
	const data = toPayloadObject(payload)
	const message = getTrimmedString(data?.message)

	return message === event ? '' : message
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
export const parseNewDeviceAlert = (
	payload: unknown,
): NewDeviceAlert | null => {
	if (!payload || typeof payload !== 'object') return null

	const alert = payload as Record<string, unknown>
	const id = typeof alert.id === 'string' ? alert.id.trim() : ''
	const newDeviceId =
		typeof alert.new_device_id === 'string' ? alert.new_device_id.trim() : ''

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
