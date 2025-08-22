import { useEffect, useRef, useState } from 'react'

import { getNotificationList, readNotification } from '@/apis/notificationApis'

import { useModal } from '@/context/ModalContext'
import { PaginationType } from '@/interface/common/common.interface'
import { NotiItemProp } from '@/interface/Notification/Notification.interface'
import { isArray, uniqueArray } from '@/ultis/array.ults'
import { cloneDeep, delay, handleScrollCallback } from '@/ultis/common.ults'
import { useLocalePath } from '@/ultis/route.ults'

import { mainRoutes } from '@/routes/MainRoutes'

import {
	mappingOptionFriends,
	optionFriends,
	paginationCommon,
} from '@/Variable/common.variable'
import {
	mappingNotiTypes,
	NotiExtraDataType,
	NotiInteractingType,
} from '@/Variable/select.variable'

export default function useNotification({ onClose: _ }) {
	const { openError } = useModal()
	const { onChangeRoute } = useLocalePath()
	const _loadmore = useRef(true)
	const _paginationRefs = useRef<PaginationType>(cloneDeep(paginationCommon))

	const [type, setType] = useState(mappingNotiTypes.ALL)
	const [modal, setModal] = useState({ type: '', data: null }) as any

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
		console.log('🏖️🏖️🏖️ TrieuNinhHan ~ :94 ~ handleClickNoti ~ item:', item)
		const { id, is_read, interacting_type, extra_data } = item || {}
		const { type, post_id } = extra_data || {}
		switch (interacting_type) {
			case mappingNotiTypes.PUSH_BY_ADMIN:
				setModal({ type: 'detail', data: item })
				break
			case NotiInteractingType.ADD_FRIEND:
				onChangeRoute(
					`${mainRoutes.friend}?tab=${
						mappingOptionFriends[optionFriends[1].value]
					}`,
				)
				break
			case NotiInteractingType.NEW_POST_CREATED:
			case NotiInteractingType.CREATE_DISCUSS_IN_CLUB:
				switch (type) {
					case NotiExtraDataType.DISCUSS_IN_TOPIC:
					case NotiExtraDataType.DISCUSS_IN_CLUB:
						onChangeRoute(`${mainRoutes.discussions}?id=${post_id}`)
						break
					default:
						break
				}
				break
			case NotiInteractingType.NEW_EVENT_CREATE_NEAR_BY_USER:
				switch (type) {
					case NotiExtraDataType.EVENT:
						onChangeRoute(`${mainRoutes.upcomingEvent}/${post_id}`)
						break
					default:
						break
				}
				break
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
		modal,
		setModal,
		setType,
		onClickNoti: handleClickNoti,
		onScroll: handleScroll,
	}
}
