export const topicReportOpt = [
	{
		value: 'Lessons or feedback contain offensive or harmful material',
		label: 'Inappropriate content',
	},
	{
		value: 'Unwanted or annoying messages and ads',
		label: 'Spam',
	},
	{
		value: 'Bullying or mean behavior toward others',
		label: 'Harassment',
	},
	{
		value: 'Tricks or fake offers trying to cheat users',
		label: 'Scams',
	},
	{
		value: 'Sharing personal information without permission',
		label: 'Privacy Issues',
	},
]

export const repeatOpt = [
	{
		value: 'NONE',
		label: 'Never repeat',
	},
	{
		value: 'DAILY',
		label: 'Daily',
	},
	{
		value: 'WEEKLY',
		label: 'Weekly',
	},
	{
		value: 'BI_WEEK',
		label: 'Two weeks',
	},
	{
		value: 'THREE_WEEK',
		label: 'Three Weeks',
	},

	{
		value: 'MULTI_DAYS',
		label: 'Multiple days',
	},
	{
		value: 'MONTHLY',
		label: 'Monthly',
	},
]

export const ticketEntranceType = {
	ONLY: 'ONLY',
	FREE: 'FREE',
	MULTIPLE_TICKET: 'MULTIPLE_TICKET',
}

export const ticketEntranceTypeOpt = [
	{
		value: ticketEntranceType.ONLY,
		label: 'Only',
	},
	{
		value: ticketEntranceType.MULTIPLE_TICKET,
		label: 'Multiple price',
	},
]

export const stateNetworkOpts = [
	{
		value: 'Business',
		label: 'Business',
	},
	{
		value: 'Community',
		label: 'Community',
	},
	{
		value: 'Club',
		label: 'Club',
	},
	{
		value: 'Local Guide',
		label: 'Local Guide',
	},
	{
		value: 'Local Tours',
		label: 'Local Tours',
	},
	{
		value: 'Hiking Guide',
		label: 'Hiking Guide',
	},
	{
		value: 'Hiking Tours',
		label: 'Hiking Tours',
	},
]

export const categoryNetworkOpts = [
	{
		value: 'Language, Social Clubs, Workshops',
		label: 'Language, Social Clubs, Workshops',
	},
	{
		value: 'Hiking, Running, Cycling, and Biking Clubs',
		label: 'Hiking, Running, Cycling, and Biking Clubs',
	},
	{
		value: 'Sports, Hobbies, and Lifestyle Communities',
		label: 'Sports, Hobbies, and Lifestyle Communities',
	},
	{
		value: 'Local Guides, Tours, and Travel Agencies',
		label: 'Local Guides, Tours, and Travel Agencies',
	},
	{
		value: 'Beauty, Salon, Spa & Tattoo',
		label: 'Beauty, Salon, Spa & Tattoo',
	},
	{
		value: 'Homemade International & Veggie Cuisine',
		label: 'Homemade International & Veggie Cuisine',
	},
	{
		value: 'Local Handmade and Custom Products',
		label: 'Local Handmade and Custom Products',
	},
	{ value: 'Business (Other)', label: 'Business (Other)' },
	{ value: 'Charity and Giveaways', label: 'Charity and Giveaways' },
]

export const radiusOpts = [
	{
		value: 1,
		label: 'Under 1km',
	},
	{
		value: 2,
		label: 'Under 2km',
	},
	{
		value: 5,
		label: 'Under 5km',
	},
	{
		value: 10,
		label: 'Under 10km',
	},
	{
		value: 20,
		label: 'Under 20km',
	},
	{
		value: 50,
		label: 'Under 50km',
	},
	{
		value: 100,
		label: 'Under 100km',
	},
	{
		value: 500,
		label: 'Under 500km',
	},
	{
		value: '',
		label: 'Any',
	},
]

export const radiusAnyOpts = [
	...radiusOpts,
	{
		value: '',
		label: 'Any',
	},
]

export const mappingNotiTypes = {
	PUSH_BY_PERSONAL: 'PUSH_BY_PERSONAL',
	PUSH_BY_ADMIN: 'PUSH_BY_ADMIN',
	ALL: 'ALL',
}

