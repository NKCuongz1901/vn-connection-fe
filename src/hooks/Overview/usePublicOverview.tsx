'use client'

import { Dayjs } from 'dayjs'
import { useEffect, useRef, useState } from 'react'

import { useModal } from '@/context/ModalContext'
import { getPublicListPost } from '@/apis/postApis'
import { getTalkRoomOverview } from '@/apis/talkRoomApis'

import { isArray, uniqueArray } from '@/ultis/array'
import { cloneDeep, delay } from '@/ultis/common'

import { PaginationType } from '@/interface/common/common.interface'
import { paginationCommon } from '@/Variable/common.variable'

type filterProps = {
	radius: number | string | null
	date: [Dayjs, Dayjs] | null
	categories: string[] | null
	title: string | null
}

export default function usePublicOverview() {
	const { openError } = useModal()
	const _filterRef = useRef<filterProps>({
		radius: 50,
		date: null,
		categories: null,
		title: '',
	})
	const _paginationRef = useRef<PaginationType>(cloneDeep(paginationCommon))
	const timeoutRef = useRef<ReturnType<typeof setTimeout>>()
	const _listRef = useRef<HTMLDivElement | null>(null)

	const [listPost, setListPost] = useState<any[]>([])
	const [loading, setLoading] = useState(false)
	const [total, setTotal] = useState(0)
	const [loadmore, setLoadMore] = useState(true)
	const [loadingTalkroom, setLoadingTalkroom] = useState(false)
	const [listTalkroom, setListTalkroom] = useState<any[]>([])
	const [totalTalkroom, setTotalTalkroom] = useState(0)
	const [statsTalkroom, setStatsTalkroom] = useState<any>({})
	const [filters, setFilters] = useState<filterProps>({
		radius: 50,
		date: null,
		categories: null,
		title: '',
	})

	const handleGetListPost = async (isNotLoading = false) => {
		setLoading(true)
		try {
			const { page, limit } = _paginationRef.current
			const { radius, date, categories, title } = _filterRef.current
			const dates: Record<string, number> = {}
			if (date) {
				Object.assign(dates, {
					start_time: date[0].startOf('day').valueOf(),
					end_time: date[1].endOf('day').valueOf(),
				})
			}
			let isNew = page === 1
			if (isNotLoading) {
				isNew = false
			}
			if (isNew) {
				setListPost([])
			}
			const res: any = await getPublicListPost({
				fields: ['$all', { user: ['name', 'phone', 'avatar', 'is_verified'] }],
				page: !isNotLoading ? page : 1,
				limit: !isNotLoading ? limit : 50,
				radius,
				...(categories && { categories }),
				...(title && { title }),
				...dates,
			})
			const { code, results } = res || {}
			await delay(500)
			if (code === 200) {
				const { rows, count } = results?.objects || {}
				if (!isNotLoading) {
					setLoadMore(isArray(rows, limit))
				}
				setListPost((prev) => {
					const contents = isNew && !isNotLoading ? [] : prev
					return uniqueArray([...contents, ...rows], 'id') as any[]
				})
				setTotal(count || 0)
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoading(false)
		}
	}

	const handleGetTalkroomOverview = async () => {
		setLoadingTalkroom(true)
		try {
			const res: any = await getTalkRoomOverview({
				params: {
					fields: ['$all'],
				},
			})
			const { code, results } = res || {}
			if (code === 200) {
				const { rooms, stats } = results?.object || {}
				setListTalkroom(rooms?.rows || [])
				setStatsTalkroom(stats || {})
				setTotalTalkroom(
					(stats?.live_rooms_count || 0) +
						(stats?.scheduled_rooms_count || 0),
				)
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoadingTalkroom(false)
		}
	}

	const handleChangeFilter = (type: string) => (value: any) => {
		switch (type) {
			case 'radius':
			case 'date':
				setFilters((prev) => ({ ...prev, [type]: value }))
				_filterRef.current[type] = value
				break
			case 'categories':
				setFilters((prev) => {
					let { categories } = prev || {}
					if (!isArray(categories, 1)) {
						categories = []
					}
					if (categories.includes(value)) {
						categories = categories.filter((i) => i !== value)
					} else {
						categories.push(value)
					}
					_filterRef.current.categories = categories
					return { ...prev, categories }
				})
				break
			default:
				break
		}
		setLoadMore(true)
		_paginationRef.current.page = 1
		handleGetListPost()
	}

	const handleChangeKeyword = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value
		setFilters((prev) => ({ ...prev, title: value }))
		_filterRef.current.title = value
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current)
		}
		timeoutRef.current = setTimeout(() => {
			setLoadMore(true)
			_paginationRef.current.page = 1
			handleGetListPost()
		}, 1000)
	}

	const handleLoadMore = async () => {
		const { limit } = _paginationRef.current
		if (!loadmore || loading) return
		_paginationRef.current.page =
			Math.trunc((listPost || []).length / limit) + 1
		await handleGetListPost()
	}

	const handleScrollList = (e: React.UIEvent<HTMLDivElement>) => {
		const { clientWidth, scrollWidth, scrollLeft } = e.currentTarget
		const isReachedEnd = Math.abs(scrollLeft) + clientWidth >= scrollWidth - 50
		if (!isReachedEnd) return
		handleLoadMore()
	}

	useEffect(() => {
		handleGetListPost()
		handleGetTalkroomOverview()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return {
		_listRef,
		listPost,
		loading,
		total,
		filters,
		listTalkroom,
		totalTalkroom,
		statsTalkroom,
		loadingTalkroom,
		onChangeFilter: handleChangeFilter,
		onChangeKeyword: handleChangeKeyword,
		onScrollList: handleScrollList,
	}
}
