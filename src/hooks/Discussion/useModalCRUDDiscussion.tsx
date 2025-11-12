import { debounce } from 'lodash'
import { useMemo, useState } from 'react'

import { useLoading } from '@/context/LoadingContext'
import { useModal } from '@/context/ModalContext'

import { createDiscussion, editDiscussion } from '@/apis/discussionApis'
import { handleUploadImage } from '@/apis/uploadApis'

import { isArray } from '@/ultis/array.ults'
import { cloneDeep } from '@/ultis/common.ults'
import { handleParseFileImg } from '@/ultis/file.utls'

interface useModalCRUDDiscussionProps {
	conversation_id?: string
	data?: any
	onClose: any
	onSuccess?: any
	topic?: any[]
}

export default function useModalCRUDDiscussion({
	conversation_id,
	data,
	onSuccess,
	onClose,
	topic,
}: useModalCRUDDiscussionProps) {
	const { openConfirm, openError, openSuccess, closeModal } = useModal()
	const { toggleLoadingContext } = useLoading()
	const label = conversation_id ? 'topic' : 'discussion'

	const categoryOption = useMemo(() => {
		return (topic || []).map((item) => ({ value: item.id, label: item.title }))
	}, [topic])

	const handleParseData = (data) => {
		if (data) {
			const { title, category, description, medias } = data || {}
			return {
				title: title || '',
				description: description || '',
				medias: medias || [],
				category_id: category?.id || categoryOption?.[0]?.value,
			}
		}
		return {
			category_id: categoryOption?.[0]?.value,
			title: '',
			medias: [],
			description: '',
		}
	}
	const [dataSubmit, setDataSubmit] = useState(handleParseData(data))
	const [error, setError] = useState({
		title: '',
	})
	const [fileList, setFileList] = useState([])

	const id = useMemo(() => data?.id, [data])

	const handleChangeValue = (_key: string) => (_value: any) => {
		try {
			let value = _value
			let key = _key
			setError((prev) => ({ ...prev, [key]: '' }))
			switch (_key) {
				case 'title':
				case 'description':
					value = _value.target.value
					break
				case 'removeImg':
					const { medias } = cloneDeep(dataSubmit || {})
					const _medias = (medias || []).filter(
						(item) => item?.url !== value?.url,
					)
					key = 'medias'
					value = _medias || []
					break
				default:
					break
			}
			setDataSubmit((prev) => ({ ...prev, [key]: value }))
		} catch (error) {
			console.log('error:', error)
		}
	}
	const handleValidate = () => {
		const { title } = dataSubmit || {}

		const _error = {} as any
		if (!(title || '').trim()) {
			_error.title = 'Field is required'
		}
		setError(_error)
		if (isArray(Object.entries(_error), 1)) {
			return false
		} else {
			return true
		}
	}

	const handleParsePayload = async () => {
		const {
			title,
			description,
			category_id,
			medias: _currentMedias,
		} = dataSubmit || {}
		const _medias = fileList
		let medias = []

		if (_medias?.length > 0) {
			const uploadPromises = _medias.map((media) =>
				handleUploadImage(media.file, { isAll: true }),
			)
			const resList = await Promise.all(uploadPromises)

			medias = (resList || []).map((i) => ({
				url: i,
				type: 'IMAGE',
				...i,
			}))
		}

		return {
			title,
			description,
			medias: [...(_currentMedias || []), ...(medias || [])],
			...(conversation_id ? { conversation_id } : { category_id }),
		}
	}
	const handleImportImg = debounce((_values) => {
		const values = []

		if (isArray(_values, 1)) {
			_values.forEach((i) => {
				const { imageUrl, file } = handleParseFileImg(i?.originFileObj) || {}
				if (imageUrl) {
					values.push({ imageUrl, file })
				}
			})
		}
		const maxItem = 5 - (dataSubmit?.medias?.length || 0)
		setFileList((prev) => {
			const combined = [...prev, ...values]
			if ((combined || []).length > maxItem) {
				openConfirm({
					message: 'You can only upload up to 5 medias',
					onAccept: () => closeModal(),
				})
			}
			return combined.slice(0, maxItem)
		})
	}, 200)
	const handleCreateDiscussion = async () => {
		toggleLoadingContext(true)
		try {
			const payload = await handleParsePayload()
			const res: any = id
				? await editDiscussion({ id, payload })
				: await createDiscussion(payload)
			const { code, results } = res || {}
			if (code === 200) {
				if (onSuccess) {
					onSuccess?.(results?.object)
				}
				openSuccess({
					message: id
						? `Edit ${label} successfull`
						: `Create ${label} successfully`,
					onAccept: () => {
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
				? 'Do you want edit this discussion ?'
				: 'Do you want create discussion ?',
			onAccept: handleCreateDiscussion,
		})
	}

	return {
		error,
		dataSubmit,
		categoryOption,
		fileList,
		setFileList,
		onChangeValue: handleChangeValue,
		onSubmit: handleSubmit,
		onImportImg: handleImportImg,
	}
}
