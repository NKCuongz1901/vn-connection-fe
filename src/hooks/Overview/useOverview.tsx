'use client'
import { useEffect, useRef, useState } from 'react'

import { useLoading } from '@/context/LoadingContext'
import { useModal } from '@/context/ModalContext'

import { getUserOpenHangout } from '@/apis/hangoutApi'
import { getmyEventInHome } from '@/apis/postApis'
import { getUserProfile, updateUserProfile } from '@/apis/userApis'

import { PaginationType } from '@/interface/common/common.interface'
import { uniqueArray } from '@/ultis/array.ults'
import { cloneDeep, delay } from '@/ultis/common.ults'
import { getUserInfo } from '@/ultis/storage.ults'

import { paginationCommon } from '@/Variable/common.variable'

type userDataProps = {
	is_open_hangout: boolean
	title_open_hangout: string
	latitude: null | number
	longitude: null | number
}
export default function useOverview() {
	const { toggleLoadingContext } = useLoading()
	const { openError } = useModal()

	const _childRef = useRef<HTMLDivElement | null>(null)
	const _paginationRefs = useRef<PaginationType>(cloneDeep(paginationCommon))

	const _loadmore = useRef(true)
	const [modal, setModal] = useState({ type: '', data: null }) as any
	const [userData, setUserData] = useState<userDataProps>({
		is_open_hangout: false,
		title_open_hangout: '',
		latitude: null,
		longitude: null,
	})
	const [hangoutPeople, setHangoutPeople] = useState<any[]>([])
	const [totalHangout, setTotalHangout] = useState(0)

	const [listMyEvent, setListMyEvent] = useState<any[]>([])
	const [totalMyEvent, setTotalMyEvent] = useState(0)

	const [loadingProfile, setLoadingProfile] = useState<boolean>(false)
	const [loadingMyEvent, setLoadingMyEvent] = useState<boolean>(false)

	const handleGetUserProfile = async () => {
		const id = getUserInfo('id')
		setLoadingProfile(true)
		try {
			const res: any = await getUserProfile({
				id,
				params: {
					fields: ['$all'],
				},
			})
			const { code, results } = res || {}
			if (code === 200) {
				const { is_open_hangout, title_open_hangout, latitude, longitude } =
					results?.object || {}
				setUserData({
					is_open_hangout,
					title_open_hangout,
					latitude,
					longitude,
				})
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoadingProfile(false)
		}
	}
	const handleUpdateUserInfo = async (otherData) => {
		toggleLoadingContext(true)
		try {
			const payload = {
				...userData,
				...otherData,
			}
			const res = (await updateUserProfile(payload)) as any
			await delay(500)
			const { code, results } = res || {}

			if (code === 200) {
				const { is_open_hangout, title_open_hangout, latitude, longitude } =
					results?.object || {}
				setUserData({
					is_open_hangout,
					title_open_hangout,
					latitude,
					longitude,
				})
			}
		} catch (error) {
			openError(error)
		} finally {
			toggleLoadingContext()
		}
	}
	const handleOnChangeTitleHangout = async (values) => {
		setUserData((pre) => ({ ...pre, title_open_hangout: values }))
		setModal(null)
		try {
			await handleUpdateUserInfo({ title_open_hangout: values })
		} catch (error) {
			openError(error)
		}
	}
	const handleCRUDSuccess = ({ key, value }) => {
		switch (key) {
			case 'create':
				setListMyEvent((prev) => [value, ...prev])
				setTotalMyEvent((prev) => prev + 1)
				break
			default:
				break
		}
	}
	const handleGetMyEvent = async (isNoLoading?: boolean) => {
		if (!isNoLoading) {
			setLoadingMyEvent(true)
		}
		try {
			const { page, limit } = _paginationRefs.current
			let isNew = false
			if (!isNoLoading && page === 1) {
				setListMyEvent([])
				isNew = true
			}
			const res: any = await getmyEventInHome({
				fields: ['$all', { user: ['name', 'phone', 'avatar', 'is_verified'] }],
				page: isNoLoading ? 1 : page,
				limit: isNoLoading ? 20 : limit,
			})
			const { code, results, pagination } = res || {}
			if (!isNoLoading) {
				await delay(1000)
			}

			if (code === 200) {
				const { rows: _rows } = results?.objects || {}
				if (!isNoLoading && _rows.length < limit) {
					_loadmore.current = false
				}
				setTotalMyEvent(pagination?.total || 0)
				setListMyEvent((prev: any[]) => {
					const contents = isNew ? [] : prev
					const mappingRow = _rows.map((i) => {
						return {
							...i,
						}
					})
					const newData = isNoLoading
						? uniqueArray([...mappingRow, ...contents], 'id')
						: uniqueArray([...contents, ...mappingRow], 'id') || []
					return newData
				})
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoadingMyEvent(false)
		}
	}

	const handleLoadMore = async () => {
		if (!_loadmore.current || loadingMyEvent) return
		const { limit } = _paginationRefs.current
		const currentPage = Math.ceil((listMyEvent || []).length / limit)
		_paginationRefs.current.page = currentPage + 1
		await handleGetMyEvent()
	}
	const handleScroll = (e: any) => {
		const clientWidth = e.target.clientWidth
		const scrollWidth = e.target.scrollWidth
		const scrollLeft = Math.abs(e.target.scrollLeft)
		const isReachedEnd = scrollLeft + clientWidth >= scrollWidth - 50
		if (!isReachedEnd) return

		handleLoadMore()
	}
	const handleGetOpenHangout = async () => {
		try {
			const res: any = await getUserOpenHangout({
				fields: ['$all'],
				radius: 50,
			})
			if (res) {
				const { pagination, results } = res || {}
				const { rows } = results?.objects || {}
				const { total } = pagination || {}
				setHangoutPeople([getUserInfo(), ...rows])
				setTotalHangout(total || 0)
			}
		} catch (error) {
			openError(error)
		}
	}
	useEffect(() => {
		handleGetUserProfile()
		handleGetMyEvent()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	useEffect(() => {
		if (userData.is_open_hangout) {
			handleGetOpenHangout()
		} else {
			setHangoutPeople([getUserInfo()])
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userData.is_open_hangout])
	return {
		_childRef,
		userData,
		modal,
		loadingProfile,
		loadingMyEvent,
		listMyEvent,
		totalMyEvent,
		totalHangout,
		hangoutPeople,
		setModal,
		OnChangeTitleHangout: handleOnChangeTitleHangout,
		onUpdateUserInfo: handleUpdateUserInfo,
		onCRUDSuccess: handleCRUDSuccess,
		onScroll: handleScroll,
	}
}
