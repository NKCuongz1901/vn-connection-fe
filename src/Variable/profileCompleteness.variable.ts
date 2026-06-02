export const PROFILE_COMPLETENESS_ITEMS = [
	{ key: 'about_me', label: 'About Me', weight: 10 },
	{ key: 'email_verified', label: 'Confirm your Email Address', weight: 10 },
	{ key: 'profile_photo', label: 'Upload profile and cover photo', weight: 10 },
	{ key: 'interests', label: 'Add your interests', weight: 10 },
	{ key: 'friend_about', label: 'Add a friend', weight: 10 },
	{ key: 'languages', label: 'Add languages you can speak', weight: 10 },
	{ key: 'countries', label: 'Add countries you have visited', weight: 10 },
	{ key: 'reference_1', label: 'Get a Reference', weight: 10 },
	{ key: 'reference_2', label: 'Get a 2nd Reference', weight: 20 },
] as const

export type ProfileCompletenessKey =
	(typeof PROFILE_COMPLETENESS_ITEMS)[number]['key']
