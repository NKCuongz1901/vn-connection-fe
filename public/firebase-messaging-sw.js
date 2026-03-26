importScripts(
	'https://www.gstatic.com/firebasejs/9.6.10/firebase-app-compat.js',
)
importScripts(
	'https://www.gstatic.com/firebasejs/9.6.10/firebase-messaging-compat.js',
)

const swUrl = new URL(self.location.href)
const params = swUrl.searchParams

const defaultFirebaseConfig = {
	apiKey: 'AIzaSyBVk2djUST-4cMXuHNhmr2z9hM4VpjacXg',
	authDomain: 'univini-develop.firebaseapp.com',
	projectId: 'univini-develop',
	storageBucket: 'univini-develop.firebasestorage.app',
	messagingSenderId: '34059510604',
	appId: '1:34059510604:web:9df3c716ba1274850fe5e9',
}

firebase.initializeApp({
	apiKey: params.get('apiKey') || defaultFirebaseConfig.apiKey,
	authDomain: params.get('authDomain') || defaultFirebaseConfig.authDomain,
	projectId: params.get('projectId') || defaultFirebaseConfig.projectId,
	storageBucket:
		params.get('storageBucket') || defaultFirebaseConfig.storageBucket,
	messagingSenderId:
		params.get('messagingSenderId') || defaultFirebaseConfig.messagingSenderId,
	appId: params.get('appId') || defaultFirebaseConfig.appId,
})

const messaging = firebase.messaging()

// 🔔 Xử lý noti khi app ở background
const mainRoutes = {
	home: '/',
	login: 'login',
	forgetPassword: 'forget-password',
	register: 'register',
	hangout: 'hangout',
	community: 'community',
	event: 'event',
	upcomingEvent: 'upcoming-event',
	discussions: 'discussion',
	overview: 'overview',
	search: 'search',
	inbox: 'inbox',
	friend: 'friend',
	dating: 'dating',
	profile: 'profile',
}

messaging.onBackgroundMessage((payload) => {
	const { data, notification } = payload || {}
	const { title, body, icon } = notification || {}
	let url = `${self.location.origin}/en/`

	const { action, post_id } = data || {}
	switch (action) {
		case 'COMMENT_ON_DISCUSS_IN_TOPIC':
			url += `${mainRoutes.discussions}?id=${post_id}`
			break
		case 'NEW_EVENT_CREATE_NEAR_BY_USER':
		case 'COMMENT_ON_EVENT':
			url += `${mainRoutes.upcomingEvent}?id=${post_id}`
			break
		default:
			url += mainRoutes.overview
			break
	}
	//- ${url}
	self.registration.showNotification(`${title || 'Notification'} `, {
		body: body,
		icon: icon || '/images/univini-logo.png',
		data: { url },
	})
})

// 👆 Thêm sự kiện click để mở web
self.addEventListener('notificationclick', function (event) {
	event.notification.close()

	const targetUrl =
		event.notification?.data?.url ||
		`${self.location.origin}/en/${mainRoutes.overview}`
	event.waitUntil(
		clients
			.matchAll({ type: 'window', includeUncontrolled: true })
			.then((clientList) => {
				for (const client of clientList) {
					if (client.url === targetUrl && 'focus' in client) {
						return client.focus()
					}
				}
				if (clients.openWindow) {
					return clients.openWindow(targetUrl)
				}
			}),
	)
})
