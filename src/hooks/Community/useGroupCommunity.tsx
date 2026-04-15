import { useEffect, useRef, useState } from 'react'

import {
	getConvClubList,
	getConvClubListSuggest,
} from '@/apis/conversationApis'

import { useModal } from '@/context/ModalContext'

import { isArray, uniqueArray } from '@/ultis/array'
import { cloneDeep, delay, handleScrollCallback } from '@/ultis/common'

import { PaginationType } from '@/interface/common/common.interface'
import { NetworkClubSuggestProps } from '@/interface/Community/Community.interface'
import { paginationMore } from '@/Variable/common.variable'

interface useCommunityProps {
	[key: string]: any
}

export default function useGroupCommunity(props: useCommunityProps) {
	const { id } = props
	const { openError } = useModal()

	const _paginationRefs = useRef<PaginationType>(cloneDeep(paginationMore))
	const _loadmore = useRef<boolean>(true)

	const [keyword, setKeyword] = useState('')

	const [network, setNetwork] = useState<NetworkClubSuggestProps[]>([])

	const [loading, setLoading] = useState(true)

	const handleGetNetwork = async () => {
		setLoading(true)
		try {
			const { page, limit } = _paginationRefs.current
			let isNew = false
			if (page === 1) {
				setNetwork([])
				isNew = true
			}
			const params = {
				fields: ['$all'],
				order: [['created_at', 'desc']],
				page: page,
				limit: limit,
				...(keyword && { keyword }),
			}

			const networkClubApi =
				id !== 'suggest'
					? getConvClubList({
							...params,
							group_id: id,
						})
					: getConvClubListSuggest(params)

			const networkClubRes: any = await networkClubApi
			await delay(1000)
			const { results } = networkClubRes || {}

			if (networkClubRes) {
				const { objects } = results
				const { rows } = objects
				if (!isArray(rows, limit)) {
					_loadmore.current = false
				}
				setNetwork((prev) => {
					const contents = isNew ? [] : prev
					const newData = uniqueArray([...contents, ...rows], 'id')
					return newData
				})
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoading(false)
		}
	}

	const handleLoadMore = async () => {
		if (!_loadmore.current || loading) return
		const { limit } = _paginationRefs.current
		const currentPage = Math.trunc((network || []).length / limit)
		_paginationRefs.current.page = currentPage + 1
		await handleGetNetwork()
	}
	const handleScroll = (e: any) => {
		handleScrollCallback(e, handleLoadMore)
	}
	useEffect(() => {
		const id = setTimeout(() => {
			_paginationRefs.current.page = 1
			handleGetNetwork()
		}, 1000)
		return () => {
			clearTimeout(id)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [keyword])

	return {
		loading,
		network,
		keyword,

		setKeyword,
		onGetNetwork: handleGetNetwork,
		onScroll: handleScroll,
	}
}
