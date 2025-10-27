import { useEffect, useRef, useState } from 'react'

import { useModal } from '@/context/ModalContext'

import { getConvClubList } from '@/apis/conversationApis'

import { isArray, uniqueArray } from '@/ultis/array.ults'
import { cloneDeep, delay } from '@/ultis/common.ults'

import { paginationCommon } from '@/Variable/common.variable'

import { PaginationType } from '@/interface/common/common.interface'

export default function useConversationClub(props: any) {
	const { id } = props
	const { openError } = useModal()
	const _paginationRefs = useRef<PaginationType>(cloneDeep(paginationCommon))
	const _parentRef = useRef<HTMLDivElement | null>(null)
	const _childRef = useRef<HTMLDivElement | null>(null)
	const _loadmore = useRef(true)

	const [loading, setLoading] = useState(false)
	const [searchText, setSearchText] = useState('')
	const [clubList, setClubList] = useState([]) as any[]
	const [total, setTotal] = useState(0)

	const handleGetConvClub = async () => {
		setLoading(true)
		try {
			const { page, limit } = _paginationRefs.current
			const isNew = page === 1
			if (isNew) {
				setClubList([])
			}
			const params = {
				fields: ['$all'],
				order: [['created_at', 'desc']],
				...(searchText && { keyword: searchText }),
				...(id && { invitee_id: id }),
				page,
				limit,
			}
			const res: any = await getConvClubList(params)
			const { code, results } = res || {}
			await delay(1000)
			if (code === 200) {
				const { rows, count } = results?.objects || {}
				const totalPage = Math.ceil((count || 0) / (limit || 1))
				_loadmore.current = isArray(rows, limit)

				_paginationRefs.current.totalPage = totalPage
				setClubList((prev: any[]) => {
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
		const { limit } = _paginationRefs.current
		if (!_loadmore.current || loading) return
		const currentPage = Math.trunc((clubList || []).length / limit)
		_paginationRefs.current.page = currentPage + 1
		await handleGetConvClub()
	}

	// const handleAutoLoadMore = () => {
	// 	if (_parentRef.current && _childRef.current) {
	// 		if (_parentRef.current?.clientHeight > _childRef.current?.scrollHeight) {
	// 			handleLoadMore()
	// 		}
	// 	}
	// }

	const handleScroll = (e: any) => {
		const clientHeight = e.target.clientHeight
		const scrollHeight = e.target.scrollHeight
		const scrollTop = Math.abs(e.target.scrollTop)
		const isReachedEnd = scrollTop + clientHeight >= scrollHeight - 50
		if (!isReachedEnd) return

		handleLoadMore()
	}

	useEffect(() => {
		handleGetConvClub()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	// useEffect(() => {
	// 	handleAutoLoadMore()
	// 	// eslint-disable-next-line react-hooks/exhaustive-deps
	// }, [JSON.stringify(clubList)])

	useEffect(() => {
		let id = null as any
		if (_paginationRefs.current) {
			id = setTimeout(() => {
				_paginationRefs.current.page = 1
				handleGetConvClub()
			}, 500) // 2s
		}
		return () => {
			clearTimeout(id)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchText])
	return {
		loading,
		searchText,
		setSearchText,
		_parentRef,
		_childRef,
		total,
		clubList,
		onScroll: handleScroll,
	}
}