export const NotiTypes = [
	{
		value: mappingNotiTypes.ALL,
		label: 'All',
	},
	{
		value: mappingNotiTypes.PUSH_BY_PERSONAL,
		label: 'Personal',
	},
	{
		value: mappingNotiTypes.PUSH_BY_ADMIN,
		label: 'System',
	},
]

export const NotiInteractingType = {
	ADD_FRIEND: 'ADD_FRIEND',
	PUSH_BY_ADMIN: 'PUSH_BY_ADMIN',
	NEAR_END_HANGOUT_STATUS: 'NEAR_END_HANGOUT_STATUS',
	NEW_POST_CREATED: 'NEW_POST_CREATED',
	NEW_EVENT_CREATE_NEAR_BY_USER: 'NEW_EVENT_CREATE_NEAR_BY_USER',
	CREATE_DISCUSS_IN_CLUB: 'CREATE_DISCUSS_IN_CLUB',
	INVITEE_MEMBER_JOIN_CLUB: 'INVITEE_MEMBER_JOIN_CLUB',
	JOIN_DISCUSSION_IN_CHATROOM: 'JOIN_DISCUSSION_IN_CHATROOM',
	COMMENT_ON_EVENT: 'COMMENT_ON_EVENT',
	JOIN_EVENT: 'JOIN_EVENT',
	COMMENT_ON_DISCUSS_IN_TOPIC: 'COMMENT_ON_DISCUSS_IN_TOPIC',
}
export const NotiExtraDataType = {
	DISCUSS_IN_TOPIC: 'DISCUSS_IN_TOPIC',
	EVENT: 'EVENT',
	DISCUSS_IN_CLUB: 'DISCUSS_IN_CLUB',
}

export enum NOTIFICATION_TYPE {
	// COMMON
	PUSH_BY_ADMIN = 'PUSH_BY_ADMIN',

	// POST
	COMMENT_ON_EVENT = 'COMMENT_ON_EVENT',
	COMMENT_ON_EVENT_WITH_MENTION = 'COMMENT_ON_EVENT_WITH_MENTION',
	LIKE_ON_EVENT = 'LIKE_ON_EVENT',
	JOIN_EVENT = 'JOIN_EVENT',
	NOTIFICATION_EVENT_NEAR_BY_USER = 'NOTIFICATION_EVENT_NEAR_BY_USER',
	NEW_EVENT_CREATE_NEAR_BY_USER = 'NEW_EVENT_CREATE_NEAR_BY_USER',
	NOTIFICATION_LAST_EVENT_FOR_HOST = 'NOTIFICATION_LAST_EVENT_FOR_HOST',
	REQUEST_DELETE_ONLY_THIS_EVENT = 'REQUEST_DELETE_ONLY_THIS_EVENT',
	REQUEST_DELETE_ALL_REPEAT_EVENT = 'REQUEST_DELETE_ALL_REPEAT_EVENT',
	UPGRADE_TO_ADMIN_ONLY_THIS_EVENT = 'UPGRADE_TO_ADMIN_ONLY_THIS_EVENT',
	UPGRADE_TO_ADMIN_ALL_REPEAT_EVENT = 'UPGRADE_TO_ADMIN_ALL_REPEAT_EVENT',
	EVENT_CANCELED_BY_HOST = 'EVENT_CANCELED_BY_HOST',

	COMMENT_ON_DISCUSS_IN_TOPIC_WITH_MENTION = 'COMMENT_ON_DISCUSS_IN_TOPIC_WITH_MENTION',
	COMMENT_ON_DISCUSS_IN_CLUB = 'COMMENT_ON_DISCUSS_IN_CLUB',
	COMMENT_ON_DISCUSS_IN_CHATROOM = 'COMMENT_ON_DISCUSS_IN_CHATROOM',
	JOIN_DISCUSSION_IN_CHATROOM = 'JOIN_DISCUSSION_IN_CHATROOM',

	JOIN_HANGOUT = 'JOIN_HANGOUT',
	REQUEST_JOIN_HANGOUT = 'REQUEST_JOIN_HANGOUT',
	ACCEPT_PARTICIPANT = 'ACCEPT_PARTICIPANT',

