// lib/fcm.ts
import { getToken } from 'firebase/messaging'
import { appEnv, firebaseDefaultConfig, messaging } from './firebase'

async function getMessagingServiceWorkerRegistration() {
	if (!('serviceWorker' in navigator)) return undefined

	const swParams = new URLSearchParams({
		env: appEnv,
		apiKey:
			process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
			firebaseDefaultConfig.apiKey,
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
		appId:
			process.env.NEXT_PUBLIC_FIREBASE_APP_ID || firebaseDefaultConfig.appId,
	})

	const swUrl = `/firebase-messaging-sw.js?${swParams.toString()}`
	return navigator.serviceWorker.register(swUrl)
}

export async function initFCM() {
	if (typeof window === 'undefined' || !('Notification' in window)) {
		console.log('❌ Không hỗ trợ FCM trong môi trường này')
		return null
	}

	const permission = await Notification.requestPermission()
	if (permission !== 'granted') {
		console.log('❌ User từ chối notification')
		return null
	}

	try {
		const serviceWorkerRegistration =
			await getMessagingServiceWorkerRegistration()

		const token = await getToken(messaging!, {
			vapidKey:
				process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ||
				firebaseDefaultConfig.vapidKey,
			serviceWorkerRegistration,
		})
		console.log('📌 FCM Token:', token)
		return token
	} catch (err) {
		console.error('🔥 Lỗi khi lấy token:', err)
		return null
	}
}
