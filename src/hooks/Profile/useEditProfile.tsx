import dayjs from 'dayjs'
import { useCallback, useEffect, useState } from 'react'

import { useLoading } from '@/context/LoadingContext'
import { useModal } from '@/context/ModalContext'

import { uploadProgress } from '@/apis/uploadApis'
import { updateUserProfile } from '@/apis/userApis'

import { isArray } from '@/ultis/array.ults'
import { cloneDeep, toJson } from '@/ultis/common.ults'
import { handleParseFileImg } from '@/ultis/file.utls'

import { genderOpts, modOpts } from '@/Variable/common.variable'

const handleParseToData = (data) => {
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
	} = cloneDeep(data)
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
		languages_can_speak: languages_can_speak_array,
		country_visited,
		who_i_am,
		looking_for,
		i_can_offer,
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
	const { onClose, data, onGetUserProfile } = props
	const { toggleLoadingContext } = useLoading()
	const { openConfirm, openError, openSuccess } = useModal()
	const [dataModal, setDataModal] = useState(handleParseToData(data))
	const [files, setFiles] = useState({
		cover: null,
		avatar: null,
	})
	const [errors, setErrors] = useState({
		about_me: '',
		i_am_interested_in: '',
		languages_can_speak: '',
		country_visited: '',
		name: '',
		birthday: '',
		gender: '',
		address: '',
		mode: '',
		who_i_am: '',
		looking_for: '',
		i_can_offer: '',
	})
	const handleChangeData = useCallback((key, _value) => {
		let value = _value
		switch (key) {
			case 'birthday':
				value = _value?.date
				break
			default:
				break
		}
		setErrors((prev) => ({ ...prev, [key]: '' }))
		setDataModal((prev) => ({ ...prev, [key]: value }))
	}, [])
	const handleValidate = useCallback((data) => {
		const { languages_can_speak } = data || {}
		const _errors: any = Object.fromEntries(
			Object.entries({
				about_me: 'Please briefly describe yourself',
				name: 'Please enter your name',
				birthday: 'Please select a valid date of member since',
				gender: 'Please choose your gender',
				address: 'Please enter a full address',
				mode: 'Please choose your state',
				who_i_am: 'Please enter your role',
				looking_for: 'Please specify what you are looking for',
				i_can_offer: 'Please specify what you can offer',
				i_am_interested_in: 'Please provide your areas of interest',
				country_visited: 'Please enter the countries visited',
			}).filter(([key]) => !data?.[key]),
		)

		if (!isArray(languages_can_speak, 1)) {
			_errors.languages_can_speak = 'Please select the languages you can speak'
		}
		if (isArray(Object.entries(_errors), 1)) {
			setErrors(_errors)
			return false
		}
		return true
	}, [])
	const handleUploadImage = useCallback(async (file) => {
		if (!file) return ''
		let url = ''
		try {
			const formData = new FormData()

			formData.set('image', file)
			const res = (await uploadProgress(formData)) as any
			const { code, results } = res || {}
			if (code === 200) {
				url = results?.object?.url
			}
		} catch (error) {
			console.log('error:', error)
		} finally {
			return url
		}
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
				console.log('error:', error)
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
			i_am_interested_in,
			languages_can_speak,
			country_visited,
			who_i_am,
			looking_for,
			i_can_offer,
		} = dataModal
		const payload = {
			id: data.id,
			avatar,
			cover,
			about_me,
			name,
			address,
			i_am_interested_in,
			country_visited,
			who_i_am,
			looking_for,
			i_can_offer,
			gender: gender?.value || null,
			mode: mode?.value || null,
			languages_can_speak: languages_can_speak.join(', '),
			birthday: dayjs(birthday).toISOString(),
		}
		openConfirm({
			message: 'Do you want to update profile ?',
			onAccept: () => handleUpdateProfile(payload),
		})
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [toJson(dataModal)])
	useEffect(() => {
		const _data = handleParseToData(data)
		setDataModal(_data)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [toJson(data)])
	return {
		dataModal: dataModal,
		errors: errors,
		onChangeData: handleChangeData,
		onCheckImage: handleCheckImage,
		onSubmit: handleSubmit,
	}
}
