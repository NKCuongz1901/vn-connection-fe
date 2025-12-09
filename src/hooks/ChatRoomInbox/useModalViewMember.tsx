import { useEffect, useRef, useState } from 'react'

import { useModal } from '@/context/ModalContext'

import { getMember, getMemberAroundMe } from '@/apis/conversationApis'
import { getFullAddressFromLatLng } from '@/apis/ggApis'

import { isArray, uniqueArray } from '@/ultis/array.ults'
import {
	cloneDeep,
	delay,
	getCurrentLocation,
	handleScrollCallback,
} from '@/ultis/common.ults'
import { getStorageCookie } from '@/ultis/storage.ults'
import { randomString } from '@/ultis/string.ults'

import { paginationCommon } from '@/Variable/common.variable'

import { PaginationType } from '@/interface/common/common.interface'
import { MemberProps } from '@/interface/Conversation/Conversation.interface'

type useModalViewMemberProps = {
	id: string
}
export default function useModalViewMember({ id }: useModalViewMemberProps) {
	const { openError } = useModal()
	const _paginationRefs = useRef<PaginationType>(cloneDeep(paginationCommon))
	const _loadmore = useRef<boolean>(true)
	const timoutRef = useRef<any>()
	const refInput = useRef<any>()

	const [memberAround, setMemberAround] = useState<MemberProps[]>([])
	const [memberAll, setMemberAll] = useState<MemberProps[]>([])
	const [loading, setLoading] = useState({ around: false, all: false })
	const [apiId, setApiId] = useState('')

	const [keyword, setKeyword] = useState('')
	const [local, setLocal] = useState({ address: '', lat: 0, long: 0 })
	const handleGetMemberAroundMe = async () => {
		setLoading((prev) => ({ ...prev, around: true }))
		try {
			const params = {
				id,
				fields: ['$all'],
				page: 1,
				limit: 10,
			}
			setMemberAround([])

			if (keyword) {
				const { lat, long } = local
				Object.assign(params, {
					name: keyword,
					lat,
					long,
				})
			}
			const res: any = keyword
				? await getMember(params)
				: await getMemberAroundMe(params)
			const { rows } = res?.results?.objects || {}
			await delay(500)
			setMemberAround(rows)
		} catch (error) {
			openError(error)
		} finally {
			setLoading((prev) => ({ ...prev, around: false }))
		}
	}
	const handleGetMember = async () => {
		setLoading((prev) => ({ ...prev, all: true }))
		try {
			const { page, limit } = _paginationRefs.current
			const isNew = page === 1
			const params = {
				id,
				fields: ['$all'],
				name: keyword,
				page,
				limit,
			}
			if (isNew) {
				setMemberAll([])
			}
			const res: any = await getMember(params)
			const { rows } = res?.results?.objects || {}
			await delay(500)
			_loadmore.current = isArray(rows, limit)
			setMemberAll((prev) => {
				const contents = isNew ? [] : prev
				const dataShow = uniqueArray(
					[...contents, ...rows],
					'id',
				) as MemberProps[]
				return dataShow
			})
			if (isNew) {
				setTimeout(() => {
					refInput.current?.focus?.()
				}, 100)
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoading((prev) => ({ ...prev, all: false }))
		}
	}
	const handleLoadMoreMember = async () => {
		if (!_loadmore.current || loading.all) return
		const { limit } = _paginationRefs.current
		const currentPage = Math.trunc((memberAll || []).length / limit)
		_paginationRefs.current.page = currentPage + 1
		await handleGetMember()
	}

	const handleScrollConv = (e: any) => {
		handleScrollCallback(e, handleLoadMoreMember)
	}
	const handleGetAddress = async (marker) => {
		try {
			const { latitude, longitude } = getStorageCookie('info')
			const res: any = await getFullAddressFromLatLng({
				lat: Number(marker?.lat || latitude) || null,
				lng: Number(marker?.lng || longitude) || null,
			})
			const { code, results } = res || {}
			if (code === 200) {
				const { formatted_address, geometry } =
					results?.object?.results?.[0] || {}
				setLocal({
					address: formatted_address,
					lat: geometry?.location?.lat || marker?.lat,
					long: geometry?.location?.lng || marker?.lng,
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
			res = await handleGetAddress(res)
		} finally {
			return res
		}
	}
	const handleChangeKeyword = (e) => {
		if (timoutRef.current) {
			clearTimeout(timoutRef.current)
		}
		setKeyword(e.target.value)

		timoutRef.current = setTimeout(() => {
			setApiId(randomString())
		}, 1000)
	}
	useEffect(() => {
		handleGetLocation()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])
	useEffect(() => {
		handleGetMemberAroundMe()
		_paginationRefs.current.page = 1
		handleGetMember()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [apiId])

	return {
		refInput,
		loading,

		keyword,
		local,
		memberAround,
		memberAll,

		setKeyword,
		onChangeKeyword: handleChangeKeyword,
		onScroll: handleScrollConv,
	}
}
