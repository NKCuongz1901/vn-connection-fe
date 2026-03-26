'use client'
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics'
import { getMessaging, Messaging } from 'firebase/messaging'
import { getInstallations, getId } from 'firebase/installations'

export const appEnv: 'DEV' | 'PROD' =
	process.env.NEXT_PUBLIC_ENV === 'PROD' ? 'PROD' : 'DEV'

export const firebaseDefaultConfig = {
	apiKey: 'AIzaSyDfcC1XJ6KVwxSIp-SCBwTgqbEqOyA7UZI',
	authDomain: 'vn-connections.firebaseapp.com',
	projectId: 'vn-connections',
	storageBucket: 'vn-connections.firebasestorage.app',
	messagingSenderId: '642636000783',
	appId: '1:642636000783:web:e3b1563542eba55184fd7a',
	measurementId: 'G-7409HEQ604',
	vapidKey:
		'BGnFk50xkH-uPdAc_1uqE3MrBdN9BVe_YRgxQKWym8DAhBqXgicswyU6XE52CPl8qGju6WsCgHiTLw9knv8QyNo',
}

const firebaseConfig = {
	apiKey:
		process.env.NEXT_PUBLIC_FIREBASE_API_KEY || firebaseDefaultConfig.apiKey,
	authDomain:
		process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
		firebaseDefaultConfig.authDomain,
	projectId:
		process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
		firebaseDefaultConfig.projectId,
	storageBucket:
		process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
		firebaseDefaultConfig.storageBucket,
	messagingSenderId:
		process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
		firebaseDefaultConfig.messagingSenderId,
	appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || firebaseDefaultConfig.appId,
	measurementId:
		process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ||
		firebaseDefaultConfig.measurementId,
}

// Khởi tạo Firebase App nếu chưa có
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

// Analytics (chỉ client và browser hỗ trợ)
export let analytics: Analytics | null = null
if (typeof window !== 'undefined') {
	isSupported().then((supported) => {
		if (supported) {
			analytics = getAnalytics(app)
		}
	})
}

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
