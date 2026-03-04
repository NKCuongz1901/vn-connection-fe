import { useEffect, useState } from 'react'

import { getInappClub, getInappEvent, getInappLocal } from '@/apis/searchApis'
import { getFullAddressFromLatLng } from '@/apis/ggApis'

import { useModal } from '@/context/ModalContext'

import { useQuery } from '@/ultis/route.ults'
import { randomString } from '@/ultis/string.ults'
import { getCurrentLocation } from '@/ultis/common.ults'

import { NetworkItemProps } from '@/interface/Community/Community.interface'
import { LocalProps, LocalResProps } from '@/interface/Search/Search.interface'

interface useSearchProps {
	[key: string]: any
}

const searchType = {
	user: 'user',
	event: 'event',
}

export default function useSearch({}: useSearchProps) {
	const { openError } = useModal()
	const { onGetQuerry } = useQuery()
	const { t, longitude, latitude, address, type: typeSearch } = onGetQuerry()
	console.log(
		'🌸🌸🌸 TrieuNinhHan ~ :28 ~ useSearch ~  onGetQuerry():',
		onGetQuerry(),
	)
	const [location, setLocation] = useState({
		address: '',
		longitude: 0,
		latitude: 0,
		type: [],
	})

	const [user, setUser] = useState<LocalProps[]>([])
	const [event, setEvent] = useState<any[]>([])
	const [club, setClub] = useState<NetworkItemProps[]>([])

	const [loading, setLoading] = useState({ user: false })
	const [total, setTotal] = useState({ user: 0, event: 0, club: 0 })
	const [apiId, setApiId] = useState<string>('')

	const [type, setType] = useState(searchType[t] || '')

	const handleChangeValue = (key) => (_value) => {
		switch (key) {
			case 'location':
				setLocation({
					address: _value.display_name,
					longitude: _value.lng,
					latitude: _value.lat,
					type: _value.type,
				})
				break

			default:
				break
		}
		setApiId(randomString())
	}

	const handleGetInAppLocal = async () => {
		if (type) return
		setLoading((prev) => ({ ...prev, user: true }))
		let _total = 0
		try {
			const { latitude, longitude, address, type } = location
			console.log(
				'🌸🌸🌸 TrieuNinhHan ~ :66 ~ handleGetInAppLocal ~ location:',
				location,
			)
			const res: LocalResProps = (await getInappLocal({
				fields: ['$all'],
				...(latitude && longitude && { latitude, longitude }),
				...(address && { google_title: address }),
				type,
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
	}

	const handleGetUpcommingEvent = async () => {
		if (type) return
		setLoading((prev) => ({ ...prev, event: true }))
		let _total = 0
		try {
			const { latitude, longitude, address, type } = location
			const res: any = (await getInappEvent({
				fields: ['$all'],
				...(latitude && longitude && { latitude, longitude }),
				...(address && { google_title: address }),
				type,
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
	}

	const handleGetInAppClub = async () => {
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
	}
	const handleGetAddress = async (marker) => {
		try {
			const res: any = await getFullAddressFromLatLng({
				lat: Number(marker?.lat) || null,
				lng: Number(marker?.lng) || null,
			})
			const { code, results } = res || {}
			if (code === 200) {
				const { formatted_address, geometry } =
					results?.object?.results?.[0] || {}
				handleChangeValue('location')({
					display_name: formatted_address,
					lat: geometry?.location?.lat || marker?.lat,
					lng: geometry?.location?.lng || marker?.lng,
				})
			}
		} catch (error) {
			console.log('error:', error)
		}
	}

	const handleGetLocation = async () => {
		let res: any
		try {
			res = await getCurrentLocation()
			if (res) {
				res = await handleGetAddress(res)
			}
		} catch (error) {
			console.log(' error:', error)
		} finally {
			return res
		}
	}
	useEffect(() => {
		if (apiId) {
			handleGetInAppLocal()
			handleGetUpcommingEvent()
			handleGetInAppClub()
		} else {
			handleGetLocation()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [apiId])

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
		onChangeValue: handleChangeValue,
	}
}
