import {
	useCallback,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from 'react'

import { paginationCommon } from '@/Variable/common.variable'
import { getHangoutSearch, getUserOpenHangoutNow } from '@/apis/hangoutApi'
import { useModal } from '@/context/ModalContext'
import { PaginationType } from '@/interface/common/common.interface'
import { uniqueArray } from '@/ultis/array.ults'
import { cloneDeep, delay, toJson } from '@/ultis/common.ults'

export default function useHangoutTabOpen(ref) {
	const { openError } = useModal()

	const _paginationSearch = useRef<PaginationType>(cloneDeep(paginationCommon))
	const _paginationOpen = useRef<PaginationType>(cloneDeep(paginationCommon))
	const [openHangoutList, setOpenHangoutList] = useState([]) as any[]
	const [openHangoutSearch, setOpenHangoutSearch] = useState([]) as any[]
	const [loading, setLoading] = useState({ open: false, search: false })
	const loadMore = useRef({ open: true, search: false })
	const [total, setTotal] = useState({ open: 0, search: 0 })
	const [radius, setRadius] = useState(10)
	const isMounted = useRef(false)
	const hangoutList = useMemo(
		() => [...openHangoutSearch, ...openHangoutList],
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[toJson(openHangoutList), toJson(openHangoutSearch)],
	)

	const handleSearchUserOpenHangout = async () => {
		setLoading((prev) => ({ ...prev, open: true }))
		const { page, limit } = _paginationSearch.current
		try {
			const isNew = page === 1
			const res: any = await getHangoutSearch({
				fields: [
					'$all',
					{
						user: [
							'name',
							'phone',
							'avatar',
							'languages_can_speak',
							'birthday',
							'id',
							'gender',
							'is_verified',
						],
					},
				],
				page,
				limit,
				radius: radius,
			})
			if (!isMounted) return
			const { code, results } = res || {}
			await delay(1000)
			if (code === 200) {
				const { rows, count } = results?.objects || {}
				const totalPage = Math.ceil((count || 0) / (limit || 1))
				_paginationOpen.current.totalPage = totalPage
				if (rows.length < limit) {
					loadMore.current.search = false
				}
				setOpenHangoutSearch((prev: any[]) => {
					const contents = isNew ? [] : prev
					const dataShow = uniqueArray([...contents, ...rows], 'id') as any[]

					return dataShow
				})
				setTotal((prev) => ({ ...prev, search: count }))
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoading((prev) => ({ ...prev, open: false }))
		}
	}
	const handleUserOpenHangout = async () => {
		setLoading((prev) => ({ ...prev, open: true }))
		const { page, limit } = _paginationOpen.current
		try {
			const isNew = page === 1

			const res: any = await getUserOpenHangoutNow({
				fields: ['$all'],
				page,
				limit,
				radius: radius,
			})
			if (!isMounted) return
			const { code, results } = res || {}
			await delay(1000)
			if (code === 200) {
				const { rows, count } = results?.objects || {}
				const totalPage = Math.ceil((count || 0) / (limit || 1))
				_paginationOpen.current.totalPage = totalPage
				if (rows.length < limit) {
					loadMore.current.open = false
				}
				setOpenHangoutList((prev: any[]) => {
					const contents = isNew ? [] : prev
					const dataShow = uniqueArray([...contents, ...rows], 'id') as any[]
					return dataShow
				})
				setTotal((prev) => ({ ...prev, open: count }))
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoading((prev) => ({ ...prev, open: false }))
		}
	}

	const handleLoadMore = useCallback(() => {
		const { search, open } = loadMore.current || {}
		const isLoadMore = search || open
		if (!isLoadMore || loading.open || loading.search) return
		if (search) {
			_paginationSearch.current.page += 1
			handleSearchUserOpenHangout()
		}
		if (open) {
			_paginationOpen.current.page += 1
			handleUserOpenHangout()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [toJson(openHangoutList), toJson(openHangoutSearch)])

	useImperativeHandle(
		ref,
		() => ({
			onLoadMoreOpen: handleLoadMore,
		}),
		[handleLoadMore],
	)

	useEffect(() => {
		_paginationSearch.current.page = 1
		_paginationOpen.current.page = 1
		handleSearchUserOpenHangout()
		handleUserOpenHangout()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [radius])
	useEffect(() => {
		isMounted.current = true
		return () => {
			isMounted.current = false
		}
	}, [])
	return {
		loadMore: loadMore.current,
		total,
		hangoutList,
		loading,
		radius,
		setRadius,
		setOpenHangoutList,
		setOpenHangoutSearch,
		onLoadMore: handleLoadMore,
	}
}
