import dayjs from 'dayjs'
import { useCallback, useEffect, useState } from 'react'

import { useLoading } from '@/context/LoadingContext'
import { useModal } from '@/context/ModalContext'

import { handleUploadImage } from '@/apis/uploadApis'
import { updateUserProfile } from '@/apis/userApis'

import { isArray } from '@/ultis/array'
import { cloneDeep, toJson } from '@/ultis/common'
import { handleParseFileImg } from '@/ultis/file'

import { genderOpts, languageOpts, modOpts } from '@/Variable/common.variable'

const handleParseToData = (data, categoryNetworkOpts) => {
	const {
		avatar,
		cover,
		about_me,
		name,
		address,
		birthday,
		gender,
		mode,
		i_am_interested_in,
		languages_can_speak_array,
		country_visited,
		who_i_am,
		looking_for,
		i_can_offer,
		longitude,
		latitude,
		user_languages,
		i_am_from,
		category_list,
		country_lived,
		is_hide_age,
	} = cloneDeep(data)
	const mappingCategoryNetworkOpts = (categoryNetworkOpts || []).reduce(
		(obj, item) => {
			obj[item.id] = item
			return obj
		},
		{},
	)
	const returnData = {
		avatar,
		cover,
		about_me,
		name,
		address,
		birthday: birthday ? dayjs(birthday) : null,
		gender: genderOpts.find((i) => i.value === gender),
		mode: modOpts.find((i) => i.value === mode),
		i_am_interested_in,
		languages_can_speak_array: languages_can_speak_array,
		country_visited: country_visited ? (country_visited || '').split(', ') : [],
		who_i_am,
		looking_for,
		i_can_offer,
		longitude,
		latitude,
		user_languages: user_languages || [],
		i_am_from,
		category_list: (category_list || []).map(
			(i) => mappingCategoryNetworkOpts[i],
		),
		country_lived:
			country_lived?.length > 1 ? (country_lived || '').split(', ') : [],
		is_hide_age: !!is_hide_age,
	}
	return returnData
}
interface ModalEditProfileProps {
	open: boolean
	onClose: any
	data?: any
	onGetUserProfile?: any
	[key: string]: any
}

