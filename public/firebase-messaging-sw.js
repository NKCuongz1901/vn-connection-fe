importScripts(
	'https://www.gstatic.com/firebasejs/9.6.10/firebase-app-compat.js',
)
importScripts(
	'https://www.gstatic.com/firebasejs/9.6.10/firebase-messaging-compat.js',
)

firebase.initializeApp({
	apiKey: 'AIzaSyDfcC1XJ6KVwxSIp-SCBwTgqbEqOyA7UZI',
	authDomain: 'vn-connections.firebaseapp.com',
	projectId: 'vn-connections',
	storageBucket: 'vn-connections.firebasestorage.app',
	messagingSenderId: '642636000783',
	appId: '1:642636000783:web:d320eda63721086184fd7a',
})

const messaging = firebase.messaging()

// 🔔 Xử lý noti khi app ở background
const mainRoutes = {
	home: '/',
	login: 'login',
	forgetPassword: 'forget-password',
	register: 'register',
	hangout: 'hangout',
	network: 'network',
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
