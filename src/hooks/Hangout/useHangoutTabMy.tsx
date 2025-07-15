'use client'

import {
	useCallback,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from 'react'

import { useModal } from '@/context/ModalContext'

import { getMyCurrentHangout, getMyPastHangout } from '@/apis/hangoutApi'

import { uniqueArray } from '@/ultis/array.ults'
import { cloneDeep, toJson } from '@/ultis/common.ults'

import { paginationCommon } from '@/Variable/common.variable'

import { PaginationType } from '@/interface/common/common.interface'
export default function useHangoutTabMy(ref) {
	const { openError } = useModal()
	const _paginationMyPast = useRef<PaginationType>(cloneDeep(paginationCommon))
	const _paginationMyCurrent = useRef<PaginationType>(
		cloneDeep(paginationCommon),
	)
	const [loading, setLoading] = useState({ past: false, current: false })
	const loadMore = useRef({ past: true, current: false })

	const [myPastHangout, setMyPastHangout] = useState([]) as any[]
	const [myCurrentHangout, setMyCurrentHangout] = useState([]) as any[]
	const TabsData = useMemo(
		() => [
			{
				label: 'Current hangouts',
				data: myCurrentHangout,
				id: 'current',
			},
			{
				label: 'Past hangouts',
				data: myPastHangout,
				id: 'past',
			},
		],
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[toJson(myCurrentHangout), toJson(myPastHangout)],
	)
	const handleGetMyPast = async () => {
		const { page, limit } = _paginationMyPast.current
		setLoading((prev) => ({ ...prev, past: true }))
		try {
			const isNew = page === 1

			const res: any = await getMyPastHangout({
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
				type: 'current',
				page,
				limit,
			})
			const { code, results } = res || {}
			if (code === 200) {
				const { rows } = results?.objects || {}
				if (rows.length < limit) {
					loadMore.current.past = false
				}
				setMyPastHangout((prev: any[]) => {
					const contents = isNew ? [] : prev
					const dataShow = uniqueArray([...contents, ...rows], 'id') as any[]

					return dataShow
				})
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoading((prev) => ({ ...prev, past: false }))
		}
	}
	const handleGetMyCurrent = async () => {
		const { page, limit } = _paginationMyCurrent.current
		setLoading((prev) => ({ ...prev, current: true }))
		try {
			const isNew = page === 1

			const res: any = await getMyCurrentHangout({
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
			})
			const { code, results } = res || {}
			if (code === 200) {
				const { rows } = results?.objects || {}
				if (rows.length < limit) {
					loadMore.current.current = false
				}
				setMyCurrentHangout((prev: any[]) => {
					const contents = isNew ? [] : prev
					const dataShow = uniqueArray([...contents, ...rows], 'id') as any[]

					return dataShow
				})
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoading((prev) => ({ ...prev, current: false }))
		}
	}
	const handleLoadMore = useCallback(() => {
		const { past, current } = loadMore.current || {}
		const isLoadMore = past || current
		if (!isLoadMore || loading.past || loading.past) return
		if (past) {
			_paginationMyPast.current.page += 1
			handleGetMyPast()
		}
		if (current) {
			_paginationMyCurrent.current.page += 1
			handleGetMyCurrent()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [toJson(myCurrentHangout), toJson(myPastHangout)])
	const handleLeave = (id) => {
		setMyPastHangout((prev: any[]) => (prev || []).filter((i) => i.id !== id))
		setMyCurrentHangout((prev: any[]) =>
			(prev || []).filter((i) => i.id !== id),
		)
	}
	useImperativeHandle(
		ref,
		() => ({
			onLoadMoreOpen: handleLoadMore,
			onLeave: handleLeave,
		}),
		[handleLoadMore],
	)

	useEffect(() => {
		handleGetMyPast()
		handleGetMyCurrent()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])
	return {
		loadMore: loadMore.current,
		TabsData,
		loading,
		onLoadMore: handleLoadMore,
	}
}
