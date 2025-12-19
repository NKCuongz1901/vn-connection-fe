export interface UserProps {
	id: string
	share_link: string
	invite_code: string
	name: string
	name_updated_at: string
	mode: string
	looking_for: string
	who_i_am: string
	i_can_offer: string
	i_am_interested_in: string
	i_am_from: string
	category_list: string[]
	country_visited: string
	country_lived: string
	country_lived_array: string[]
	languages_can_speak: string
	languages_can_speak_array: string[]
	about_me: string
	cover: string
	avatar: string
	phone: string
	prefix_phone: string
	country_code: string
	email: string
	language: string
	language_for_translate: string
	visibility: string
	is_verified: boolean
	is_open_hangout: boolean
	time_open_hangout: any
	title_open_hangout: string
	status_of_tutorial: {
		_keyTutorialHome: boolean
		_keyIntroTalkRoom: boolean
		_keyTutorialDating: boolean
		_keyTutorialHangout: boolean
		_keyTutorialChatRoom: boolean
		_keyTutorialDatingCard: boolean
		_keyInstructionReferral: boolean
		_keyTutorialMiniChatRoom: boolean
	}
	mini_app_config: {
		app: string
		isShow: boolean
	}[]
	status: boolean
	address: string
	last_time_update_address: string
	position: {
		crs: {
			type: string
			properties: {
				name: string
			}
		}
		type: string
		coordinates: number[]
	}
	longitude: number
	latitude: number
	address_local: string
	position_local: {
		crs: {
			type: string
			properties: {
				name: string
			}
		}
		type: string
		coordinates: number[]
	}
	longitude_local: number
	latitude_local: number
	area_name: any
	is_accept_notification: boolean
	login_type: string
	gender: string
	birthday: string
	age: number
	is_hide_age: boolean
	version: string
	platform: string
	last_login_at: string
	online_time: string
	last_token: string
	last_token_web: string
	amount_of_friend: number
	wallet: number
	wallet_updated_at: string
	unblocked_at: any
	blocked_at: any
	blocked_reason: any
	blocked_type: any
	blocked_by: any
	blocked_by_user: any
	amount_of_appeal: number
	account_type: string
	network_favorites: string[]
	permissions: Record<string, any>
	dating_now_toggle: boolean
	complete_profile: {
		about_me: boolean
		email_verified: boolean
		profile_photo: boolean
		interests: boolean
		friend_about: boolean
		languages: boolean
		countries: boolean
		reference_1: boolean
		reference_2: boolean
		point: number
	}
	lmb_onboarding_process: string
	fmg_onboarding_process: string
	is_dev: boolean
	created_at: string
	updated_at: string
	deleted_at: any
	user_languages: {
		language_name: string
		proficiency_level: string
	}[]
}