	LIKE_ON_COMMENT = 'LIKE_ON_COMMENT',
	// DISCUSS IN TOPIC
	NEW_POST_CREATED = 'NEW_POST_CREATED',
	COMMENT_ON_DISCUSS_IN_TOPIC = 'COMMENT_ON_DISCUSS_IN_TOPIC',
	LIKE_ON_DISCUSS_IN_TOPIC = 'LIKE_ON_DISCUSS_IN_TOPIC',

	// CLUB
	ACCEPT_MEMBER_JOIN_CLUB = 'ACCEPT_MEMBER_JOIN_CLUB',
	REQUEST_MEMBER_JOIN_CLUB = 'REQUEST_MEMBER_JOIN_CLUB',
	INVITEE_MEMBER_JOIN_CLUB = 'INVITEE_MEMBER_JOIN_CLUB',
	CREATE_ANNOUNCEMENT = 'CREATE_ANNOUNCEMENT',
	CREATE_DISCUSS_IN_CLUB = 'CREATE_DISCUSS_IN_CLUB',
	LIKE_ON_DISCUSS_IN_CLUB = 'LIKE_ON_DISCUSS_IN_CLUB',
	CHAT = 'CHAT',

	// FRIEND
	ADD_FRIEND = 'ADD_FRIEND',
	ACCEPT_FRIEND = 'ACCEPT_FRIEND',

	// HANGOUT
	NEAR_END_HANGOUT_STATUS = 'NEAR_END_HANGOUT_STATUS',
	COMMENT_ON_HANGOUT = 'COMMENT_ON_HANGOUT',

	// DATING
	LOVE_DATING = 'LOVE_DATING',
	CRUSH_DATING = 'CRUSH_DATING',
	MATCH_DATING = 'MATCH_DATING',
	CHAT_DATING = 'CHAT_DATING',

	MINI_CHAT = 'MINI_CHAT',

	//CHAT_ROOM
	CHAT_ROOM = 'CHAT_ROOM',

	// MINI APPS
	NEW_ITEM_LISTED = 'NEW_ITEM_LISTED',
	NEW_BOOK_LISTED = 'NEW_BOOK_LISTED',
	TUTOR_LEARNER_SOFT_RE_ENGAGEMENT = 'TUTOR_LEARNER_SOFT_RE_ENGAGEMENT',
	TUTOR_PROFILE_INCOMPLETE_REMINDER = 'TUTOR_PROFILE_INCOMPLETE_REMINDER',
}

export const languages = [
	{ value: 'Italian', label: 'Italian' },
	{ value: 'Korean', label: 'Korean' },
	{ value: 'Japanese', label: 'Japanese' },
	{ value: 'Russian', label: 'Russian' },
	{ value: 'Portuguese', label: 'Portuguese' },
	{ value: 'Spanish', label: 'Spanish' },
	{ value: 'Thai', label: 'Thai' },
	{ value: 'Vietnamese', label: 'Vietnamese' },
	{ value: 'Chinese', label: 'Chinese' },
	{ value: 'English', label: 'English' },
	{ value: 'Arabic', label: 'Arabic' },
	{ value: 'French', label: 'French' },
	{ value: 'German', label: 'German' },
]
export const typeCommunity = [
	{ value: 'Business', label: 'Business' },
	{ value: 'Community', label: 'Community' },
	{ value: 'Club', label: 'Club' },
	{ value: 'Work Shop', label: 'Work Shop' },
	{ value: 'Charity', label: 'Charity' },
	{ value: 'Class', label: 'Class' },
	{ value: 'Restaurant', label: 'Restaurant' },
]

export const typeEvent = [
	{ value: 'Education', label: 'Education' },
	{ value: 'Language Exchange', label: 'Language Exchange' },
	{ value: 'Workshop', label: 'Workshop' },
	{ value: 'Social', label: 'Social' },
	{ value: 'Lifestyle', label: 'Lifestyle' },
	{ value: 'Music', label: 'Music' },
	{ value: 'Dating', label: 'Dating' },
	{ value: 'Travel', label: 'Travel' },
	{ value: 'Sport', label: 'Sport' },
	{ value: 'Business', label: 'Business' },
	{ value: 'Tech', label: 'Tech' },
	{ value: 'Digital Nomad', label: 'Digital Nomad' },
	{ value: 'Art', label: 'Art' },
	{ value: 'Dancing', label: 'Dancing' },
	{ value: 'Game', label: 'Game' },
]
