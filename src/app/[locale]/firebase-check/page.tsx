'use client'

import { useState } from 'react'
import { getAnalytics, isSupported, logEvent } from 'firebase/analytics'

import { app, getFid } from '@/config/firebase'
import { initFCM } from '@/config/firebase-messaging'

const Page = () => {
	const [eventName, setEventName] = useState('web_check_submit')
	const [eventParamsText, setEventParamsText] = useState(
		'{"source":"manual_test","screen":"firebase_check"}',
	)
	const [fid, setFid] = useState('')
	const [fcmToken, setFcmToken] = useState('')
	const [status, setStatus] = useState('Idle')

	const handleSendAnalytics = async () => {
		try {
			setStatus('Sending analytics event...')
			const supported = await isSupported()
			if (!supported) {
				setStatus('Analytics is not supported in this browser')
				return
			}

			const analytics = getAnalytics(app)
			const parsedParams = eventParamsText.trim()
				? JSON.parse(eventParamsText)
				: {}

			logEvent(analytics, eventName, {
				...parsedParams,
				env: process.env.NEXT_PUBLIC_ENV || 'DEV',
				ts: Date.now(),
			})
			setStatus('Analytics event sent successfully')
		} catch (error: any) {
			setStatus(`Send analytics failed: ${error?.message || 'Unknown error'}`)
		}
	}

	const handleGetFid = async () => {
		setStatus('Getting Firebase Installation ID...')
		const installationId = await getFid()
		if (!installationId) {
			setStatus('Cannot get FID. Check API key referrer restrictions.')
			return
		}
		setFid(installationId)
		setStatus('Got FID successfully')
	}

	const handleGetFcmToken = async () => {
		setStatus('Getting FCM token...')
		const token = await initFCM()
		if (!token) {
			setStatus('Cannot get FCM token. Check permission, VAPID key, and SW config.')
			return
		}
		setFcmToken(token)
		setStatus('Got FCM token successfully')
	}

	return (
		<div style={{ maxWidth: 960, margin: '24px auto', padding: 16 }}>
			<h2 style={{ marginBottom: 12 }}>Firebase Check</h2>
			<p style={{ marginBottom: 16 }}>
				Use this page to send Analytics events and verify FID/FCM data from your browser.
			</p>

			<div style={{ marginBottom: 12 }}>
				<label htmlFor='event-name'>Event name</label>
				<input
					id='event-name'
					value={eventName}
					onChange={(e) => setEventName(e.target.value)}
					style={{ width: '100%', marginTop: 6, padding: 8 }}
				/>
			</div>

			<div style={{ marginBottom: 12 }}>
				<label htmlFor='event-params'>Event params (JSON)</label>
				<textarea
					id='event-params'
					value={eventParamsText}
					onChange={(e) => setEventParamsText(e.target.value)}
					rows={6}
					style={{ width: '100%', marginTop: 6, padding: 8, fontFamily: 'monospace' }}
				/>
			</div>

			<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
				<button type='button' onClick={handleSendAnalytics}>
					Send Analytics
				</button>
				<button type='button' onClick={handleGetFid}>
					Get FID
				</button>
				<button type='button' onClick={handleGetFcmToken}>
					Get FCM Token
				</button>
			</div>

			<p>
				<strong>Status:</strong> {status}
			</p>

			<div style={{ marginTop: 12 }}>
				<label htmlFor='fid'>Firebase Installation ID</label>
				<textarea
					id='fid'
					value={fid}
					readOnly
					rows={3}
					style={{ width: '100%', marginTop: 6, padding: 8, fontFamily: 'monospace' }}
				/>
			</div>

			<div style={{ marginTop: 12 }}>
				<label htmlFor='fcm-token'>FCM Token</label>
				<textarea
					id='fcm-token'
					value={fcmToken}
					readOnly
					rows={5}
					style={{ width: '100%', marginTop: 6, padding: 8, fontFamily: 'monospace' }}
				/>
			</div>
		</div>
	)
}

export default Page
