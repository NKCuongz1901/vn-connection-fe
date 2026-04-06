import Event from '@/svg/Event'
// import Heart from '@/svg/Heart'
import HappyIcon from '@/svg/HappyIcon'
import Message2Icon from '@/svg/Message2Icon'
import Message3 from '@/svg/Message3'
import Messenger from '@/svg/Messenger'
import OverviewIcon from '@/svg/OverviewIcon'
import Party from '@/svg/Party'
import People from '@/svg/People'
import SearchNormal from '@/svg/SearchNormal'
import TwoUser from '@/svg/TwoUser'
import UpcomingEvent from '@/svg/UpcomingEvent'

import { mainRoutes } from './MainRoutes'

export const AUTH_ROUTES = {
	loginPhone: '/auth/login_by_phone',
	checkPhoneExists: '/auth/check_phone_exists',
	sendOTP: '/auth/otp/send',
	verifyOTP: '/auth/otp/verify',
	checkOTP: 'auth/otp/check',
	forgetPassword: '/auth/forget_password',
	registerByPhone: '/auth/register_by_phone',
	logout: '/auth/logout',
}

export const SYSTEM = {
	systemSettings: '/system-settings',
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
	likeComment: 'comment/like',
	myEventsJoined: 'post/my-events-joined',
	myEventsPassed: 'post/my-events-passed',
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
	convSearch: 'conversation/search',
	categoryFav: 'category/favorites',
	convClub: 'conversation/club',
	convSuggest: 'conversation/suggest',
	joinConversation: 'request-join-conversation',
	leave: 'leave',
	anouncement: 'anouncement',
	anouncementLike: 'anouncement/like',
	invite: 'invite-join-conversation',
	inviteAll: 'invite-all-join-conversation',
	convChatRoom: 'conversation/chat_room',
	textToSpeech: 'files/text-to-speech',
	translate: 'vocabulary/translate-text',
	membersAroundMe: 'members-around-me',
	member: 'members',
	reactLs: 'conversation/reaction',
	messReaction: 'message/reaction',
	language: 'language',
}
export const FRIEND_ROUTES = {
	name: '/friend',
	myFriend: 'friend/my',
	myRequest: 'friend/my-request',
	mySent: 'friend/my-sent',
}
export const UPLOAD_ROUTES = {
	name: '/image/upload',
	speechToText: 'files/speech-to-text',
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
export const NOTIFICATION_ROUTES = {
	name: 'notifications',
	read: 'notifications/read',
	count: 'notifications/count',
}
export const SEARCH_ROUTES = {
	searchLocal: 'search-in-app/local',
	searchEvent: 'search-in-app/event',
	searchClub: 'search-in-app/club',
	searchCategoryUser: 'search-in-app/category-user',
	searchCategoryClub: 'search-in-app/category-club',
	searchCategoryClubMatching: 'search-in-app/club-matching-categories',
	searchCategoryUserMatching: 'search-in-app/user-matching-categories',
}
export const MAP_ROUTES = {
	name: 'map/google/place/textsearch/json',
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
	{
		title: 'My Community',
		Icon: People,
		path: mainRoutes.community,
		child: [],
	},
	{
		title: 'Chat room',
		Icon: Message2Icon,
		path: mainRoutes.chatRoom,
		child: [],
	},
	{
		title: 'Explore By Interest',
		Icon: HappyIcon,
		path: mainRoutes.exploreInterest,
		child: [],
	},
	{
		title: 'My Activities',
		Icon: Event,
		path: mainRoutes.event,
		child: [],
	},
	{
		title: 'Upcoming Activities',
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
	// {
	// 	title: 'Dating',
	// 	Icon: Heart,
	// 	path: mainRoutes.dating,
	// 	child: [],
	// },
]
