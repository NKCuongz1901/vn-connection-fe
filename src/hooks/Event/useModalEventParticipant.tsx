import { useEffect, useRef, useState } from 'react'

import { useModal } from '@/context/ModalContext'

import { addFriend, deleteFriend } from '@/apis/friendApis'
import { getListParticipant, getPublicListParticipant } from '@/apis/postApis'

import { uniqueArray } from '@/ultis/array'
import { cloneDeep, delay } from '@/ultis/common'

import { PaginationType } from '@/interface/common/common.interface'
import { paginationCommon } from '@/Variable/common.variable'
import { participantType } from '@/Variable/event.variable'

export default function useModalEventParticipant({
	id,
	isPublic,
}: {
	id: string
	isPublic?: boolean
}) {
	const { openError, openConfirm, closeModal } = useModal()
	const _paginationRefs = useRef<PaginationType>(cloneDeep(paginationCommon))
	const _parentRef = useRef<HTMLDivElement | null>(null)
	const _childRef = useRef<HTMLDivElement | null>(null)
	const [participantList, setParticipantList] = useState([]) as any[]
	const [total, setTotal] = useState(0)
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
			const res: any = await (isPublic
				? getPublicListParticipant(params)
				: getListParticipant(params))
			const { code, results } = res || {}
			await delay(1000)
			if (code === 200) {
				const { rows, count } = results?.objects || {}
				setTotal(count || 0)
				const totalPage = Math.ceil((count || 0) / (limit || 1))
				_paginationRefs.current.totalPage = totalPage
				setParticipantList((prev: any[]) => {
					const contents = isNew ? [] : prev
					const _rows = (rows || []).map((i) => {
						const { type } = i || {}
						return {
							...i,
							isAdmin: type === participantType.ADMIN,
							isOnwer: type === participantType.OWNER,
						}
					})
					const dataShow = uniqueArray([...contents, ..._rows], 'id') as any[]
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

	const handleAddFriend = async (item) => {
		const { user_id, id: itemId } = item
		try {
			const res: any = await addFriend({
				friend_id: user_id,
			})
			if (res) {
				const { object } = res?.results || {}
				setParticipantList((prev: any[]) =>
					prev.map((i) => (i.id === itemId ? { ...i, is_friend: object } : i)),
				)
			}
		} catch (error) {
			openError(error)
		}
	}

	const handleOpenModalRemoveFriend = (item) => {
		openConfirm({
			message: 'Are you sure want to delete friend ?',
			onAccept: () => {
				handleRemoveFriend(item)
				closeModal()
			},
		})
	}

	const handleRemoveFriend = async (item) => {
		const { is_friend, id: itemId } = item
		const { id: friend_id } = is_friend || {}
		try {
			const res: any = await deleteFriend({
				id: friend_id,
			})
			if (res) {
				setParticipantList((prev: any[]) =>
					prev.map((i) => (i.id === itemId ? { ...i, is_friend: null } : i)),
				)
			}
		} catch (error) {
			openError(error)
		}
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
		total,

		onScroll: handleScroll,
		setOpenModal,
		onAddFriend: handleAddFriend,
		onRemoveFriend: handleRemoveFriend,
		onOpenModalRemoveFriend: handleOpenModalRemoveFriend,
	}
}
