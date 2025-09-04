// lib/fcm.ts
import { getToken } from 'firebase/messaging'
import { messaging } from './firebase'

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
		const token = await getToken(messaging!, {
			vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
		})
		console.log('📌 FCM Token:', token)
		return token
	} catch (err) {
		console.error('🔥 Lỗi khi lấy token:', err)
		return null
	}
}