export default function useEditProfile(props: ModalEditProfileProps) {
	const { onClose, data, categoryNetworkOpts, onGetUserProfile } = props
	const { toggleLoadingContext } = useLoading()
	const { openConfirm, openError, openSuccess } = useModal()
	const [dataModal, setDataModal] = useState(
		handleParseToData(data, categoryNetworkOpts),
	)
	const [files, setFiles] = useState({
		cover: null,
		avatar: null,
	})

	const [errors, setErrors] = useState({
		about_me: '',
		category_list: '',
		languages_can_speak_array: '',
		country_visited: '',
		country_lived: '',
		name: '',
		birthday: '',
		gender: '',
		address: '',
		mode: '',
		who_i_am: '',
		looking_for: '',
		i_can_offer: '',
		category: '',
		i_am_from: '',
	})
	const [userLanguageOpts, setUserLanguageOpts] = useState(
		cloneDeep(languageOpts),
	)
	const handleChangeData = useCallback(
		(key, _value) => {
			let value = _value
			let otherState = {}
			switch (key) {
				case 'birthday':
					value = _value?.date
					break
				case 'address':
					const {} = _value || {}
					const { lng, lat, display_name } = _value || {}
					value = display_name
					otherState = {
						longitude: lng,
						latitude: lat,
					}
					break
				case 'user_languages':
					{
						const { index, value: valueData, id } = _value || {}
						const { user_languages } = cloneDeep(dataModal) || {}
						user_languages[index][id] = valueData
						value = user_languages
					}
					break
				case 'user_languages_add':
					{
						let { user_languages } = cloneDeep(dataModal) || {}
						if (isArray(user_languages, 1)) {
							user_languages.push({
								language_name: '',
								proficiency_level: 'BEGINNER',
							})
						} else {
							user_languages = [
								{
									language_name: '',
									proficiency_level: 'BEGINNER',
								},
							]
						}
						key = 'user_languages'
						value = user_languages
					}
					break

				case 'user_languages_remove':
					{
						let { user_languages } = cloneDeep(dataModal) || {}
						user_languages = (user_languages || []).filter(
							(_, index) => index !== _value,
						)
						key = 'user_languages'
						value = user_languages
					}
					break
				default:
					break
			}
			if (key) {
				setErrors((prev) => ({ ...prev, [key]: '' }))
				setDataModal((prev) => ({ ...prev, [key]: value, ...otherState }))
			}
		},
		[dataModal],
	)

	const handleValidate = useCallback((data) => {
		const { languages_can_speak_array } = data || {}
		const _errors: any = Object.fromEntries(
			Object.entries({
				// about_me: 'Please briefly describe yourself',
				name: 'Please enter your name',
				// birthday: 'Please select a valid date of member since',
				gender: 'Please choose your gender',
				address: 'Please enter a full address',
				// mode: 'Please choose your state',
				// who_i_am: 'Please enter your role',
				// looking_for: 'Please specify what you are looking for',
				// i_can_offer: 'Please specify what you can offer',
				i_am_from: 'This field can not empty',
				category_list: 'Please provide your areas of interest',
				// country_visited: 'Please enter the countries visited',
				// country_lived: 'Please enter the countries lived',
			}).filter(([key]) => {
				switch (key) {
					case 'country_visited':
					case 'country_lived':
					case 'category_list':
						return !isArray(data?.[key], 1)
					default:
						return !data?.[key]
				}
			}),
		)

		if (!isArray(languages_can_speak_array, 1)) {
			_errors.languages_can_speak_array =
				'Please select the languages you can speak'
		}
		if (isArray(Object.entries(_errors), 1)) {
			setErrors(_errors)
			return false
		}
		return true
	}, [])

	const handleCheckImage = useCallback((key, file) => {
		const { imageUrl } = handleParseFileImg(file)
		setFiles((prev) => ({ ...prev, [key]: file }))
		handleChangeData(key, imageUrl)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])
	const handleUpdateProfile = useCallback(
		async (_payload) => {
			try {
				toggleLoadingContext(true)
				const [cover, avatar] = await Promise.all([
					handleUploadImage(files.cover),
					handleUploadImage(files.avatar),
				])
				const payload = {
					..._payload,
					cover: cover || _payload?.cover,
					avatar: avatar || _payload?.avatar,
				}
				const res = (await updateUserProfile(payload)) as any
				if (res?.code === 200) {
					openSuccess({
						message: 'Update your profile successfull',
						onAccept: () => {
							onGetUserProfile?.({})
							onClose()
						},
					})
				}
			} catch (error) {
				openError(error)
			} finally {
				toggleLoadingContext()
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[files],
	)

	const handleSubmit = useCallback(() => {
		if (!handleValidate(dataModal)) return
		const {
			avatar,
			cover,
			about_me,
			name,
			address,
			birthday,
			gender,
			mode,
			languages_can_speak_array,
			country_visited,
			country_lived,
			who_i_am,
			looking_for,
			i_can_offer,
			longitude,
			latitude,
			user_languages,
			category_list,
			is_hide_age,
			i_am_from,
		} = dataModal
		const payload = {
			id: data.id,
			avatar,
			cover,
			about_me,
			name,
			address,
			i_am_interested_in: (category_list || []).map((i) => i.title).join(', '),
			country_visited: (country_visited || []).join(', '),
			country_lived: (country_lived || []).join(', '),
			who_i_am,
			looking_for,
			i_can_offer,
			gender: gender?.value || gender || null,
			mode: mode?.value || mode || null,
			languages_can_speak_array: languages_can_speak_array,
			birthday: birthday ? dayjs(birthday).toISOString() : '',
			longitude,
			latitude,
			user_languages: (user_languages || []).filter(
				(i) => i.language_name && i.proficiency_level,
			),
			category_list: (category_list || []).map((i) => i.id),
			is_hide_age,
			i_am_from,
		}
		openConfirm({
			message: 'Do you want to update profile ?',
			onAccept: () => handleUpdateProfile(payload),
		})
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [toJson(dataModal)])

	useEffect(
		() => {
			const user_languages = (dataModal.user_languages || []).map(
				(i) => i.language_name,
			)
			setUserLanguageOpts(
				languageOpts.map((i) =>
					(user_languages || []).includes(i.value)
						? { ...i, disabled: true }
						: i,
				),
			)
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[JSON.stringify(dataModal.user_languages)],
	)
	useEffect(() => {
		const _data = handleParseToData(data, categoryNetworkOpts)
		setDataModal(_data)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [toJson(data)])

	return {
		dataModal: dataModal,
		errors: errors,
		userLanguageOpts,
		onChangeData: handleChangeData,
		onCheckImage: handleCheckImage,
		onSubmit: handleSubmit,
	}
}
