import { useEffect, useRef, useState } from 'react'

import { useModal } from '@/context/ModalContext'

import { getListPost } from '@/apis/postApis'

import { uniqueArray } from '@/ultis/array.ults'
import { cloneDeep, delay } from '@/ultis/common.ults'

import { paginationCommon } from '@/Variable/common.variable'

import { PaginationType } from '@/interface/common/common.interface'
import { mainRoutes } from '@/routes/MainRoutes'

export default function useEvent({ type, onCRUDSuccess }: any) {
	const { openError } = useModal()
	const _paginationRefs = useRef<PaginationType>(cloneDeep(paginationCommon))
	const _parentRef = useRef<HTMLDivElement | null>(null)
	const _childRef = useRef<HTMLDivElement | null>(null)
	const [listPost, setListPost] = useState([]) as any[]
	const [total, setTotal] = useState(0)
	const [loading, setLoading] = useState(false)
	const handleGetListPost = async () => {
		setLoading(true)
		try {
			const { page, limit } = _paginationRefs.current
			const isNew = page === 1
			const res: any = await getListPost({
				fields: ['$all', { user: ['name', 'phone', 'avatar', 'is_verified'] }],
				page,
				limit,
				type,
				radius: 20,
			})
			const { code, results } = res || {}
			await delay(1000)
			if (code === 200) {
				const { rows, count } = results?.objects || {}
				const totalPage = Math.ceil((count || 0) / (limit || 1))
				_paginationRefs.current.totalPage = totalPage
				setListPost((prev: any[]) => {
					const contents = isNew ? [] : prev
					const dataShow = uniqueArray([...contents, ...rows], 'id') as any[]
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
	const handleCreateSuccess = (item) => {
		if (type === mainRoutes.event) {
			setListPost((prev) => [item, ...prev])
		}
		if (onCRUDSuccess) {
			onCRUDSuccess({ key: 'create', value: item })
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

	useEffect(() => {
		handleGetListPost()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	useEffect(() => {
		handleAutoLoadMore()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [JSON.stringify(listPost)])

	return {
		loading,
		_parentRef,
		_childRef,
		total,
		listPost,
		onScroll: handleScroll,
		onSuccess: handleCreateSuccess,
	}
}
