import GlobalIcon from '@/svg/GlobalIcon'
import PolicyIcon from '@/svg/PolicyIcon'
import SecurityIcon from '@/svg/SecurityIcon'
import SettingIcon from '@/svg/SettingIcon'
import UserSearchIcon from '@/svg/UserSearchIcon'
import StarIcon2 from '@/svg/StarIcon2'
import { IconMailFilled } from '@tabler/icons-react'

export const ACCOUNT_SETTING_MENUS = [
	{
		key: 'about',
		label: 'About',
		path: 'profile/account-setting/about',
		Icon: GlobalIcon,
	},
	// {
	// 	key: 'policy',
	// 	label: 'Policy',
	// 	path: 'profile/account-setting/policy',
	// 	Icon: PolicyIcon,
	// },
	{
		key: 'safety',
		label: 'Safety',
		path: 'profile/account-setting/safety',
		Icon: SecurityIcon,
	},
	{
		key: 'manage-account',
		label: 'Manage Account',
		path: 'profile/account-setting/manage-account',
		Icon: SettingIcon,
	},
	// {
	// 	key: 'Search Members/Networks',
	// 	label: 'Members/Networks',
	// 	path: 'profile/account-setting/members-network',
	// 	Icon: UserSearchIcon,
	// },
	{
		key: 'feedback-support',
		label: 'Feedback & Support',
		path: 'profile/account-setting/feedback-support',
		Icon: IconMailFilled,
	},
	{
		key: 'request-feature',
		label: 'Request a feature',
		path: 'profile/account-setting/request-feature',
		Icon: StarIcon2,
	},
] as const
