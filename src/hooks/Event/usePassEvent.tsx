import { useEffect, useRef, useState } from 'react'

import { useModal } from '@/context/ModalContext'

import { getMyEventsPassed } from '@/apis/postApis'

import { isArray, uniqueArray } from '@/ultis/array'
import { cloneDeep, delay } from '@/ultis/common'
import { getSessionStorage, setSessionStorage } from '@/ultis/storage'

import { paginationCommon } from '@/Variable/common.variable'

import { PaginationType } from '@/interface/common/common.interface'
import { FIRST_ACTION_KEY, STORAGE_KEY } from '@/Variable/storage.variable'

export default function usePassEvent() {
	const { openError } = useModal()
	const _paginationRefs = useRef<PaginationType>(cloneDeep(paginationCommon))
	const _parentRef = useRef<HTMLDivElement | null>(null)
	const _childRef = useRef<HTMLDivElement | null>(null)

	const [listPost, setListPost] = useState([]) as any[]
	const [loadmore, setLoadMore] = useState(true)
	const [total, setTotal] = useState(0)
	const [loading, setLoading] = useState(false)
	const [modal, setModal] = useState<{
		type: string
		data?: any
	}>({ type: null, data: null })

	const handleGetListPost = async (isNotLoading = false) => {
		setLoading(true)
		try {
			const { page, limit } = _paginationRefs.current
			let isNew = page === 1
			if (isNotLoading) {
				isNew = false
			}
			if (isNew) {
				setListPost([])
			}

			const res: any = await getMyEventsPassed({
				fields: ['$all', { user: ['name', 'phone', 'avatar', 'is_verified'] }],
				page: page,
				limit: limit,
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
				setTotal(count || 0)
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoading(false)
		}
	}

	const handleLoadMore = async () => {
		const { limit } = _paginationRefs.current
		if (!loadmore || loading || !isArray(listPost, 1)) return
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

	const handleScroll = (e: any) => {
		const clientHeight = e.target.clientHeight
		const scrollHeight = e.target.scrollHeight
		const scrollTop = Math.abs(e.target.scrollTop)
		const isReachedEnd = scrollTop + clientHeight >= scrollHeight - 50
		if (!isReachedEnd) return

		handleLoadMore()
	}

	const handleCheckRemind = () => {
		const { [FIRST_ACTION_KEY.PASS_EVENT]: passEvent } =
			getSessionStorage(STORAGE_KEY.FIRST_ACTION) || {}
		if (!passEvent) {
			setModal({ type: 'confirm', data: null })
		}
	}

	const handleCloseModal = () => {
		const { type } = modal || {}
		if (type === 'confirm') {
			const data = getSessionStorage(STORAGE_KEY.FIRST_ACTION) || {}
			setSessionStorage({
				key: STORAGE_KEY.FIRST_ACTION,
				data: { ...data, [FIRST_ACTION_KEY.PASS_EVENT]: true },
			})
		}
		setModal({ type: null, data: null })
	}

	useEffect(() => {
		_paginationRefs.current.page = 1
		handleGetListPost()
		handleCheckRemind()
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
		modal,

		onScroll: handleScroll,
		onCloseModal: handleCloseModal,
	}
}
