import Party from '@/svg/Party'
import { mainRoutes } from './MainRoutes'
import People from '@/svg/People'
import Event from '@/svg/Event'
import UpcomingEvent from '@/svg/UpcomingEvent'
import Message3 from '@/svg/Message3'
import SearchNormal from '@/svg/SearchNormal'
import Messenger from '@/svg/Messenger'
import TwoUser from '@/svg/TwoUser'
import Heart from '@/svg/Heart'

export const AUTH_ROUTES = {
	loginPhone: '/auth/login_by_phone',
	checkPhoneExists: '/auth/check_phone_exists',
	sendOTP: '/auth/otp/send',
	verifyOTP: '/auth/otp/verify',
	forgetPassword: '/auth/forget_password',
	registerByPhone: '/auth/register_by_phone',
}
export const USER_ROUTES = {
	profile: '/user/profile',
}
export const Menus = [
	{
		title: 'Hangout',
		Icon: Party,
		path: mainRoutes.hangout,
		child: [],
	},
	{
		title: 'My networks',
		Icon: People,
		path: mainRoutes.network,
		child: [],
	},
	{
		title: 'My Events',
		Icon: Event,
		path: mainRoutes.event,
		child: [],
	},
	{
		title: 'Upcoming Events',
		Icon: UpcomingEvent,
		path: mainRoutes.upcomingEvent,
		child: [],
	},
	{
		title: 'Discussions',
		Icon: Message3,
		path: mainRoutes.discussions,
		child: [],
	},
	{
		title: 'Search',
		Icon: SearchNormal,
		path: mainRoutes.search,
		child: [],
	},
	{
		title: 'Inbox',
		Icon: Messenger,
		path: mainRoutes.inbox,
		child: [],
	},
	{
		title: 'Friends',
		Icon: TwoUser,
		path: mainRoutes.friend,
		child: [],
	},
	{
		title: 'Dating',
		Icon: Heart,
		path: mainRoutes.dating,
		child: [],
	},
]
