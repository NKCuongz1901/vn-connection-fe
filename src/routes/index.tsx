import Event from '@/svg/Event'
// import Heart from '@/svg/Heart'
import HappyIcon from '@/svg/HappyIcon'
import Message2Icon from '@/svg/Message2Icon'
import Message3 from '@/svg/Message3'
import Messenger from '@/svg/Messenger'
import OverviewIcon from '@/svg/OverviewIcon'
import People from '@/svg/People'
import ProfileIcon from '@/svg/ProfileIcon'
import SquareIcon from '@/svg/SquareIcon'
import TwoUser from '@/svg/TwoUser'

import { mainRoutes } from './MainRoutes'
import MiniApp from '@/svg/MiniApp'

export const AUTH_ROUTES = {
	loginPhone: '/auth/login_by_phone',
	checkPhoneExists: '/auth/check_phone_exists',
	sendOTP: '/auth/otp/send',
	verifyOTP: '/auth/otp/verify',
	checkOTP: 'auth/otp/check',
	forgetPassword: '/auth/forget_password',
	registerByPhone: '/auth/register_by_phone',
	sendToMail: 'auth/otp/send-to-mail',
	logout: '/auth/logout',
	requestFeature: '/inquiries',
}

export const SYSTEM = {
	systemSettings: '/system-settings',
}
export const USER_ROUTES = {
	profile: '/user/profile',
	user: '/user',
	block: '/user/block',
	report: '/feedback',
	appeal: '/user/appeal',
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
	publicEventDetail: 'post/public',
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
	readMessage: 'message/read_message',
	quickMessage: 'quick-chat',
}
export const FRIEND_ROUTES = {
	name: '/friend',
	myFriend: 'friend/my',
	myRequest: 'friend/my-request',
	mySent: 'friend/my-sent',
	myFriendOnline: 'friend/my-online',
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
	readAll: 'notifications/read-all',
	setting: 'user/notification_setting',
	getMyNotificationSetting: 'user/notification_setting/my',
}
export const SEARCH_ROUTES = {
	searchLocal: 'search-in-app/local',
	searchEvent: 'search-in-app/event',
	searchClub: 'search-in-app/club',
	searchCategoryUser: 'search-in-app/category-user',
	searchCategoryClub: 'search-in-app/category-club',
	searchCategoryClubMatching: 'search-in-app/club-matching-categories',
	searchCategoryUserMatching: 'search-in-app/user-matching-categories',
	searchUserNetwork: 'search/user',
	searchCommunityNetwork: 'search/club',
}

export const REFERRAL_ROUTES = {
	leaderBoard: 'user/leader-board',
	walletHistoryGroupByMonth: 'wallet-history/grouped-by-month',
	walletHistory: 'wallet-history',
}
export const MAP_ROUTES = {
	name: 'map/google/place/textsearch/json',
}
export const CONFIG_BOOTSTRAP = {
	configBootstrap: 'config/bootstrap',
}
export const Menus = [
	{
		title: 'Overview',
		Icon: OverviewIcon,
		path: mainRoutes.overview,
		child: [],
	},
	{
		title: 'My Activities',
		Icon: Event,
		path: mainRoutes.event,
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
		title: 'Discussion',
		Icon: Message3,
		path: mainRoutes.discussions,
		child: [],
	},
	{
		title: 'Explore by interest',
		Icon: HappyIcon,
		path: mainRoutes.exploreInterest,
		child: [],
	},
	// {
	// 	title: 'Search',
	// 	Icon: SearchNormal,
	// 	path: mainRoutes.search,
	// 	child: [],
	// },
	{
		title: 'My profile',
		Icon: ProfileIcon,
		path: mainRoutes.profile,
		child: [],
		hasTopDivider: true,
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
		title: 'Mini apps',
		Icon: MiniApp,
		path: mainRoutes.miniApps,
		child: [],
		hasTopDivider: true,
	},
	// {
	// 	title: 'Dating',
	// 	Icon: Heart,
	// 	path: mainRoutes.dating,
	// 	child: [],
	// },
]
