import { ItemType } from 'antd/es/menu/interface'
import { debounce } from 'lodash'
import { useEffect, useRef, useState } from 'react'

import { useModal } from '@/context/ModalContext'

import {
	deleteCommentPost,
	editComment,
	getListCommentById,
	getPublicListCommentById,
	likeComment,
	sendCommentPost,
} from '@/apis/postApis'
import { handleUploadImage, handleUploadVideo } from '@/apis/uploadApis'

import { isArray, uniqueArray } from '@/ultis/array'
import { cloneDeep, delay } from '@/ultis/common'
import { handleParseFileImg, handleParseFileVideo } from '@/ultis/file'
import { getUserInfo } from '@/ultis/storage'

import { PaginationType } from '@/interface/common/common.interface'
import { paginationCommon } from '@/Variable/common.variable'

interface useCommentItemProps {
	item: any
	onAction?: any
	isPublic?: boolean
}

export default function useCCommentItem(props: useCommentItemProps) {
	const { item, onAction = () => null, isPublic } = props
	const { post_id, id: parent_id, amount_of_replies } = item || {}
	const { openError, openConfirm, closeModal } = useModal()
	const _paginationRefs = useRef<PaginationType>(cloneDeep(paginationCommon))
	const fetchComments = isPublic ? getPublicListCommentById : getListCommentById

	const _loadmore = useRef<boolean>(
		amount_of_replies > _paginationRefs.current.limit,
	)
	const [modal, setModal] = useState({ type: '', data: null }) as any

	const [commentList, setCommentList] = useState<any[]>([])
	const [deleteLoading, setDeleteLoading] = useState<{
		[key: string]: boolean
	}>({})
	const [editChild, setEditChild] = useState(null)

	const [dataSubmit, setDataSubmit] = useState(item)
	const [contentDataSubmit, setContentDataSubmit] = useState<{
		[key: string]: any
	}>({})
	const [loadingSubmit, setLoadingSubmit] = useState({
		like: false,
		edit: false,
		delete: false,
		reply: false,
		editChild: false,
	})
	const [isEdit, setIsEdit] = useState(false)
	const [isReply, setIsReply] = useState(false)
	const [fileList, setFileList] = useState([])
	const [hiddenReply, setHiddenReply] = useState(false)
	const [loading, setLoading] = useState({
		like: false,
		commentList: false,
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
			const res: any = await fetchComments({
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
	const handleLikeCommentItemParent = async (id: string) => {
		if (loadingSubmit.like) return
		try {
			setLoadingSubmit((prev) => ({ ...prev, like: true }))
			const res: any = await likeComment({ id })
			if (res) {
				const { status } = res?.results?.object
				setDataSubmit((prev) => ({
					...prev,
					is_liked: status === 'like',
					amount_of_like:
						(prev.amount_of_like || 0) + (status === 'like' ? 1 : -1),
				}))
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoadingSubmit((prev) => ({ ...prev, like: false }))
		}
	}
	const handleParsePayload = async (dataSubmit, fileList) => {
		const { content } = dataSubmit || {}
		let { medias: _currentMedias } = dataSubmit || {}
		const _medias = fileList
		let medias = []

		if (_medias?.length > 0) {
			const uploadPromises = _medias.map((media) =>
				media?.type === 'IMAGE'
					? handleUploadImage(media.file)
					: handleUploadVideo(media.file),
			)
			const resList = await Promise.all(uploadPromises)
			medias = (_medias || []).map((i, index) => ({
				url: resList[index],
				type: i?.type || 'IMAGE',
				fileName: null,
				width: 692,
				height: 1500,
				ratio: 0.4613333333333333,
				thumbnail: null,
				duration: 0,
			}))
		}
		_currentMedias = (_currentMedias || []).map((item) => ({
			url: item?.url,
			type: item?.type || 'IMAGE',
			fileName: null,
			width: item?.width,
			height: item?.height,
			ratio: item?.ratio,
			thumbnail: null,
			duration: 0,
		}))

		return {
			content,
			medias: [...(_currentMedias || []), ...(medias || [])],
		}
	}

	const handleEditCommentItemParent = async (id: string) => {
		if (loadingSubmit.edit) return
		try {
			setLoadingSubmit((prev) => ({ ...prev, edit: true }))
			const payload = await handleParsePayload(contentDataSubmit, fileList)
			Object.assign(payload, {})

			const res: any = await editComment({ id, payload })
			if (res) {
				const { object } = res?.results
				setDataSubmit((prev) => ({
					...prev,
					...object,
				}))
				handleClear()
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoadingSubmit((prev) => ({ ...prev, edit: false }))
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
			setDeleteLoading((prev) => ({ ...prev, [id]: true }))
			const res: any = await deleteCommentPost(id)
			const { code } = res || {}
			if (code === 200) {
				setCommentList((prev: any[]) => prev.filter((i) => i.id !== id))
				setDataSubmit((prev) => ({
					...prev,
					amount_of_replies: (prev.amount_of_replies || 0) - 1,
				}))
				onAction({ key: 'delete' })
			}
		} catch (error) {
			openError(error)
		} finally {
			setDeleteLoading((prev) => ({ ...prev, [id]: false }))
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
			menus.push(
				{
					key: 'edit',
					label: 'Edit',
					onClick: () =>
						handleActionCommentItem({
							key: 'edit',
							value: item,
						}),
				},
				{
					key: 'delete',
					label: 'Delete',
					style: { color: '#F80024' },
					onClick: () => handleMenusClick({ key: 'delete', value: id }),
				},
			)
		} else {
			menus.push({
				key: 'report',
				label: 'Report',
				onClick: () => handleMenusClick({ key: 'report', value: id }),
			})
		}

		return menus
	}
	const handleActionCommentItem = ({ key, value }) => {
		switch (key) {
			case 'like':
				handleLikeComment(value)
				break
			case 'delete':
				handleDeleteComment(value)
				break
			case 'deleteChildComment':
				setCommentList((prev) =>
					prev.map((item) => {
						if (item.id === value) {
							return {
								...item,
								amount_of_replies: (item.amount_of_replies || 0) - 1,
							}
						}
						return item
					}),
				)
				break
			case 'edit':
				handleClear()
				setEditChild(value?.id)
				setContentDataSubmit(value)
				break
			case 'reply':
				{
					const { user, user_id } = value || {}
					const { name } = user || {}
					const isMe = user_id === getUserInfo()?.id
					setIsReply(true)
					setContentDataSubmit({ content: isMe ? '' : `@${name}` })
				}
				break
			case 'submitEdit':
				handleEditComment(value)
				break
			case 'submitReply':
				handleSendCommentPost()
				break
			case 'cancelEdit':
				handleClear()
				break
			case 'updateComment':
				const { name, avatar, id, is_verified } = getUserInfo()
				setCommentList((prev) =>
					(prev || []).map((item) =>
						item.id === value?.id
							? {
									...value,
									user: {
										name,
										avatar,
										id,
										is_verified,
									},
								}
							: item,
					),
				)
				// setEditChild((prev) => prev.filter((i) => i !== value?.id))

				break
			default:
				break
		}
	}
	const handleDeleteCommentItemParent = async (id: string) => {
		try {
			setLoadingSubmit((prev) => ({ ...prev, delete: true }))
			const res: any = await deleteCommentPost(id)
			const { code } = res || {}
			if (code === 200) {
				onAction({ key: 'delete', value: id })
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoadingSubmit((prev) => ({ ...prev, false: true }))
		}
	}
	const handleCommentItemParentAction = ({ key, value }) => {
		switch (key) {
			case 'like':
				handleLikeCommentItemParent(value)
				break
			case 'delete':
				handleDeleteCommentItemParent(value)
				break
			case 'edit':
				setIsEdit(true)
				setContentDataSubmit(dataSubmit)
				setIsReply(false)
				break
			case 'cancelEdit':
				handleClear()

				break
			case 'submitEdit':
				handleEditCommentItemParent(value)
				break
			case 'report':
				setModal({ type: 'report', data: value })

				break
			default:
				break
		}
	}

	const handleGetMenusCommentItemParent = (item: {
		id: string
		user_id: string
	}) => {
		const { user_id } = item
		const isMe = user_id === getUserInfo()?.id

		const menus: ItemType[] = []
		if (isMe) {
			menus.push(
				{
					key: 'edit',
					label: 'Edit',
					onClick: () =>
						handleCommentItemParentAction({
							key: 'edit',
							value: item.id,
						}),
				},
				{
					key: 'delete',
					label: 'Delete',
					style: { color: '#F80024' },
					onClick: () =>
						handleCommentItemParentAction({
							key: 'delete',
							value: item.id,
						}),
				},
			)
		} else {
			menus.push({
				key: 'report',
				label: 'Report',
				onClick: () =>
					handleCommentItemParentAction({
						key: 'report',
						value: item.id,
					}),
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
				const { medias } = cloneDeep(contentDataSubmit) || {}
				const _medias = (medias || []).filter(
					(item) => item?.url !== value?.url,
				)
				_key = 'medias'
				_value = _medias || []
				break
			default:
				break
		}
		setContentDataSubmit((prev) => ({ ...prev, [_key]: _value }))
	}
	// const handleChangeComment = (e) => {
	// 	const content = e.target.value
	// 	setCommentContent(content)
	// }
	const handleClear = () => {
		setEditChild(null)
		setContentDataSubmit({})
		setIsEdit(false)
		setIsReply(false)
		setFileList([])
	}
	const handleSetLoadingSubmit = (id: string) => (val: boolean) => {
		setLoadingSubmit((prev) => ({ ...prev, [id]: val }))
	}
	const handleSendCommentPost = async () => {
		try {
			handleSetLoadingSubmit('reply')(true)
			const body = await handleParsePayload(contentDataSubmit, fileList)

			const res: any = await sendCommentPost({
				parent_id,
				post_id,
				...body,
			})
			const { code, results } = res || {}
			if (code === 200) {
				const { object } = results || {}
				const { name, avatar, id, is_verified } = getUserInfo()
				const data = {
					...object,
					user: {
						name,
						avatar,
						id,
						is_verified,
					},
				}
				setCommentList((prev: any[]) => [data, ...prev])
				setDataSubmit((prev) => ({
					...prev,
					amount_of_replies: (prev.amount_of_replies || 0) + 1,
				}))
				onAction({ key: 'reply' })
				handleClear()
			}
		} catch (error) {
			openError(error)
		} finally {
			handleSetLoadingSubmit('reply')(false)
		}
	}
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
	const handleImportImg = debounce(async (_values) => {
		const values = []

		for (const i of _values || []) {
			const file = i?.originFileObj
			if (!file) continue

			if (file.type?.startsWith('image')) {
				const { imageUrl } = handleParseFileImg(file)
				if (imageUrl) values.push({ type: 'IMAGE', url: imageUrl, file })
				continue
			}

			if (file.type?.startsWith('video')) {
				const { videoUrl } = await handleParseFileVideo(file)
				if (videoUrl) values.push({ type: 'VIDEO', url: videoUrl, file })
				continue
			}
		}
		const maxItem = 5 - (contentDataSubmit?.medias?.length || 0)
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

	const handleEditComment = async (idComment: string) => {
		try {
			handleSetLoadingSubmit('editChild')(true)
			const body = await handleParsePayload(contentDataSubmit, fileList)
			const res: any = await editComment({ id: idComment, payload: body })
			if (res) {
				const { object: value } = res?.results || {}
				const { name, avatar, id, is_verified } = getUserInfo()
				setCommentList((prev) =>
					(prev || []).map((item) =>
						item.id === value?.id
							? {
									...value,
									user: {
										name,
										avatar,
										id,
										is_verified,
									},
								}
							: item,
					),
				)
				handleClear()
			}
		} catch (error) {
			openError(error)
		} finally {
			handleSetLoadingSubmit('editChild')(false)
		}
	}
	const handleSetHiddenReply = (val) => {
		setHiddenReply(!!val)
	}
	useEffect(() => {
		if (amount_of_replies) {
			handleGetComment()
		} else {
			_loadmore.current = false
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])
	useEffect(() => {
		setDataSubmit(item)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])
	return {
		_loadmore,

		hiddenReply,
		isReply,
		isEdit,
		editChild,

		loadingSubmit,
		loading,
		// loadingShare,

		// shareList,
		commentList,
		deleteLoading,
		modal,
		dataSubmit,
		contentDataSubmit,
		fileList,
		setFileList,
		setDataSubmit,
		setModal,
		// discussDetail,
		// totalComment,
		// commentContent,

		onGetMenus: handleGetMenus,

		onLoadMore: handleLoadMore,
		onAction: handleActionCommentItem,
		onChangeDataSubmit: handleChangeDataSubmit,
		onImportImg: handleImportImg,
		onGetMenusItem: handleGetMenusCommentItemParent,
		onCommentItemParentAction: handleCommentItemParentAction,
		onSetHiddenReply: handleSetHiddenReply,
	}
}
