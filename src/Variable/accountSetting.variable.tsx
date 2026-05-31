import GlobalIcon from '@/svg/GlobalIcon'
import PolicyIcon from '@/svg/PolicyIcon'
import SecurityIcon from '@/svg/SecurityIcon'
import SettingIcon from '@/svg/SettingIcon'
import UserSearchIcon from '@/svg/UserSearchIcon'

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
	{
		key: 'Search Members/Networks',
		label: 'Members/Networks',
		path: 'profile/account-setting/members-network',
		Icon: UserSearchIcon,
	},
] as const
