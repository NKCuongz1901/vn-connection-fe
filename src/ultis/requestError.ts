'use client'
import { logEvent } from 'firebase/analytics'

import { analytics } from '@/config/firebase'

// Why a request ended without any HTTP response from the server.
// - timeout: the request was sent but no answer arrived in time
// - network: the browser could not reach the server (offline, DNS, blocked, CORS, dropped)
// - cancelled: the request was aborted by the browser or the app (page unload, abort signal)
// - client: the request was never sent because building it failed
export type NoResponseReason = 'timeout' | 'network' | 'cancelled' | 'client'

const NO_RESPONSE_MESSAGES: Record<NoResponseReason, string> = {
	timeout:
		'The server took too long to respond. Please check your connection and try again.',
	network:
		'Network error: could not reach the server. Please check your connection and try again.',
	cancelled: 'The request was cancelled before it finished. Please try again.',
	client: 'The request could not be sent. Please try again.',
}

// Rejected by the axios response interceptor when a request got NO HTTP response.
// Requests that got an HTTP error response keep rejecting with the server's body.
export class RequestNoResponseError extends Error {
	readonly isNoResponse = true
	readonly reason: NoResponseReason
	readonly method: string
	readonly endpoint: string
	readonly axiosCode?: string

	constructor({
		reason,
		method,
		endpoint,
		axiosCode,
	}: {
		reason: NoResponseReason
		method: string
		endpoint: string
		axiosCode?: string
	}) {
		super(NO_RESPONSE_MESSAGES[reason])
		this.name = 'RequestNoResponseError'
		this.reason = reason
		this.method = method
		this.endpoint = endpoint
		this.axiosCode = axiosCode
	}
}

export const isNoResponseError = (error: any): error is RequestNoResponseError =>
	!!error && error.isNoResponse === true

export const classifyNoResponse = (error: any): NoResponseReason => {
	const code = error?.code
	const message = String(error?.message || '')
	if (code === 'ETIMEDOUT' || /timeout/i.test(message)) return 'timeout'
	if (
		code === 'ERR_CANCELED' ||
		code === 'ECONNABORTED' ||
		error?.name === 'CanceledError' ||
		error?.__CANCEL__
	) {
		return 'cancelled'
	}
	if (!error?.request) return 'client'
	return 'network'
}

// Path only, never the query string, so nothing a user typed ends up in a log.
export const describeEndpoint = (config: any): string => {
	const url = String(config?.url || '')
	const path = url.split('?')[0]
	return path || '(unknown)'
}

export type FailedRequestRecord = {
	time: string
	method: string
	endpoint: string
	reason: string
	status?: number
	axiosCode?: string
	online?: boolean
}

const LOG_PREFIX = '[UniVini request failed]'
const MAX_KEPT_FAILURES = 50

// Every failed request is written to the console, kept in a small in-page list that a
// developer or tester can read from DevTools with `window.__univiniFailedRequests`, and,
// for failures without a response or with a 5xx, sent to the Firebase Analytics the app
// already initializes, as the event `api_request_failed`.
export const recordFailedRequest = (record: FailedRequestRecord) => {
	try {
		console.warn(LOG_PREFIX, record)

		if (typeof window === 'undefined') return

		const w = window as any
		const kept: FailedRequestRecord[] = Array.isArray(w.__univiniFailedRequests)
			? w.__univiniFailedRequests
			: []
		kept.push(record)
		if (kept.length > MAX_KEPT_FAILURES) {
			kept.splice(0, kept.length - MAX_KEPT_FAILURES)
		}
		w.__univiniFailedRequests = kept

		const isServerSide = typeof record.status === 'number' && record.status >= 500
		if (analytics && (record.status === undefined || isServerSide)) {
			logEvent(analytics, 'api_request_failed', {
				endpoint: record.endpoint.slice(0, 100),
				method: record.method,
				reason: record.reason,
				status: record.status ?? 0,
				online: record.online === false ? 'no' : 'yes',
			})
		}
	} catch {
		// Logging must never break the request flow.
	}
}
