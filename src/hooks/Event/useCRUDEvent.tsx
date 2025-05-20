import dayjs from 'dayjs'
import { useMemo, useState } from 'react'

import { useLoading } from '@/context/LoadingContext'
import { useModal } from '@/context/ModalContext'

import { createPost, editPost } from '@/apis/postApis'
import { uploadProgress } from '@/apis/uploadApis'

import { isArray } from '@/ultis/array.ults'
import { cloneDeep } from '@/ultis/common.ults'
import { handleParseFileImg } from '@/ultis/file.utls'
import { useLocalePath } from '@/ultis/route.ults'
import { convertStringToNumber, formatNumberString } from '@/ultis/string.ults'

import { mainRoutes } from '@/routes/MainRoutes'
import {
	repeatOpt,
	ticketEntranceType,
	ticketEntranceTypeOpt,
} from '@/Variable/select.variable'

const handleParseData = (data: any) => {
	const {
		title,
		description,
		address,
		start_time,
		end_time,
		latitude,
		longitude,
		thumbnails,
		ticket_entrance_type,
		limit_participant,
		ticket_entrance,
		menu_price,
		repeat_type,
		id,
	} = data || {}
	const [minEntr, maxEntr] = (ticket_entrance || '').split(':')
	const [minPrice, maxPrice] = (menu_price || '').split(':')
	const { type, days, amount_of_repeat } = id ? repeat_type || {} : {}
	return {
		title,
		description,
		address,
		start_time: id && start_time ? dayjs(Number(start_time)) : null,
		end_time: id && end_time ? dayjs(Number(end_time)) : null,
		latitude,
		longitude,
		thumbnails,
		ticket_entrance_type:
			ticket_entrance_type || ticketEntranceTypeOpt[0].value,
		limit_participant,
		ticket_entrance: {
			min: formatNumberString(minEntr),
			max: formatNumberString(maxEntr),
		},
		menu_price: {
			min: formatNumberString(minPrice),
			max: formatNumberString(maxPrice),
		},
		repeat_type: {
			type: type || repeatOpt[0].value,
			days: days || [],
			amount_of_repeat: amount_of_repeat || 1,
		},
		// edit_type: null,
	}
}

interface CRUDEventProps {
	data?: any
	edit_type?: string
	onClose: any
	onSuccess?: any
}

