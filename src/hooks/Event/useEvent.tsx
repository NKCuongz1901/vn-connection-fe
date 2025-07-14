import { useEffect, useRef, useState } from 'react'

import { useModal } from '@/context/ModalContext'

import { getListPost } from '@/apis/postApis'

import { isArray, uniqueArray } from '@/ultis/array.ults'
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
	const [loadmore, setLoadMore] = useState(true)
	const [total, setTotal] = useState(0)
	const [loading, setLoading] = useState(false)
	const handleGetListPost = async (isNotLoading = false) => {
		setLoading(true)
		try {
			const { page, limit } = _paginationRefs.current
			let isNew = page === 1
			if (isNotLoading) {
				isNew = false
			}
			const res: any = await getListPost({
				fields: ['$all', { user: ['name', 'phone', 'avatar', 'is_verified'] }],
				page: !isNotLoading ? page : 1,
				limit: !isNotLoading ? limit : 50,
				type,
				radius: 20,
			})
			const { code, results } = res || {}
			await delay(1000)
			if (code === 200) {
				const { rows, count } = results?.objects || {}
				if (!isNotLoading) {
					setLoadMore(isArray(rows, limit))
				}
				setListPost((prev: any[]) => {
					const contents = isNew && !isNotLoading ? [] : prev
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
		const { limit } = _paginationRefs.current

		if (!loadmore || loading) return
		_paginationRefs.current.page =
			Math.ceil((listPost || []).length / limit) + 1
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
			handleGetListPost(true)
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
