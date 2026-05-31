import { useEffect, useRef, useState } from 'react'

import { useModal } from '@/context/ModalContext'

import { getInappCategoryUser, getInappLocal } from '@/apis/searchApis'

import { isArray, uniqueArray } from '@/ultis/array'
import { cloneDeep, delay, handleScrollCallback } from '@/ultis/common'
import { randomString } from '@/ultis/string'

import { paginationMore } from '@/Variable/common.variable'

import { LocalProps, LocalResProps } from '@/interface/Search/Search.interface'
import { PaginationType } from '@/interface/common/common.interface'
import { NetworkClubSearchInAppProps } from '@/interface/Community/Community.interface'
import { radiusOpts } from '@/Variable/select.variable'
import { getUserInfo } from '@/ultis/storage'

const normalizeCategoryRows = (rows: any): NetworkClubSearchInAppProps[] => {
	if (Array.isArray(rows)) return rows
	if (rows && typeof rows === 'object') return Object.values(rows)
	return []
}

interface useLocalProps {
	data: {
		longitude?: number | string
		latitude?: number | string
		address?: string
		[key: string]: any
	}
	[key: string]: any
}

export default function useLocal({ data }: useLocalProps) {
	const { openError } = useModal()
	const { longitude, latitude, address, type } = data || {}

	const _paginationRefs = useRef<PaginationType>(cloneDeep(paginationMore))
	const _loadmore = useRef<boolean>(true)
	const [user, setUser] = useState<LocalProps[]>([])

	const [shows, setShows] = useState({
		filter: false,
		language: false,
		hobbies: false,
	})

	const [filter, setFilter] = useState({
		gender_array: [],
		age_range: [18, 81],
		languages_can_speak_array: [] as string[],
		nationality: [] as string[],
		interest: [] as string[],
		radius: radiusOpts.at(-1).value,
		keyword: '',
	})

	const [tabsData, setTabsData] = useState<NetworkClubSearchInAppProps[]>([])

	const [loading, setLoading] = useState(true)
	const [total, setTotal] = useState({ user: 0 })
	const [apiId, setApiId] = useState<string>('')

	const handleChangeValue = (_key) => (_value) => {
		const { gender_array, languages_can_speak_array, interest } =
			cloneDeep(filter) || {}
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
			case 'hobby':
				{
					key = 'interest'
					let value: string[] = interest || []
					if (value?.includes(_value)) {
						value = value.filter((i) => i !== _value)
					} else {
						if (isArray(value, 3)) {
							openError('You can only select up to 3 interests')
							return
						}
						value.push(_value)
					}
					valueInput = value
				}
				break
			case 'nationality':
				key = 'nationality'
				valueInput = _value ? [_value] : []
				break
			case 'radiusOption':
				key = 'radius'
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
					languages_can_speak_array: [],
					nationality: [],
					interest: [],
					radius: radiusOpts.at(-1).value,
				}))
				return
			case 'resetLanguage':
				setFilter((prev) => ({
					...prev,
					languages_can_speak_array: [],
				}))
				return
			case 'resetHobbies':
				setFilter((prev) => ({
					...prev,
					interest: [],
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

	const handleGetInAppLocal = async (filterOverride?: Partial<typeof filter>) => {
		setLoading(true)
		let _total = 0
		const activeFilter = { ...filter, ...filterOverride }
		try {
			const { page, limit } = _paginationRefs.current
			const {
				age_range,
				gender_array,
				radius,
				keyword,
				languages_can_speak_array,
				nationality,
				interest,
			} = activeFilter
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
				...(isArray(interest, 1) && {
					interest,
					categories_array: interest,
				}),
				...(isArray(nationality, 1) && { nationality }),
				age_range,
				keyword,
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
		setShows({ filter: false, language: false, hobbies: false })
		_loadmore.current = true
		_paginationRefs.current.page = 1
		handleGetInAppLocal()
	}

	const handleToggleLanguage = (value: string) => {
		const current = filter.languages_can_speak_array || []
		const next = current.includes(value)
			? current.filter((item) => item !== value)
			: [...current, value]

		setFilter((prev) => ({ ...prev, languages_can_speak_array: next }))
		_loadmore.current = true
		_paginationRefs.current.page = 1
		handleGetInAppLocal({ languages_can_speak_array: next })
	}

	const handleToggleHobby = (id: string) => {
		const current = filter.interest || []
		let next: string[]

		if (current.includes(id)) {
			next = current.filter((item) => item !== id)
		} else {
			if (isArray(current, 3)) {
				openError('You can only select up to 3 interests')
				return
			}
			next = [...current, id]
		}

		setFilter((prev) => ({ ...prev, interest: next }))
		_loadmore.current = true
		_paginationRefs.current.page = 1
		handleGetInAppLocal({ interest: next })
	}

	const handleFetchInterestCategories = async () => {
		try {
			const { latitude: userLat, longitude: userLng } = getUserInfo() || {}
			const payload = {
				fields: ['$all'],
				latitude: Number(latitude) || userLat || 0,
				longitude: Number(longitude) || userLng || 0,
				google_title: address || '',
				radius: filter.radius,
				...(type && {
					type: (type || '').split(','),
				}),
			}
			const res: any = await getInappCategoryUser(payload)
			const rows = res?.results?.objects?.rows
			setTabsData(normalizeCategoryRows(rows))
		} catch (error) {
			openError(error)
		}
	}
	useEffect(() => {
		handleGetInAppLocal()
		handleFetchInterestCategories()
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
		tabsData,
		shows,
		setShows,
		onChangeValue: handleChangeValue,
		onToggleLanguage: handleToggleLanguage,
		onToggleHobby: handleToggleHobby,
		onScroll: handleScroll,
		onLoadMore: handleLoadMore,
		onSearch: handleSearch,
	}
}
