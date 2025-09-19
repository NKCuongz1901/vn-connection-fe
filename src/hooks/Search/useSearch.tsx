import dayjs from 'dayjs'
import { useEffect, useMemo, useState } from 'react'

import { useLoading } from '@/context/LoadingContext'
import { useModal } from '@/context/ModalContext'

import { createPost, editPost, getListPost } from '@/apis/postApis'
import { handleUploadImage } from '@/apis/uploadApis'

import { isArray } from '@/ultis/array.ults'
import { cloneDeep } from '@/ultis/common.ults'
import { handleParseFileImg } from '@/ultis/file.utls'
import { useLocalePath, useQuery } from '@/ultis/route.ults'
import {
	convertStringToNumber,
	formatNumberString,
	randomString,
} from '@/ultis/string.ults'

import { mainRoutes } from '@/routes/MainRoutes'
import {
	repeatOpt,
	ticketEntranceType,
	ticketEntranceTypeOpt,
} from '@/Variable/select.variable'
import { getInappEvent, getInappLocal } from '@/apis/searchApis'
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
	const { t, longitude, latitude } = onGetQuerry()
	const [location, setLocation] = useState({
		address: '',
		longitude: 0,
		latitude: 0,
	})

	const [user, setUser] = useState<LocalProps[]>([])
	const [event, setEvent] = useState<any[]>([])

	const [loading, setLoading] = useState({ user: false })
	const [total, setTotal] = useState({ user: 0, event: 0 })
	const [apiId, setApiId] = useState<string>('')

	const [type, setType] = useState(searchType[t] || '')

	const handleChangeValue = (key) => (_value) => {
		switch (key) {
			case 'location':
				setLocation({
					address: _value.display_name,
					longitude: _value.lng,
					latitude: _value.lat,
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
			const { latitude, longitude } = location
			const res: LocalResProps = (await getInappLocal({
				fields: ['$all'],
				...(latitude && longitude && { latitude, longitude }),
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
			const { latitude, longitude } = location
			const res: any = (await getInappEvent({
				fields: ['$all'],
				...(latitude && longitude && { latitude, longitude }),
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

	useEffect(() => {
		handleGetInAppLocal()
		handleGetUpcommingEvent()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [apiId])

	useEffect(() => {
		setType(searchType[t] || '')
	}, [t])

	return {
		loading,
		user,
		event,
		total,
		location,
		type,
		data: {
			longitude,
			latitude,
		},
		setType,
		onChangeValue: handleChangeValue,
	}
}
