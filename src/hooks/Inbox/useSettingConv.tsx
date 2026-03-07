import { useEffect, useRef, useState } from 'react'

import { useLoading } from '@/context/LoadingContext'
import { useModal } from '@/context/ModalContext'

import {
	deleteConvById,
	getConvMediasById,
	leaveConvById,
	updateConvMember,
} from '@/apis/conversationApis'

import { uniqueArray } from '@/ultis/array'
import { cloneDeep, delay } from '@/ultis/common'
import { onPushState } from '@/ultis/route'
import { getUserInfo } from '@/ultis/storage'
import { randomString } from '@/ultis/string'

import { paginationCommon } from '@/Variable/common.variable'
import { PaginationType } from '@/interface/common/common.interface'

type useSettingConvProps = {
	convInfo: any
	members: any
	onAction?: any
	[key: string]: any
}

export default function useSettingConv({
	convInfo,
	members,
	onAction,
}: useSettingConvProps) {
	const { toggleLoadingContext } = useLoading()
	const { openError, openConfirm, closeModal } = useModal()

	const [modal, setModal] = useState({ type: '', data: null }) as any
	const _paginationRefs = useRef<PaginationType>(cloneDeep(paginationCommon))
	const _loadmore = useRef<boolean>(true)
	const [openMedia, setOpenMedia] = useState(false)
	const [medias, setMedias] = useState<any[]>([])

	const [loading, setLoading] = useState<{ [key: string]: any }>({})

	const handleUpdateConvMem = async () => {
		setLoading((prev) => ({ ...prev, updateConvMem: true }))
		const { id } = convInfo || {}
		const { id: memberId, is_accept_notification } =
			(members || []).find((item) => item.user_id === getUserInfo()?.id) || {}
		try {
			const res: any = await updateConvMember({
				id,
				memberId,
				payload: { is_accept_notification: !is_accept_notification },
			})
			if (res) {
				onAction({ key: 'noti' })
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoading((prev) => ({ ...prev, updateConvMem: false }))
		}
	}
	const handleGetMedia = async () => {
		const { id } = convInfo || {}
		setLoading((prev) => ({ ...prev, medias: true }))
		try {
			const { page, limit } = _paginationRefs.current

			let isNew = false
			if (page === 1) {
				setMedias([])
				isNew = true
			}
			const res: any = await getConvMediasById({
				id,
				params: {
					page,
					limit,
				},
			})
			const { code, results } = res || {}
			await delay(1000)

			if (code === 200) {
				const { rows: _rows } = results?.objects || {}
				if (_rows.length < limit) {
					_loadmore.current = false
				}
				setMedias((prev: any[]) => {
					const contents = isNew ? [] : prev
					const resData = (_rows || []).flatMap((item) =>
						(item?.medias || []).filter((i) =>
							['IMAGE', 'VIDEO'].includes(i.type),
						),
					)
					const newData = uniqueArray([...contents, ...resData], 'url') || []
					return newData
				})
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoading((prev) => ({ ...prev, medias: false }))
		}
	}
	const handleDeleteConv = async (id) => {
		toggleLoadingContext(true)
		try {
			const res: any = await deleteConvById({ id })
			await delay(500)
			if (res?.code === 200) {
				onPushState({ force_id: randomString() })
				closeModal()
			}
		} catch (error) {
			openError(error)
		} finally {
			toggleLoadingContext()
		}
	}
	const handleConfirmDelete = () => {
		const { id } = convInfo || {}

		openConfirm({
			message: 'Are you sure want to remove this conversation?',
			titleLabel: 'Delete this conversation',
			onAccept: () => handleDeleteConv(id),
			ctype: 'error',
		})
	}
	const handleLeaveConv = async (id) => {
		toggleLoadingContext(true)
		try {
			const res: any = await leaveConvById({ id })
			await delay(500)
			if (res?.code === 200) {
				onPushState({ force_id: randomString() })
				onAction({ key: 'leave', value: id })
				closeModal()
			}
		} catch (error) {
			openError(error)
		} finally {
			toggleLoadingContext()
		}
	}
	const handleConfirmLeave = () => {
		const { id } = convInfo || {}

		openConfirm({
			message: 'Are you sure want to leave this chatroom?',
			titleLabel: 'Leave this chatroom',
			onAccept: () => handleLeaveConv(id),
			ctype: 'error',
		})
	}
	const handleLoadMore = async () => {
		if (!_loadmore.current || !!loading.medias) return
		_paginationRefs.current.page += 1
		await handleGetMedia()
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
		if (openMedia) {
			_paginationRefs.current.page = 1
			handleGetMedia()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [openMedia])
	return {
		loading,
		modal,
		setModal,
		openMedia,
		medias,
		_loadmore,
		setOpenMedia,
		onUpdateConvMem: handleUpdateConvMem,
		onScroll: handleScroll,
		onLoadMore: handleLoadMore,
		onConfirmDelete: handleConfirmDelete,
		onConfirmLeave: handleConfirmLeave,
	}
}
