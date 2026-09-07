'use client'

const SECURITY_ALERT_ANCHOR_KEY = 'security_alert_anchor_at'

/** Pending alerts stay muted for this long right after signing in on this browser. */
export const PENDING_ALERT_GRACE_MS = 3 * 60 * 1000

/** Stores when this browser signed in, so older alerts are treated as backlog. */
export const markSecurityAlertAnchor = (at: number = Date.now()) => {
	if (typeof window === 'undefined') return

	try {
		localStorage.setItem(SECURITY_ALERT_ANCHOR_KEY, String(at))
	} catch {
		// Storage can be unavailable in private mode; alerts then fall back to no anchor.
	}
}

export const getSecurityAlertAnchor = (): number => {
	if (typeof window === 'undefined') return 0

	try {
		return Number(localStorage.getItem(SECURITY_ALERT_ANCHOR_KEY)) || 0
	} catch {
		return 0
	}
}

/** Creates an anchor for sessions that signed in before this check existed. */
export const ensureSecurityAlertAnchor = (): number => {
	const anchor = getSecurityAlertAnchor()
	if (anchor) return anchor

	const now = Date.now()
	markSecurityAlertAnchor(now)
	return now
}

/** True while pending alerts should be skipped after a fresh sign-in. */
export const isWithinPendingAlertGrace = (anchor = getSecurityAlertAnchor()) => {
	if (!anchor) return false
	return Date.now() - anchor < PENDING_ALERT_GRACE_MS
}

/** True when the alert happened before this browser signed in. */
export const isSecurityAlertBeforeAnchor = (
	alertTime?: string,
	anchor = getSecurityAlertAnchor(),
) => {
	if (!anchor || !alertTime) return false

	const alertAt = new Date(alertTime).getTime()
	if (Number.isNaN(alertAt)) return false

	return alertAt < anchor
}