export default function useCRUDEvent({
	data,
	edit_type,
	onSuccess,
	onClose,
}: CRUDEventProps) {
	const { openConfirm, openError, openSuccess } = useModal()
	const { toggleLoadingContext } = useLoading()
	const { onChangeRoute } = useLocalePath()
	const [event, setEvent] = useState(handleParseData(data))
	const [fileImg, setFileImg] = useState(null)
	const [error, setError] = useState({
		thumbnails: '',
		title: '',
		minEntr: '',
		maxEntr: '',
		minPrice: '',
		maxPrice: '',
		address: '',
		start_time: '',
		end_time: '',
		limit_participant: '',
		days: '',
		description: '',
	})
	const [toggle, setToggle] = useState({
		ticketSw: [
			ticketEntranceType.MULTIPLE_TICKET,
			ticketEntranceType.ONLY,
		].includes(data?.ticket_entrance_type),
		pricingSw: !!data?.menu_price,
	})
	const id = useMemo(() => data?.id, [data])
	const handleToggle = ({ key, value }) => {
		const { ticket_entrance_type } = event

		switch (key) {
			case 'ticketSw':
				if (!ticket_entrance_type || ticket_entrance_type === 'FREE') {
					setEvent((prev) => ({
						...prev,
						ticket_entrance_type: ticketEntranceTypeOpt[0].value,
					}))
				}
				break
			default:
				break
		}
		setToggle((prev) => ({ ...prev, [key]: value }))
	}

	const handleChangeValue = (_key: string) => (_value: any) => {
		const { repeat_type, ticket_entrance, menu_price } = cloneDeep(event)
		try {
			let value = _value
			let key = _key
			setError((prev) => ({ ...prev, [key]: '' }))
			switch (_key) {
				case 'thumbnails':
					{
						const { imageUrl, file } = handleParseFileImg(_value?.file)
						value = imageUrl ? [imageUrl] : null
						setFileImg(file || null)
					}
					break
				case 'removeThumbnails':
					{
						key = 'thumbnails'
						value = null
					}
					break
				case 'title':
				case 'description':
					value = _value.target.value
					break
				case 'minEntr':
				case 'maxEntr':
					value = {
						...ticket_entrance,
						...(_key.startsWith('min')
							? { min: formatNumberString(_value.target.value) }
							: { max: formatNumberString(_value.target.value) }),
					}
					key = 'ticket_entrance'
					break
				case 'minPrice':
				case 'maxPrice':
					value = {
						...menu_price,
						...(_key.startsWith('min')
							? { min: formatNumberString(_value.target.value) }
							: { max: formatNumberString(_value.target.value) }),
					}
					key = 'menu_price'
					break
				case 'address':
					const { lng, lat, display_name } = _value || {}
					setEvent((prev) => ({
						...prev,
						longitude: lng,
						latitude: lat,
						address: display_name,
					}))
					return
				case 'type':
				case 'amount_of_repeat':
				case 'days':
					value = { ...repeat_type, [key]: _value }
					key = 'repeat_type'
					break
				case 'limit_participant':
					value = formatNumberString(_value.target.value)
					break
				case 'start_time':
				case 'end_time':
					if (dayjs(_value).isBefore(dayjs())) {
						value = null
					}
					break
				default:
					break
			}
			setEvent((prev) => ({ ...prev, [key]: value }))
		} catch (error) {
			console.log('error:', error)
		}
	}
	const handleValidate = () => {
		const {
			title,
			description,
			address,
			start_time,
			end_time,
			thumbnails,
			ticket_entrance_type,
			limit_participant,
			repeat_type,
			ticket_entrance,
			menu_price,
		} = event
		const { ticketSw, pricingSw } = toggle
		const { type, days } = repeat_type
		const fields = {
			title,
			description,
			address,
			start_time,
			end_time,
			thumbnails,
			limit_participant,
		}
		const _error = {} as any
		Object.entries(fields).forEach(([key, value]) => {
			if (!value) {
				_error[key] = 'Field is required'
			}
		})
		if (type === 'MULTI_DAYS' && !isArray(days, 1)) {
			_error.days = 'Field is required'
		}
		if (ticketSw) {
			const { min: minEntr, max: maxEntr } = ticket_entrance
			const fieldEntrs = { minEntr, maxEntr }
			if (ticket_entrance_type === ticketEntranceTypeOpt[0].value) {
				if (!minEntr) {
					_error.minEntr = 'Field is required'
				}
			} else {
				Object.entries(fieldEntrs).forEach(([key, value]) => {
					if (!value) {
						_error[key] = 'Field is required'
					}
				})
				if (minEntr && maxEntr) {
					if (convertStringToNumber(minEntr) > convertStringToNumber(maxEntr)) {
						_error.minEntr = 'Min price cannot be greater than max price'
					}
				}
			}
		}
		if (pricingSw) {
			const { min: minPrice, max: maxPrice } = menu_price
			const fieldPrice = { minPrice, maxPrice }
			Object.entries(fieldPrice).forEach(([key, value]) => {
				if (!value) {
					_error[key] = 'Field is required'
				}
			})
			if (minPrice && maxPrice) {
				if (convertStringToNumber(minPrice) > convertStringToNumber(maxPrice)) {
					_error.minPrice = 'Min price cannot be greater than max price'
				}
			}
		}
		if (start_time && end_time) {
			if (dayjs(start_time).valueOf() >= dayjs(end_time).valueOf()) {
				_error.end_time = 'The end time must be greater than the start time'
			}
		}
		if (
			['DAILY', 'MULTI_DAYS'].includes(type) &&
			!dayjs(start_time).isSame(dayjs(end_time), 'date')
		) {
			_error.end_time = 'End time must be the same day as start time'
		}
		setError(_error)
		if (isArray(Object.entries(_error), 1)) {
			return false
		} else {
			return true
		}
	}
	const handleUploadImage = async (file) => {
		if (!file) return ''
		let url = ''
		try {
			const formData = new FormData()

			formData.set('image', file)
			const res = (await uploadProgress(formData)) as any
			const { code, results } = res || {}
			if (code === 200) {
				url = results?.object?.url
				return url
			}
		} catch (error) {
			throw error
		}
	}

	const handleParsePayload = async () => {
		const {
			title,
			description,
			address,
			start_time,
			end_time,
			latitude,
			longitude,
			thumbnails,
			ticket_entrance_type,
			ticket_entrance,
			menu_price,
			limit_participant,
			repeat_type,
		} = event
		const { ticketSw, pricingSw } = toggle
		const { min: minEntr, max: maxEntr } = ticket_entrance
		const { min: minPrice, max: maxPrice } = menu_price
		const _thumbnails = fileImg
			? [await handleUploadImage(fileImg)]
			: thumbnails
		const _minEntr = String(convertStringToNumber(minEntr))
		const _maxEntr = String(convertStringToNumber(maxEntr))
		const _minPrice = String(convertStringToNumber(minPrice))
		const _maxPrice = String(convertStringToNumber(maxPrice))

		let _ticket_entrance = '0'
		let _menu_price = ''
		if (ticketSw) {
			switch (ticket_entrance_type) {
				case ticketEntranceTypeOpt[0].value:
					{
						_ticket_entrance = _minEntr
					}
					break
				case ticketEntranceTypeOpt[1].value:
					{
						_ticket_entrance = `${_minEntr}:${_maxEntr}`
					}
					break
				default:
					break
			}
		}
		if (pricingSw) {
			_menu_price = `${_minPrice}:${_maxPrice}`
		}
		return {
			title,
			description,
			address,
			image: null,
			start_time: dayjs(start_time).valueOf(),
			end_time: dayjs(end_time).valueOf(),
			latitude: latitude,
			longitude: longitude,
			thumbnails: _thumbnails || [],
			ticket_entrance_type: ticketSw ? ticket_entrance_type : 'FREE',
			limit_participant: Number(limit_participant),
			ticket_entrance: _ticket_entrance,
			menu_price: _menu_price,
			area_name: null,
			repeat_type,
			edit_type: edit_type || null,
		}
	}
	const handleCreatePost = async () => {
		toggleLoadingContext(true)
		try {
			const payload = await handleParsePayload()
			const res: any = id
				? await editPost({ id, payload })
				: await createPost(payload)
			const { code, results } = res || {}
			if (code === 200) {
				openSuccess({
					message: id ? 'Edit event successfully' : 'Create event successfully',
					onAccept: () => {
						if (onSuccess) {
							onSuccess?.(results?.object)
						} else {
							onChangeRoute(`${mainRoutes.event}/${results?.object?.id}`)
						}
						onClose()
					},
				})
			}
		} catch (error) {
			openError(error)
		} finally {
			toggleLoadingContext()
		}
	}
	const handleSubmit = () => {
		if (!handleValidate()) {
			return
		}
		openConfirm({
			message: id
				? 'Do you want edit this event ?'
				: 'Do you want create event ?',
			onAccept: handleCreatePost,
		})
	}
	return {
		event,
		error,
		toggle,
		onToggle: handleToggle,
		onChangeValue: handleChangeValue,
		onSubmit: handleSubmit,
	}
}
