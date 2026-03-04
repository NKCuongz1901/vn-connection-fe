import { useEffect, useRef, useState } from 'react'

import { useModal } from '@/context/ModalContext'

import { getInappEvent } from '@/apis/searchApis'

import { isArray, uniqueArray } from '@/ultis/array.ults'
import { cloneDeep, delay, handleScrollCallback } from '@/ultis/common.ults'
import { randomString } from '@/ultis/string.ults'

import { paginationCommon } from '@/Variable/common.variable'

import {
	EventInAppProps,
	EventInAppResProps,
} from '@/interface/Search/Search.interface'
import { PaginationType } from '@/interface/common/common.interface'

interface useSocialEventProps {
	data: {
		longitude?: number | string
		latitude?: number | string
		address?: string
		[key: string]: any
	}
	[key: string]: any
}

export default function useSocialEvent({ data }: useSocialEventProps) {
	const { openError } = useModal()
	const { longitude, latitude, address, type } = data || {}

	const _paginationRefs = useRef<PaginationType>(cloneDeep(paginationCommon))
	const _loadmore = useRef<boolean>(true)
	const [event, setUser] = useState<EventInAppProps[]>([])

	const [shows, setShows] = useState({ filter: false, language: false })

	const [filter, setFilter] = useState({
		date: null,
		radius: 20,
		keyword: '',
		is_free: false,
	})

	const [loading, setLoading] = useState(true)
	const [total, setTotal] = useState({ event: 0 })
	const [apiId, setApiId] = useState<string>('')

	const handleChangeValue = (_key) => (_value) => {
		const key = _key
		let valueInput = _value
		switch (_key) {
			case 'keyword':
				valueInput = _value.target.value
				break
			default:
				break
		}
		setFilter((prev) => ({ ...prev, [key]: valueInput }))
		setApiId(randomString())
	}
	const handleGetInAppLocal = async () => {
		setLoading(true)
		let _total = 0
		try {
			const { page, limit } = _paginationRefs.current
			const { radius, keyword, date, is_free } = filter
			let isNew = false
			if (page === 1) {
				setUser([])
				isNew = true
			}
			const body = {
				radius,
				...(isArray(date, 2) && {
					start_time: date[0].startOf('day').valueOf(),
					end_time: date[1].endOf('day').valueOf(),
				}),
				keyword,
				...(is_free && { is_free }),
			}
			if (
				Number(latitude) &&
				Number(longitude) &&
				!isNaN(Number(longitude)) &&
				!isNaN(Number(latitude))
			) {
				Object.assign(body, {
					latitude: Number(latitude),
					longitude: Number(longitude),
					google_title: address || '',
					...(type && {
						type: (type || '').split(','),
					}),
				})
			}
			const res: EventInAppResProps = (await getInappEvent({
				fields: ['$all'],
				...body,
				page,
				limit,
			})) as any
			const { results } = res || {}
			await delay(1000)
			if (res) {
				const { objects } = results
				const { rows } = objects
				if (!isArray(rows, limit)) {
					_loadmore.current = false
				}
				setUser((prev: EventInAppProps[]) => {
					const contents = isNew ? [] : prev
					const newData: EventInAppProps[] = uniqueArray(
						[...contents, ...rows],
						'id',
					)
					return newData
				})
				_total = results.objects.count
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoading(false)
			setTotal((prev) => ({ ...prev, event: _total }))
		}
	}

	const handleLoadMore = async () => {
		if (!_loadmore.current || loading) return
		const { limit } = _paginationRefs.current
		const currentPage = Math.trunc((event || []).length / limit)
		_paginationRefs.current.page = currentPage + 1
		await handleGetInAppLocal()
	}

	const handleScroll = (e: any) => {
		handleScrollCallback(e, handleLoadMore)
	}
	const handleSearch = () => {
		setShows({ filter: false, language: false })
		_loadmore.current = true
		_paginationRefs.current.page = 1
		handleGetInAppLocal()
	}
	useEffect(() => {
		handleGetInAppLocal()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])
	useEffect(() => {
		let timeout: ReturnType<typeof setTimeout>

		if (apiId) {
			timeout = setTimeout(() => handleSearch(), 1000)
		}

		return () => {
			clearTimeout(timeout)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [apiId])

	return {
		loading,
		event,
		total,
		_loadmore,
		filter,
		shows,
		setShows,
		onChangeValue: handleChangeValue,
		onScroll: handleScroll,
		onLoadMore: handleLoadMore,
		onSearch: handleSearch,
	}
}
