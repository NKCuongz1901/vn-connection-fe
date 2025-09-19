import { useEffect, useRef, useState } from 'react'

import { useModal } from '@/context/ModalContext'

import { getInappLocal } from '@/apis/searchApis'

import { isArray, uniqueArray } from '@/ultis/array.ults'
import { cloneDeep, delay, handleScrollCallback } from '@/ultis/common.ults'
import { randomString } from '@/ultis/string.ults'

import { paginationMore } from '@/Variable/common.variable'

import { LocalProps, LocalResProps } from '@/interface/Search/Search.interface'
import { PaginationType } from '@/interface/common/common.interface'

interface useLocalProps {
	data: {
		longitude: number | string
		latitude: number | string
	}
	[key: string]: any
}

export default function useLocal({ data }: useLocalProps) {
	const { openError } = useModal()
	const { longitude, latitude } = data || {}

	const _paginationRefs = useRef<PaginationType>(cloneDeep(paginationMore))
	const _loadmore = useRef<boolean>(true)
	const [user, setUser] = useState<LocalProps[]>([])

	const [shows, setShows] = useState({ filter: false, language: false })

	const [filter, setFilter] = useState({
		gender_array: [],
		age_range: [18, 81],
		languages_can_speak_array: [],
		radius: 20,
		keyword: '',
	})

	const [loading, setLoading] = useState(true)
	const [total, setTotal] = useState({ user: 0 })
	const [apiId, setApiId] = useState<string>('')

	const handleChangeValue = (_key) => (_value) => {
		const { gender_array, languages_can_speak_array } = cloneDeep(filter) || {}
		let key = _key
		let valueInput = _value
		switch (_key) {
			case 'gender':
				{
					key = 'gender_array'
					let value: string[] = gender_array || []
					if (value?.includes(_value)) {
						value = value.filter((i) => i !== _value)
					} else {
						value.push(_value)
					}
					valueInput = value
				}
				break
			case 'language':
				{
					key = 'languages_can_speak_array'
					let value: string[] = languages_can_speak_array || []
					if (value?.includes(_value)) {
						value = value.filter((i) => i !== _value)
					} else {
						value.push(_value)
					}
					valueInput = value
				}
				break
			case 'age':
				key = 'age_range'
				break
			case 'distance':
				key = 'radius'
				break
			case 'reset':
				setFilter((prev) => ({
					...prev,
					gender_array: [],
					age_range: [18, 81],
					radius: 20,
				}))
				return
			case 'resetLanguage':
				setFilter((prev) => ({
					...prev,
					languages_can_speak_array: [],
				}))
				return
			case 'keyword':
				setFilter((prev) => ({
					...prev,
					keyword: _value.target.value,
				}))
				setApiId(randomString())

				return

			default:
				break
		}
		setFilter((prev) => ({ ...prev, [key]: valueInput }))
	}

	const handleGetInAppLocal = async () => {
		setLoading(true)
		let _total = 0
		try {
			const { page, limit } = _paginationRefs.current
			const {
				age_range,
				gender_array,
				radius,
				keyword,
				languages_can_speak_array,
			} = filter
			let isNew = false
			if (page === 1) {
				setUser([])
				isNew = true
			}
			const body = {
				radius,
				...(isArray(gender_array, 1) && { gender_array }),
				...(isArray(languages_can_speak_array, 1) && {
					languages_can_speak_array,
				}),
				age_range,
				keyword,
			}
			if (
				Number(latitude) &&
				Number(longitude) &&
				!isNaN(Number(longitude)) &&
				!isNaN(Number(latitude))
			) {
				Object.apply(body, {
					latitude: Number(latitude),
					longitude: Number(longitude),
				})
			}
			const res: LocalResProps = (await getInappLocal({
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
				setUser((prev: LocalProps[]) => {
					const contents = isNew ? [] : prev
					const newData: LocalProps[] = uniqueArray(
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
			setTotal((prev) => ({ ...prev, user: _total }))
		}
	}

	const handleLoadMore = async () => {
		if (!_loadmore.current || loading) return
		const { limit } = _paginationRefs.current
		const currentPage = Math.trunc((user || []).length / limit)
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
		user,
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
