import { useCallback, useEffect, useState } from 'react'

import { getInappClub, getInappEvent, getInappLocal } from '@/apis/searchApis'

import { useModal } from '@/context/ModalContext'
import { useSearchLocation } from '@/context/SearchLocationContext'

import { useLocalePath, useQuery } from '@/ultis/route'

import { NetworkItemProps } from '@/interface/Community/Community.interface'
import { LocalProps, LocalResProps } from '@/interface/Search/Search.interface'
import { mainRoutes } from '@/routes/MainRoutes'

interface useSearchProps {
	[key: string]: any
}

const searchType = {
	user: 'user',
	event: 'event',
}

export default function useSearch({}: useSearchProps) {
	const { openError } = useModal()
	const { location, isReady } = useSearchLocation()
	const { onGetQuerry } = useQuery()
	const { pathname } = useLocalePath()
	const { t, longitude, latitude, address, type: typeSearch } = onGetQuerry()

	const isSearchPage = pathname.includes(mainRoutes.search)

	const [user, setUser] = useState<LocalProps[]>([])
	const [event, setEvent] = useState<any[]>([])
	const [club, setClub] = useState<NetworkItemProps[]>([])

	const [loading, setLoading] = useState({ user: false, event: false, club: false })
	const [total, setTotal] = useState({ user: 0, event: 0, club: 0 })

	const [type, setType] = useState(searchType[t] || '')

	const handleGetInAppLocal = useCallback(async () => {
		if (type) return
		setLoading((prev) => ({ ...prev, user: true }))
		let _total = 0
		try {
			const { latitude, longitude, address, type: locationType } = location
			const res: LocalResProps = (await getInappLocal({
				fields: ['$all'],
				...(latitude && longitude && { latitude, longitude }),
				...(address && { google_title: address }),
				type: locationType,
				page: 1,
				limit: 20,
			})) as any
			const { results } = res || {}
			if (res) {
				setUser(results.objects.rows)
				_total = results.objects.count
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoading((prev) => ({ ...prev, user: false }))
			setTotal((prev) => ({ ...prev, user: _total }))
		}
	}, [type, location, openError])

	const handleGetUpcommingEvent = useCallback(async () => {
		if (type) return
		setLoading((prev) => ({ ...prev, event: true }))
		let _total = 0
		try {
			const { latitude, longitude, address, type: locationType } = location
			const res: any = (await getInappEvent({
				fields: ['$all'],
				...(latitude && longitude && { latitude, longitude }),
				...(address && { google_title: address }),
				type: locationType,
				page: 1,
				limit: 20,
			})) as any
			const { results } = res || {}
			if (res) {
				setEvent(results.objects.rows)
				_total = results.objects.count
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoading((prev) => ({ ...prev, event: false }))
			setTotal((prev) => ({ ...prev, event: _total }))
		}
	}, [type, location, openError])

	const handleGetInAppClub = useCallback(async () => {
		if (type) return
		setLoading((prev) => ({ ...prev, club: true }))
		let _total = 0
		try {
			const { latitude, longitude, address } = location
			const res: any = (await getInappClub({
				fields: ['$all'],
				...(latitude && longitude && { latitude, longitude }),
				...(address && { google_title: address }),
				page: 1,
				limit: 20,
			})) as any
			const { results } = res || {}
			if (res) {
				setClub(results.objects.rows)
				_total = results.objects.count
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoading((prev) => ({ ...prev, club: false }))
			setTotal((prev) => ({ ...prev, club: _total }))
		}
	}, [type, location, openError])

	useEffect(() => {
		if (!isSearchPage || !isReady || type) return
		handleGetInAppLocal()
		handleGetUpcommingEvent()
		handleGetInAppClub()
	}, [
		isSearchPage,
		isReady,
		type,
		location.address,
		location.latitude,
		location.longitude,
		handleGetInAppLocal,
		handleGetUpcommingEvent,
		handleGetInAppClub,
	])

	useEffect(() => {
		setType(searchType[t] || '')
	}, [t])

	return {
		loading,
		user,
		event,
		club,
		total,
		location,
		type,
		data: {
			longitude,
			latitude,
			address,
			type: typeSearch,
		},
		setType,
	}
}
