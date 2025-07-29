import Event from '@/svg/Event'
// import Heart from '@/svg/Heart'
import Message3 from '@/svg/Message3'
import Messenger from '@/svg/Messenger'
import OverviewIcon from '@/svg/OverviewIcon'
import Party from '@/svg/Party'
// import People from '@/svg/People'
// import SearchNormal from '@/svg/SearchNormal'
import TwoUser from '@/svg/TwoUser'
import UpcomingEvent from '@/svg/UpcomingEvent'

import { mainRoutes } from './MainRoutes'

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
	user: '/user',
	block: '/user/block',
	report: '/feedback',
}
export const POST_ROUTES = {
	name: 'post',
	myPost: 'post/my',
	participant: 'participant',
	actionMultiWaiting: 'participant/action-multi-waiting',
	search: 'post/search',
	comment: 'comment',
	updateMember: 'post/update-member',
	sticker: 'sticker',
	myEventInHome: 'post/my-event-in-home',
}
export const CONVERSATION_ROUTES = {
	name: 'conversation',
	sendById: 'conversation/send-message-by-user-id',
	categoryList: 'conversation/category-list',
	networkGroup: 'conversation/network-group',
	createConversation: 'conversation/create-conversation',
	stranger: 'conversation/stranger',
	personal: 'conversation/personal',
	sendMess: 'conversation/send-message',
	message: 'message',
	messagePin: 'message/pin',
}
export const FRIEND_ROUTES = {
	name: '/friend',
	myFriend: 'friend/my',
	myRequest: 'friend/my-request',
	mySent: 'friend/my-sent',
}
export const UPLOAD_ROUTES = {
	name: '/image/upload',
}
export const HANGOUT_ROUTES = {
	name: 'hangout',
	userOpenHangoutNow: 'hangout/user-open-hangout-now',
	userOpenHangout: 'hangout/user-open-hangout',
	search: 'hangout/search',
	myPast: 'hangout/my-past',
	myCurrent: 'hangout/my-current',
	hangoutWaiting: 'participant/waiting',
}
export const DISCUSS_ROUTES = {
	name: 'discuss',
	likeDiscuss: 'discuss/like',
}
export const CATEGORY_ROUTES = {
	name: 'category',
	myCategory: 'category/my',
	categoryRecommend: 'category/recommend',
	likeCategory: 'category/like',
	categoryExplore: 'category/explore',
}

export const Menus = [
	{
		title: 'Overview',
		Icon: OverviewIcon,
		path: mainRoutes.overview,
		child: [],
	},
	{
		title: 'Hangout',
		Icon: Party,
		path: mainRoutes.hangout,
		child: [],
	},
	// {
	// 	title: 'My networks',
	// 	Icon: People,
	// 	path: mainRoutes.network,
	// 	child: [],
	// },
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

	// {
	// 	title: 'Search',
	// 	Icon: SearchNormal,
	// 	path: mainRoutes.search,
	// 	child: [],
	// },
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
	// {
	// 	title: 'Dating',
	// 	Icon: Heart,
	// 	path: mainRoutes.dating,
	// 	child: [],
	// },
]
