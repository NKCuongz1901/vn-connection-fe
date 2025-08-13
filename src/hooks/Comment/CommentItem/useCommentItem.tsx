import { ItemType } from 'antd/es/menu/interface'
import { debounce } from 'lodash'
import { useEffect, useRef, useState } from 'react'

import { useLoading } from '@/context/LoadingContext'
import { useModal } from '@/context/ModalContext'

import {
	deleteCommentPost,
	editComment,
	getListCommentById,
	likeComment,
} from '@/apis/postApis'
import { handleUploadImage } from '@/apis/uploadApis'

import { isArray, uniqueArray } from '@/ultis/array.ults'
import { cloneDeep, delay, toJson } from '@/ultis/common.ults'
import { handleParseFileImg } from '@/ultis/file.utls'
import { getUserInfo } from '@/ultis/storage.ults'

import { PaginationType } from '@/interface/common/common.interface'
import { paginationCommon } from '@/Variable/common.variable'

interface useCommentItemProps {
	item: any
	onAction?: any
}

export default function useCommentItem({
	item,
	onAction = () => null,
}: useCommentItemProps) {
	const { post_id, id: parent_id, amount_of_replies } = item || {}
	const { toggleLoadingContext } = useLoading()
	const { openError, openConfirm, closeModal } = useModal()
	const _paginationRefs = useRef<PaginationType>(cloneDeep(paginationCommon))

	const _loadmore = useRef<boolean>(true)
	const [modal, setModal] = useState({ type: '', data: null }) as any

	const [commentList, setCommentList] = useState<any[]>([])
	const [deleteLoading, setDeleteLoading] = useState<string[]>([])

	const [dataSubmit, setDataSubmit] = useState(item)
	const [fileList, setFileList] = useState([])

	const [loading, setLoading] = useState({
		like: false,
		commentList: true,
	})

	const handleGetComment = async (isNotLoading = false) => {
		setLoading((prev) => ({ ...prev, commentList: true }))

		try {
			const { page, limit } = _paginationRefs.current
			let isNew = page === 1
			if (isNotLoading) {
				isNew = false
			} else {
				if (isNew) {
					setCommentList([])
				}
			}
			const res: any = await getListCommentById({
				fields: [
					'$all',
					{ user: ['name', 'avatar', 'id'] },
					{
						medias: [
							'thumbnail',
							'duration',
							'url',
							'width',
							'height',
							'ratio',
							'type',
						],
					},
				],
				where: {
					post_id,
					parent_id,
				},
				page,
				limit,
			})
			const { code, results } = res || {}
			await delay(1000)
			if (code === 200) {
				const { rows } = results?.objects || {}
				if (!isNotLoading) {
					_loadmore.current = isArray(rows, limit)
				}
				setCommentList((prev: any[]) => {
					const contents = isNew && !isNotLoading ? [] : prev
					const dataShow = uniqueArray([...contents, ...rows], 'id') as any[]
					return dataShow
				})
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoading((prev) => ({ ...prev, commentList: false }))
		}
	}

	const handleLoadMore = async () => {
		if (!_loadmore.current || loading.commentList) return
		const { limit } = _paginationRefs.current
		const currentPage = Math.trunc((commentList || []).length / limit)
		_paginationRefs.current.page = currentPage + 1
		await handleGetComment()
	}

	const handleLikeComment = async (id: string) => {
		if (loading.like) return
		try {
			setLoading((prev) => ({ ...prev, like: true }))
			const res: any = await likeComment({ id })
			if (res) {
				const { status } = res?.results?.object
				setCommentList((prev) =>
					prev.map((item) => {
						if (item.id === id) {
							return {
								...item,
								is_liked: status === 'like',
								amount_of_like:
									(item.amount_of_like || 0) + (status === 'like' ? 1 : -1),
							}
						}
						return item
					}),
				)
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoading((prev) => ({ ...prev, like: false }))
		}
	}

	const handleAction = ({ key, value }) => {
		switch (key) {
			case 'like':
				handleLikeComment(value)
				break
			case 'share':
				const { user, id } = value || {}
				const { id: user_id } = user || {}
				setModal({ type: 'share', data: { id, user_id, props: value } })
				break
			default:
				break
		}
	}
	const handleMenusClick = ({ key, value }) => {
		switch (key) {
			case 'report':
				setModal({ type: 'report', data: value })
				break
			case 'delete':
				handleDeleteComment(value)
				break
			default:
				break
		}
	}
	const handleDeleteComment = async (id: string) => {
		try {
			setDeleteLoading((prev) => [...prev, id])
			const res: any = await deleteCommentPost(id)
			const { code } = res || {}
			if (code === 200) {
				setCommentList((prev: any[]) => prev.filter((i) => i.id !== id))
				onAction({ key: 'deleteChildComment', value: parent_id })
			}
		} catch (error) {
			openError(error)
		} finally {
			setDeleteLoading((prev) => prev.filter((i) => i !== id))
		}
	}
	const handleGetMenus = (item: {
		id: string
		user_id: string
		parent_id: string
		post_id: string
	}) => {
		const { id, user_id } = item
		const isMe = user_id === getUserInfo()?.id

		const menus: ItemType[] = []
		if (isMe) {
			menus.push({
				key: 'delete',
				label: 'Delete',
				style: { color: '#F80024' },
				onClick: () => handleMenusClick({ key: 'delete', value: id }),
			})
		} else {
			menus.push({
				key: 'report',
				label: 'Report',
				onClick: () => handleMenusClick({ key: 'report', value: id }),
			})
		}

		return menus
	}
	const handleChangeDataSubmit = (key) => (value) => {
		let _key = key
		let _value = value
		switch (key) {
			case 'content':
				_value = value.target.value
				break
			case 'removeImg':
				const { medias } = cloneDeep(dataSubmit || {})
				const _medias = (medias || []).filter(
					(item) => item?.url !== value?.url,
				)
				_key = 'medias'
				_value = _medias || []
				break
			default:
				break
		}
		setDataSubmit((prev) => ({ ...prev, [_key]: _value }))
	}
	// const handleChangeComment = (e) => {
	// 	const content = e.target.value
	// 	setCommentContent(content)
	// }
	// const handleSendCommentPost = async () => {
	// 	if (!commentContent.trim() || loadingContext) {
	// 		return
	// 	}
	// 	try {
	// 		toggleLoadingContext(true)
	// 		const res: any = await sendCommentPost({
	// 			parent_id,
	// 			post_id,
	// 			content: commentContent,
	// 		})
	// 		const { code, results } = res || {}
	// 		if (code === 200) {
	// 			const { object } = results || {}
	// 			const { name, avatar, id, is_verified } = getUserInfo()
	// 			const data = {
	// 				...object,
	// 				user: {
	// 					name,
	// 					avatar,
	// 					id,
	// 					is_verified,
	// 				},
	// 			}
	// 			setCommentContent('')
	// 			setCommentList((prev: any[]) => [data, ...prev])
	// 		}
	// 	} catch (error) {
	// 		openError(error)
	// 	} finally {
	// 		toggleLoadingContext()
	// 	}
	// }
	// const handleKeyDown = (e) => {
	// 	if (e.key === 'Enter' && !e.shiftKey) {
	// 		e.preventDefault() // nếu cần chặn mặc định (như xuống dòng)
	// 		e.stopPropagation()
	// 		handleSendCommentPost()
	// 		// Thực hiện hành động tại đây
	// 	}
	// }
	// const handleChangeUrl = ({ key, value: _value }) => {
	// 	switch (key) {
	// 		case 'back':
	// 			onPushState({ ...(category_id && { category_id }) })
	// 			break
	// 		default:
	// 			break
	// 	}
	// }
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
	const handleParsePayload = async () => {
		const { content } = dataSubmit || {}
		let { medias: _currentMedias } = dataSubmit || {}
		const _medias = fileList
		let medias = []
		_currentMedias = (_currentMedias || []).map((item) => ({
			url: item?.url,
			type: 'IMAGE',
			fileName: null,
			width: item?.width,
			height: item?.height,
			ratio: item?.ratio,
			thumbnail: null,
			duration: 0,
		}))
		if (_medias?.length > 0) {
			const uploadPromises = _medias.map((media) =>
				handleUploadImage(media.file, { isAll: true }),
			)
			const resList = await Promise.all(uploadPromises)

			medias = (resList || []).map((i) => ({
				url: i,
				type: 'IMAGE',
				fileName: null,
				width: 692,
				height: 1500,
				ratio: 0.4613333333333333,
				thumbnail: null,
				duration: 0,
				...i,
			}))
		}

		return {
			content,
			medias: [...(_currentMedias || []), ...(medias || [])],
		}
	}
	const handleEditComment = async () => {
		toggleLoadingContext(true)
		try {
			const body = await handleParsePayload()
			const res: any = await editComment({ id: parent_id, payload: body })
			if (res) {
				const { object } = res?.results || {}
				onAction({ key: 'updateComment', value: object })
				setFileList([])
			}
		} catch (error) {
			openError(error)
		} finally {
			toggleLoadingContext()
		}
	}
	useEffect(() => {
		if (amount_of_replies) {
			handleGetComment()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])
	useEffect(() => {
		setDataSubmit(item)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [toJson(item)])
	return {
		// loading,
		// loadingShare,

		// shareList,
		commentList,
		deleteLoading,
		modal,
		dataSubmit,
		fileList,
		setFileList,
		setDataSubmit,
		setModal,
		// discussDetail,
		// totalComment,
		// commentContent,

		onGetMenus: handleGetMenus,

		onLoadMore: handleLoadMore,
		onAction: handleAction,
		onChangeDataSubmit: handleChangeDataSubmit,
		onImportImg: handleImportImg,
		onEditComment: handleEditComment,
	}
}
