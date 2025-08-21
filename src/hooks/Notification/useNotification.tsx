import { useEffect, useRef, useState } from 'react'

import { cloneDeep, delay, handleScrollCallback } from '@/ultis/common.ults'

import { getNotificationList, readNotification } from '@/apis/notificationApis'

import { useModal } from '@/context/ModalContext'
import { PaginationType } from '@/interface/common/common.interface'
import { NotiItemProp } from '@/interface/Notification/Notification.interface'
import { isArray, uniqueArray } from '@/ultis/array.ults'

import { paginationCommon } from '@/Variable/common.variable'
import { mappingNotiTypes } from '@/Variable/select.variable'

export default function useNotification() {
	const { openError } = useModal()
	const _loadmore = useRef(true)
	const _paginationRefs = useRef<PaginationType>(cloneDeep(paginationCommon))

	const [type, setType] = useState(mappingNotiTypes.ALL)

	const [notiList, setNotiList] = useState<any[]>([])

	const [loading, setLoading] = useState(false)

	const handleGetListNoti = async () => {
		setLoading(true)
		try {
			const { page, limit } = _paginationRefs.current
			const isNew = page === 1
			if (isNew) {
				setNotiList([])
			}
			const payload = {
				fields: ['$all'],
				page,
				limit,
			} as any
			switch (type) {
				case mappingNotiTypes.PUSH_BY_ADMIN:
					payload.where = { interacting_type: 'PUSH_BY_ADMIN' }
					break
				case mappingNotiTypes.PUSH_BY_PERSONAL:
					payload.where = { interacting_type: { $ne: 'PUSH_BY_ADMIN' } }
					break
				default:
					break
			}
			const res: any = await getNotificationList({ params: payload })
			await delay(500)
			const { code, results } = res || {}
			if (code === 200) {
				const { rows } = results?.objects || {}
				_loadmore.current = isArray(rows, limit)

				setNotiList((prev: any[]) => {
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
		if (!_loadmore.current || loading) return
		const { limit } = _paginationRefs.current
		const currentPage = Math.trunc((notiList || []).length / limit)
		_paginationRefs.current.page = currentPage + 1
		await handleGetListNoti()
	}

	const handleScroll = (e: any) => {
		handleScrollCallback(e, handleLoadMore)
	}
	const handleReadNoti = async (id: string) => {
		try {
			const res: any = await readNotification({ id })
			if (res) {
				setNotiList((prev) =>
					prev.map((item) =>
						item.id === id ? { ...item, is_read: true } : item,
					),
				)
			}
		} catch (error) {
			openError(error)
		}
	}
	const handleClickNoti = (item: NotiItemProp) => {
		const { id, is_read } = item || {}
		switch (type) {
			case '':
			default:
				break
		}
		if (!is_read) {
			handleReadNoti(id)
		}
	}
	useEffect(() => {
		_paginationRefs.current.page = 1
		handleGetListNoti()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [type])

	return {
		type,
		notiList,
		loading,
		setType,
		onClickNoti: handleClickNoti,
		onScroll: handleScroll,
	}
}
