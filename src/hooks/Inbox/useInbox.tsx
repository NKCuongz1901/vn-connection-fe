import { useCallback, useEffect, useRef, useState } from 'react'

import { useModal } from '@/context/ModalContext'
import { useSocket } from '@/context/SocketContext'

import { getConvPersonal, getConvStranger } from '@/apis/conversationApis'

import { isArray, uniqueArray } from '@/ultis/array.ults'
import { cloneDeep, toJson } from '@/ultis/common.ults'
import { useQuery } from '@/ultis/route.ults'
import { randomString } from '@/ultis/string.ults'

import { paginationCommon } from '@/Variable/common.variable'

import { PaginationType } from '@/interface/common/common.interface'

export default function useInbox() {
	const { openError } = useModal()
	const { socket } = useSocket()
	const { onGetQuerry } = useQuery()

	const { id } = onGetQuerry()
	const key = useRef<string>(randomString())

	const _paginationStranger = useRef<PaginationType>(
		cloneDeep(paginationCommon),
	)
	const _paginationPersonal = useRef<PaginationType>(
		cloneDeep(paginationCommon),
	)
	const loadMore = useRef({ stranger: true, personal: true })
	const [loadingConv, setLoadingConv] = useState({
		stranger: false,
		personal: false,
	})

	const [listConvStranger, setListConvStranger] = useState<any[]>([])
	const [listConvPersonal, setListConvPersonal] = useState<any[]>([])

	const [convId, setConvId] = useState(id || '')

	const [enable, setEnable] = useState(true)
	const [show, setShow] = useState(false)

	const handleGetConvStranger = async () => {
		setLoadingConv((prev) => ({ ...prev, stranger: true }))
		const { page, limit } = _paginationStranger.current
		try {
			const isNew = page === 1

			const res: any = await getConvStranger({
				fields: ['$all'],
				page,
				limit,
			})
			const { rows } = res?.results?.objects || {}
			if (!isArray(rows, limit)) {
				loadMore.current.stranger = false
			}
			if (isArray(rows)) {
				setListConvStranger((prev: any[]) => {
					const contents = isNew ? [] : prev
					const dataShow = uniqueArray([...contents, ...rows], 'id') as any[]

					return dataShow
				})
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoadingConv((prev) => ({ ...prev, stranger: false }))
		}
	}
	const handleGetConvPersonal = async () => {
		setLoadingConv((prev) => ({ ...prev, personal: true }))
		const { page, limit } = _paginationPersonal.current
		try {
			const isNew = page === 1

			const res: any = await getConvPersonal({
				fields: ['$all'],
				page,
				limit,
			})
			const { rows } = res?.results?.objects || {}
			if (!isArray(rows, limit)) {
				loadMore.current.personal = false
			}
			if (isArray(rows)) {
				setListConvPersonal((prev: any[]) => {
					const contents = isNew ? [] : prev
					const dataShow = uniqueArray([...contents, ...rows], 'id') as any[]

					return dataShow
				})
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoadingConv((prev) => ({ ...prev, personal: false }))
		}
	}

	const handleLoadMore = useCallback(() => {
		const { stranger, personal } = loadMore.current || {}
		const isLoadMore = stranger || personal
		if (!isLoadMore || loadingConv.stranger || loadingConv.personal) return
		if (stranger) {
			_paginationStranger.current.page += 1
			handleGetConvStranger()
		}
		if (personal) {
			_paginationPersonal.current.page += 1
			handleGetConvPersonal()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [toJson(loadingConv)])

	const handleScroll = (e: any) => {
		const clientHeight = e.target.clientHeight
		const scrollHeight = e.target.scrollHeight
		const scrollTop = Math.abs(e.target.scrollTop)
		const isReachedEnd = scrollTop + clientHeight >= scrollHeight - 50
		if (!isReachedEnd) return

		handleLoadMore()
	}

	const handleParseDataSocket = useCallback((data) => {
		try {
			const { conversation_id, created_at_unix_timestamp } = data || {}
			setListConvPersonal((prev: any[]) => {
				const newConv = prev.find((item) => item.id === conversation_id)
				if (newConv) {
					Object.assign(newConv, {
						last_message: data,
						last_time_chat: created_at_unix_timestamp,
					})
					const dataShow = uniqueArray([newConv, ...prev], 'id') as any[]
					return dataShow
				}
				return prev
			})
		} catch (error) {
			console.log('error:', error)
		}
	}, [])

	useEffect(() => {
		handleGetConvStranger()
		handleGetConvPersonal()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])
	useEffect(() => {
		key.current = randomString()
		setConvId(id)
	}, [id])

	useEffect(() => {
		if (!socket) return

		socket.on('message', handleParseDataSocket)

		return () => {
			socket.off('message', handleParseDataSocket)
		}
	}, [handleParseDataSocket, socket])

	return {
		key,
		listConvStranger,
		listConvPersonal,
		convId,
		enable,
		show,
		setShow,
		setEnable,
		setConvId,
		onScroll: handleScroll,
	}
}
