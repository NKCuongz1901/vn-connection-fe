import { useEffect, useRef, useState } from 'react'

import { useModal } from '@/context/ModalContext'

import { getListParticipant } from '@/apis/postApis'

import { uniqueArray } from '@/ultis/array.ults'
import { cloneDeep, delay } from '@/ultis/common.ults'

import { paginationCommon } from '@/Variable/common.variable'

import { PaginationType } from '@/interface/common/common.interface'

export default function useModalEventParticipant({ id }: any) {
	const { openError } = useModal()
	const _paginationRefs = useRef<PaginationType>(cloneDeep(paginationCommon))
	const _parentRef = useRef<HTMLDivElement | null>(null)
	const _childRef = useRef<HTMLDivElement | null>(null)
	const [participantList, setParticipantList] = useState([]) as any[]
	const [loading, setLoading] = useState(false)
	const [openModal, setOpenModal] = useState(false)
	const handleGetListParticipant = async () => {
		setLoading(true)
		try {
			const { page, limit } = _paginationRefs.current
			const isNew = page === 1
			if (isNew) {
				setParticipantList([])
			}
			const params = {
				fields: ['$all', { user: ['name', 'phone', 'avatar', 'is_verified'] }],
				where: { post_id: id },
				page,
				limit,
			}
			const res: any = await getListParticipant(params)
			const { code, results } = res || {}
			await delay(1000)
			if (code === 200) {
				const { rows, count } = results?.objects || {}
				const totalPage = Math.ceil((count || 0) / (limit || 1))
				_paginationRefs.current.totalPage = totalPage
				setParticipantList((prev: any[]) => {
					const contents = isNew ? [] : prev
					const dataShow = uniqueArray([...contents, ...rows], 'id') as any[]
					return dataShow
				})
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoading(false)
		}
	}

	const handleLoadMore = async () => {
		const isLoadMore =
			_paginationRefs.current.page < _paginationRefs.current.totalPage

		if (!isLoadMore || loading) return
		_paginationRefs.current.page += 1
		await handleGetListParticipant()
	}

	const handleAutoLoadMore = () => {
		if (_parentRef.current && _childRef.current) {
			if (_parentRef.current?.clientHeight > _childRef.current?.scrollHeight) {
				handleLoadMore()
			}
		}
	}

	const handleScroll = (e: any) => {
		const clientHeight = e.target.clientHeight
		const scrollHeight = e.target.scrollHeight
		const scrollTop = Math.abs(e.target.scrollTop)
		const isReachedEnd = scrollTop + clientHeight >= scrollHeight - 50
		if (!isReachedEnd) return

		handleLoadMore()
	}

	useEffect(() => {
		handleGetListParticipant()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])
	useEffect(() => {
		handleAutoLoadMore()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [JSON.stringify(participantList)])
	return {
		loading,
		_parentRef,
		_childRef,
		openModal,
		participantList,
		onScroll: handleScroll,
		setOpenModal,
	}
}
