import { useCallback, useEffect, useState } from 'react'

import { useLoading } from '@/context/LoadingContext'
import { useModal } from '@/context/ModalContext'

import {
	createConversation,
	getCategoryList,
	getNetworkGroup,
} from '@/apis/conversationApis'
import { handleUploadImage } from '@/apis/uploadApis'

import { isArray } from '@/ultis/array.ults'
import { handleParseFileImg } from '@/ultis/file.utls'
import { useLocalePath } from '@/ultis/route.ults'

import { mainRoutes } from '@/routes/MainRoutes'

import { selectType } from '@/interface/common/common.interface'
import { CategoriFavOptProps } from '@/interface/Network/Network.interface'

interface CRUDNetworkProps {
	data?: any
	onSuccess?: (data: any) => void
	onClose: () => void
}

interface DataModalProps {
	thumbnail?: string
	avatar?: string
	title?: string
	bio?: string
	type?: string
	category?: CategoriFavOptProps[]
	about?: string
	longitude: number
	latitude: number
	address?: string
	is_online: boolean
	is_offline: boolean
	// [key: string]: any
}
interface ErrorsModalProps {
	thumbnail?: string
	avatar?: string
	title?: string
	bio?: string
	type?: any
	category?: string
	about?: string
	address?: string

	// [key: string]: any
}
export default function useCRUDNetwork({
	data,
	onSuccess,
	onClose,
}: CRUDNetworkProps) {
	const { id } = data || {}
	const { onChangeRoute } = useLocalePath()
	const { toggleLoadingContext } = useLoading()
	const { openConfirm, openError, openSuccess } = useModal()
	const [dataModal, setDataModal] = useState<DataModalProps>({
		longitude: 0,
		latitude: 0,
		is_online: true,
		is_offline: false,
	})
	const [errors, setErrors] = useState<ErrorsModalProps>({})
	const [files, setFiles] = useState({
		thumbnail: null,
		avatar: null,
	})
	const [categoryNetworkOpts, setCategoryNetworkOpts] = useState<
		CategoriFavOptProps[]
	>([])
	const [stateNetworkOpts, setStateNetworkOpts] = useState<selectType[]>([])
	const [loadingOpt, setLoadingOpt] = useState(false)
	const handleGetSelectOpt = async () => {
		setLoadingOpt(true)
		try {
			const [category, network]: any = await Promise.all([
				getCategoryList({}),
				getNetworkGroup({}),
			])

			const networkOpt = (network?.results?.object || []).map(
				({ name }: { name: string }) => ({
					value: name,
					label: name,
				}),
			)

			setCategoryNetworkOpts(category?.results?.objects?.rows || [])

			setStateNetworkOpts(networkOpt)
		} catch (error) {
			openError(error)
		} finally {
			setLoadingOpt(false)
		}
	}

	const handleChangeData = useCallback((key, _value) => {
		let value = _value
		let otherState = {}
		switch (key) {
			case 'address':
				{
					const { display_name, lat, lng } = _value || {}
					value = display_name
					otherState = {
						latitude: lat,
						longitude: lng,
					}
				}
				break
			case 'is_online':
				if (!_value) {
					otherState = {
						is_offline: true,
					}
				}
				break
			case 'is_offline':
				if (!_value) {
					otherState = {
						is_online: true,
					}
				}
				break
			default:
				break
		}
		setErrors((prev) => ({ ...prev, [key]: '' }))
		setDataModal((prev) => ({ ...prev, [key]: value, ...otherState }))
	}, [])
	const handleCheckImage = useCallback((key, file) => {
		const { imageUrl } = handleParseFileImg(file)
		setFiles((prev) => ({ ...prev, [key]: file }))
		handleChangeData(key, imageUrl)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])
	const handleValidate = () => {
		const { title, bio, type, category, address, about, is_offline } =
			dataModal || {}
		const fields = {
			title,
			bio,
			type,
			category,
			address,
			about,
		}
		const _error = {} as any
		Object.entries(fields).forEach(([key, value]) => {
			switch (key) {
				case 'category':
					if (!isArray(category, 1)) {
						_error[key] = 'Field is required'
					}
					break
				case 'address':
					if (is_offline) {
						if (!value) {
							_error[key] = 'Field is required'
						}
					}
					break
				default:
					if (!value) {
						_error[key] = 'Field is required'
					}
					break
			}
		})
		setErrors(_error)
		if (isArray(Object.entries(_error), 1)) {
			return false
		} else {
			return true
		}
	}

	const handleCreateNetwork = async () => {
		toggleLoadingContext(true)
		try {
			const {
				bio,
				type,
				category,
				title,
				about,
				longitude,
				latitude,
				is_online,
				is_offline,
			} = dataModal || {}
			const [thumbnail, avatar] = await Promise.all([
				handleUploadImage(files.thumbnail),
				handleUploadImage(files.avatar),
			])

			const payload = {
				title,
				type,
				category: category.join(', '),
				category_list: category.map((i) => i.id),
				is_online,
				is_offline,
				bio,
				about,
				latitude,
				longitude,
				thumbnail,
				avatar,
			}
			const res: any = id
				? await createConversation({ id, payload })
				: await createConversation(payload)
			const { code, results } = res || {}
			if (code === 200) {
				openSuccess({
					message: id
						? 'Edit network successfully'
						: 'Create network successfully',
					onAccept: () => {
						if (onSuccess) {
							onSuccess?.(results?.object)
						} else {
							onChangeRoute(`${mainRoutes.network}/${results?.object?.id}`)
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
	const handleSubmit = async () => {
		if (!handleValidate()) {
			return
		}
		openConfirm({
			message: id
				? 'Do you want edit this network ?'
				: 'Do you want create network ?',
			onAccept: handleCreateNetwork,
		})
	}

	useEffect(() => {
		handleGetSelectOpt()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return {
		loadingOpt,
		categoryNetworkOpts,
		stateNetworkOpts,
		dataModal,
		errors,
		onChangeData: handleChangeData,
		onSubmit: handleSubmit,
		onCheckImage: handleCheckImage,
	}
}
