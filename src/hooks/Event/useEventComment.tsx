import { debounce } from 'lodash'
import { useEffect, useRef, useState } from 'react'

import { useLoading } from '@/context/LoadingContext'
import { useModal } from '@/context/ModalContext'

import {
	deleteCommentPost,
	getListCommentById,
	sendCommentPost,
} from '@/apis/postApis'
import { handleUploadImage, handleUploadVideo } from '@/apis/uploadApis'

import { isArray, uniqueArray } from '@/ultis/array'
import { cloneDeep, delay } from '@/ultis/common'
import { handleParseFileImg, handleParseFileVideo } from '@/ultis/file'
import { getUserInfo } from '@/ultis/storage'

import { PaginationType } from '@/interface/common/common.interface'
import { paginationCommon } from '@/Variable/common.variable'

interface useEventCommentProps {
	id: string
	[key: string]: any
}
export default function useEventComment({ id }: useEventCommentProps) {
	const { openError, openConfirm, closeModal } = useModal()
	const { toggleLoadingContext, loadingContext } = useLoading()

	const _paginationRefs = useRef<PaginationType>(cloneDeep(paginationCommon))
	const _parentRef = useRef<HTMLDivElement | null>(null)
	const _childRef = useRef<HTMLDivElement | null>(null)

	const [commentContent, setCommentContent] = useState('')
	const [commentList, setCommentList] = useState([]) as any
	const [loading, setLoading] = useState(false)
	const [deleteLoading, setDeleteLoading] = useState<string[]>([])
	const [total, setTotal] = useState(0)
	const [fileList, setFileList] = useState([])

	const handleChangeComment = (e) => {
		const content = e.target.value
		setCommentContent(content)
	}

	const handleGetListCommentById = async () => {
		setLoading(true)
		try {
			const { page, limit } = _paginationRefs.current
			const isNew = page === 1
			const res: any = await getListCommentById({
				fields: ['$all', { user: ['name', 'phone', 'avatar', 'is_verified'] }],
				where: { post_id: id, parent_id: null },
				page,
				limit,
			})
			const { code, results } = res || {}
			await delay(1000)

			if (code === 200) {
				const { rows, count } = results?.objects || {}
				const totalPage = Math.ceil((count || 0) / (limit || 1))
				_paginationRefs.current.totalPage = totalPage
				setCommentList((prev: any[]) => {
					const contents = isNew ? [] : prev
					const dataShow = uniqueArray(
						[...contents, ...(rows || [])],
						'id',
					) as any[]
					return dataShow
				})
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoading(false)
		}
	}
	const handleGetCommentTotal = async () => {
		try {
			const res: any = await getListCommentById({
				fields: ['$all', { user: ['name', 'phone', 'avatar', 'is_verified'] }],
				where: { post_id: id },
				page: 1,
				limit: 1,
			})
			const { code, results } = res || {}

			if (code === 200) {
				const { count } = results?.objects || {}

				setTotal(count)
			}
		} catch {
		} finally {
		}
	}
	const handleLoadMore = async () => {
		const isLoadMore =
			_paginationRefs.current.page < _paginationRefs.current.totalPage

		if (!isLoadMore || loading) return
		_paginationRefs.current.page += 1
		await handleGetListCommentById()
	}

	const handleAutoLoadMore = () => {
		if (_parentRef.current && _childRef.current) {
			if (_parentRef.current?.clientHeight > _childRef.current?.scrollHeight) {
				handleLoadMore()
			}
		}
	}
	const handleScroll = (e: any) => {
		const clientHeight = e.target.clientHeight
		const scrollHeight = e.target.scrollHeight
		const scrollTop = Math.abs(e.target.scrollTop)
		const isReachedEnd = scrollTop + clientHeight >= scrollHeight - 50
		if (!isReachedEnd) return

		handleLoadMore()
	}
	const handleParsePayLoad = async () => {
		toggleLoadingContext(true)
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
		return {
			post_id: id,
			content: commentContent,
			medias: medias,
		}
	}
	const handleSendCommentPost = async () => {
		if ((!commentContent.trim() && !isArray(fileList, 1)) || loadingContext) {
			return
		}
		const body = await handleParsePayLoad()
		try {
			toggleLoadingContext(true)
			const res: any = await sendCommentPost(body)
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
				setCommentContent('')
				setCommentList((prev: any[]) => [data, ...prev])
				setTotal((prev) => prev + 1)
				setFileList([])
			}
		} catch (error) {
			openError(error)
		} finally {
			toggleLoadingContext()
		}
	}
	const handleKeyDown = (e) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault() // nếu cần chặn mặc định (như xuống dòng)
			e.stopPropagation()
			handleSendCommentPost()
			// Thực hiện hành động tại đây
		}
	}

	const handleDeletePost = async (id: string) => {
		try {
			setDeleteLoading((prev) => [...prev, id])
			const res: any = await deleteCommentPost(id)
			const { code } = res || {}
			if (code === 200) {
				setTotal((pre) => pre - 1)
				setCommentList((prev: any[]) => prev.filter((i) => i.id !== id))
			}
		} catch (error) {
			openError(error)
		} finally {
			setDeleteLoading((prev) => prev.filter((i) => i !== id))
		}
	}

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
		const maxItem = 5
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

	const handleAction = ({ key, value }) => {
		switch (key) {
			case 'delete':
				setCommentList((prev: any[]) => prev.filter((i) => i.id !== value))
				setTotal((prev) => prev - 1)
				break
			case 'reply':
				setTotal((prev) => prev + 1)
				break
			default:
				break
		}
	}
	useEffect(() => {
		handleAutoLoadMore()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [JSON.stringify(commentList)])

	useEffect(() => {
		handleGetListCommentById()
		handleGetCommentTotal()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id])

	return {
		_parentRef,
		_childRef,
		loading,
		commentList,
		commentContent,
		total,
		deleteLoading,

		fileList,
		setFileList,

		// onGetDetailPost: handleGetComment,
		onChangeComment: handleChangeComment,
		onSendComment: handleSendCommentPost,
		onDeletePost: handleDeletePost,
		onScroll: handleScroll,
		onKeyDown: handleKeyDown,
		onImportImg: handleImportImg,
		onAction: handleAction,
	}
}
