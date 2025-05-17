import { useEffect, useRef, useState } from 'react'

import { useLoading } from '@/context/LoadingContext'
import { useModal } from '@/context/ModalContext'

import {
	deleteCommentPost,
	getListListCommentById,
	sendCommentPost,
} from '@/apis/postApis'

import { uniqueArray } from '@/ultis/array.ults'
import { cloneDeep, delay } from '@/ultis/common.ults'
import { getUserInfo } from '@/ultis/storage.ults'

import { PaginationType } from '@/interface/common/common.interface'
import { paginationCommon } from '@/Variable/common.variable'

interface useEventCommentProps {
	id: string
	[key: string]: any
}
export default function useEventComment({ id }: useEventCommentProps) {
	const { openError } = useModal()
	const { toggleLoadingContext, loadingContext } = useLoading()

	const _paginationRefs = useRef<PaginationType>(cloneDeep(paginationCommon))
	const _parentRef = useRef<HTMLDivElement | null>(null)
	const _childRef = useRef<HTMLDivElement | null>(null)

	const [commentContent, setCommentContent] = useState('')
	const [commentList, setCommentList] = useState([]) as any
	const [loading, setLoading] = useState(false)
	const [deleteLoading, setDeleteLoading] = useState<string[]>([])
	const [total, setTotal] = useState(0)
	const handleChangeComment = (e) => {
		const content = e.target.value
		setCommentContent(content)
	}

	const handleGetListPost = async () => {
		setLoading(true)
		try {
			const { page, limit } = _paginationRefs.current
			const isNew = page === 1
			const res: any = await getListListCommentById({
				fields: ['$all', { user: ['name', 'phone', 'avatar', 'is_verified'] }],
				where: { post_id: id },
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
				setTotal(count)
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoading(false)
		}
	}
	const handleLoadMore = async () => {
		const isLoadMore =
			_paginationRefs.current.page < _paginationRefs.current.totalPage

		if (!isLoadMore || loading) return
		_paginationRefs.current.page += 1
		await handleGetListPost()
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
	const handleSendCommentPost = async () => {
		if (!commentContent.trim() || loadingContext) {
			return
		}
		try {
			toggleLoadingContext(true)
			const res: any = await sendCommentPost({
				post_id: id,
				content: commentContent,
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
				setCommentContent('')
				setCommentList((prev: any[]) => [data, ...prev])
				setTotal((prev) => prev + 1)
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
	useEffect(() => {
		handleAutoLoadMore()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [JSON.stringify(commentList)])

	useEffect(() => {
		handleGetListPost()
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
		// onGetDetailPost: handleGetComment,
		onChangeComment: handleChangeComment,
		onSendComment: handleSendCommentPost,
		onDeletePost: handleDeletePost,
		onScroll: handleScroll,
		onKeyDown: handleKeyDown,
	}
}
