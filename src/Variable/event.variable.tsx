import { mainRoutes } from '@/routes/MainRoutes'

export const mappingEventTitle = {
	[mainRoutes.event]: 'My activities',
	[mainRoutes.upcomingEvent]: 'Upcoming activities',
}

export const participantType = {
	OWNER: 'OWNER',
	USER: 'USER',
	ADMIN: 'ADMIN',
}

export const mappingTabBtn = {
	interested: 'interested',
	my: 'my',
}
export const tabBtns = [
	{ value: mappingTabBtn.interested, label: 'Interested activities' },
	{ value: mappingTabBtn.my, label: 'My activities' },
]
