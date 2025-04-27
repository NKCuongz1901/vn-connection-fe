import { useEffect, useRef, useState } from 'react'

import { useModal } from '@/context/ModalContext'

import { getFriends } from '@/apis/friendApis'

import { uniqueArray } from '@/ultis/array.ults'
import { cloneDeep, delay } from '@/ultis/common.ults'

import { optionFriends, paginationCommon } from '@/Variable/common.variable'

import { PaginationType } from '@/interface/common/common.interface'

export default function useMyFriend({}: any) {
	const { openError } = useModal()
	const _paginationRefs = useRef<PaginationType>(cloneDeep(paginationCommon))
	const _parentRef = useRef<HTMLDivElement | null>(null)
	const _childRef = useRef<HTMLDivElement | null>(null)

	const [loading, setLoading] = useState(false)
	const [searchText, setSearchText] = useState('')
	const [friendList, setFriendList] = useState([]) as any[]
	const [total, setTotal] = useState(0)

	const handleGetMyFriend = async () => {
		setLoading(true)
		try {
			const { page, limit } = _paginationRefs.current
			const isNew = page === 1
			if (isNew) {
				setFriendList([])
			}
			const params = {
				type: optionFriends[0].value,
				fields: ['$all', { user: ['$all'] }, { friend: ['$all'] }],
				where: {
					name: searchText,
				},
				page,
				limit,
			}
			const res: any = await getFriends({ params })
			const { code, results } = res || {}
			await delay(1000)
			if (code === 200) {
				const { rows, count } = results?.objects || {}
				const totalPage = Math.ceil((count || 0) / (limit || 1))
				_paginationRefs.current.totalPage = totalPage
				setFriendList((prev: any[]) => {
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
		await handleGetMyFriend()
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

	useEffect(() => {
		handleGetMyFriend()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	useEffect(() => {
		handleAutoLoadMore()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [JSON.stringify(friendList)])

	useEffect(() => {
		let id = null as any
		if (_paginationRefs.current) {
			id = setTimeout(() => {
				_paginationRefs.current.page = 1
				handleGetMyFriend()
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
		friendList,
		onScroll: handleScroll,
	}
}
