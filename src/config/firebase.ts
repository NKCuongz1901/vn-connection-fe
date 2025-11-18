'use client'
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getMessaging, Messaging } from 'firebase/messaging'
import { getInstallations, getId } from 'firebase/installations'

const firebaseConfig = {
	apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
	authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
	projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
	storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Khởi tạo Firebase App nếu chưa có
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

// Lấy FID (Firebase Installation ID)
let cachedFid: string | null = null
export const getFid = async (): Promise<string | null> => {
	if (cachedFid) return cachedFid
	try {
		const installations = getInstallations(app)
		cachedFid = await getId(installations)
		return cachedFid
	} catch (err) {
		console.error('Firebase FID error:', err)
		return null
	}
}

// Messaging (chỉ client)
export let messaging: Messaging | null = null
if (typeof window !== 'undefined' && 'Notification' in window) {
	messaging = getMessaging(app)
}
