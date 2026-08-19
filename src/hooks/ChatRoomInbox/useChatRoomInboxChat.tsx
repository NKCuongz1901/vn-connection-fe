import { useCallback, useEffect, useRef, useState } from 'react'

import { useModal } from '@/context/ModalContext'
import { useSocket } from '@/context/SocketContext'

import {
	adminDeleteMessage,
	deleteMessageById,
	getConvInfoById,
	getConvMembersById,
	getConvMessById,
	getMessageById,
	getPinMessageById,
	getReact,
	pinMessageById,
	reactMessageById,
	sendMessage,
	editMessageById,
} from '@/apis/conversationApis'
import { getConfigBootstrap } from '@/apis/userApis'
import {
	handleUploadAudio,
} from '@/apis/uploadApis'
import { buildChatMediasPayload } from '@/ultis/chatMedia'

import { mappingMessageChat, uniqueArray } from '@/ultis/array'
import { cloneDeep, delay } from '@/ultis/common'
import { isEmptyObject } from '@/ultis/object'
import { onPushState } from '@/ultis/route'
import { getUserInfo } from '@/ultis/storage'
import { generateCustomUuid, parseMentions, randomString } from '@/ultis/string'

import { PaginationType } from '@/interface/common/common.interface'
import { ReactionPtops } from '@/interface/Conversation/Conversation.interface'
import {
	AdminDeleteSelection,
	buildAdminDeleteMessageParams,
	ReportContentItem,
} from '@/Components/Modal/AdminDeleteMessageModal'
import {
	MAX_CHAT_MEDIAS,
	paginationCommon,
} from '@/Variable/common.variable'

type useHangoutChatProps = {
	convId: string
	onSuccess?: any
	onChangeModal?: any
	[key: string]: any
}
export default function useChatRoomInboxChat({
	convId,
	onSuccess = () => null,
	onChangeModal = () => null,
}: useHangoutChatProps) {
	const { openError } = useModal()
	const { socket } = useSocket()
	const _paginationRefs = useRef<PaginationType>(cloneDeep(paginationCommon))
	const _loadmore = useRef<boolean>(true)
	const _scrollRef = useRef<HTMLDivElement>(null)

	const [convInfo, setConvInfo] = useState<{ [key: string]: any }>({})
	const [members, setMember] = useState<any[]>([])
	const [messList, setMessList] = useState<any[]>([])
	const messListRef = useRef(messList)
	const [modal, setModal] = useState({ type: '', data: null }) as any
	const [openSetting, setOpenSetting] = useState(false)

	const [pinList, setPinList] = useState<any[]>([])
	const [totalPin, setTotalPin] = useState<number>(0)
	const [total, setTotal] = useState({ member: 0 })

	const [loading, setLoading] = useState(false)
	const [loadingPage, setLoadingPage] = useState(false)
	const [loadingConvInfo, setLoadingConvInfo] = useState(false)
	const [loadingEnsureMessage, setLoadingEnsureMessage] = useState(false)

	const reactList = useRef<{ [key: string]: ReactionPtops }>({})
	const [editingMessage, setEditingMessage] = useState<any>(null)
	const [adminDeleteTarget, setAdminDeleteTarget] = useState<any>(null)
	const [adminDeleteSelection, setAdminDeleteSelection] =
		useState<AdminDeleteSelection | null>(null)
	const [openAdminDeleteReason, setOpenAdminDeleteReason] = useState(false)
	const [reportContents, setReportContents] = useState<ReportContentItem[]>([])
	const [loadingReportContents, setLoadingReportContents] = useState(false)

	const handleStartEdit = (message: any) => {
		if (!['TEXT', 'MEDIAS'].includes(message?.type)) return
		setEditingMessage(message)
	}

	const handleCancelEdit = () => {
		setEditingMessage(null)
	}

	// const disableChat =
	const handleGetReact = async () => {
		try {
			const res: any = await getReact({ fields: ['$all'] })
			reactList.current = (res?.results?.objects?.rows || []).reduce(
				(obj, item) => {
					obj[item.id] = item
					return obj
				},
				{},
			)
		} catch (error) {
			openError(error)
		}
	}
	const handleGetListMessById = async (isNoLoading?: boolean) => {
		if (!isNoLoading) {
			setLoading(true)
		}
		try {
			const { page, limit } = _paginationRefs.current
			let isNew = false
			if (!isNoLoading && page === 1) {
				setMessList([])
				isNew = true
			}
			const res: any = await getConvMessById({
				id: convId,
				page: isNoLoading ? 1 : page,
				limit: isNoLoading ? 20 : limit,
			})
			const { code, results } = res || {}
			if (!isNoLoading) {
				await delay(1000)
			}

			if (code === 200) {
				const { rows: _rows } = results?.objects || {}
				if (!isNoLoading && _rows.length < limit) {
					_loadmore.current = false
				}
				setMessList((prev: any[]) => {
					const contents = isNew ? [] : prev
					const mappingRow = _rows.map((i) => {
						const { type, sender } = i || {}
						const { name } = sender || {}
						let { content, content_en } = i || {}
						switch (type) {
							case 'MEMBER_JOIN':
								content = content.replace('$name', name)
								content_en = content_en.replace('$name', name)
								break
							default:
								break
						}
						return {
							...i,
							user_id: i?.sender_id,
							user: i?.sender,
							content,
							content_en,
							parent: {
								...i?.parent,
								user_id: i?.parent?.sender_id,
								user: i?.parent?.sender,
							},
						}
					})
					const newData = isNoLoading
						? uniqueArray([...mappingRow, ...contents], 'id')
						: uniqueArray([...contents, ...mappingRow], 'id') || []
					const dataShow = mappingMessageChat(newData)
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
		const currentPage = Math.trunc((messList || []).length / limit)
		_paginationRefs.current.page = currentPage + 1
		await handleGetListMessById()
	}

	const handleEnsureMessageLoaded = async (targetId: string) => {
		if (!targetId || loadingEnsureMessage) return false

		const hasTarget = () =>
			(messListRef.current || []).some((item: any) => item?.id === targetId)

		if (hasTarget()) return true

		setLoadingEnsureMessage(true)
		try {
			const targetMessage: any = await handleGetMessageById(targetId)
			if (!targetMessage) return false
			if (targetMessage?.conversation_id !== convId) return false

			const targetTs = Number(targetMessage?.created_at_unix_timestamp || 0)
			if (!targetTs) return false

			const limit = _paginationRefs.current.limit || 20

			const firstRes: any = await getConvMessById({
				id: convId,
				page: 1,
				limit,
			})
			const total = Number(
				firstRes?.pagination?.total || firstRes?.results?.objects?.count || 0,
			)
			if (!total) return false

			const totalPages = Math.max(1, Math.ceil(total / limit))

			const inRange = (rows: any[]) => {
				if (!rows?.length) return false
				const tsList = rows
					.map((r) => Number(r?.created_at_unix_timestamp || 0))
					.filter(Boolean)
				if (!tsList.length) return false

				const maxTs = tsList[0]
				const minTs = tsList[tsList.length - 1]
				return targetTs <= maxTs && targetTs >= minTs
			}

			let left = 1
			let right = totalPages
			let foundPage = -1
			let safe = 0

			while (left <= right && safe < 40) {
				safe += 1
				const mid = Math.floor((left + right) / 2)

				const res: any = await getConvMessById({
					id: convId,
					page: mid,
					limit,
				})
				const rows = res?.results?.objects?.rows || []
				if (!rows.length) break

				if (inRange(rows)) {
					foundPage = mid
					break
				}

				const newestTs = Number(rows[0]?.created_at_unix_timestamp || 0)
				const oldestTs = Number(
					rows[rows.length - 1]?.created_at_unix_timestamp || 0,
				)

				if (targetTs > newestTs) {
					right = mid - 1
				} else if (targetTs < oldestTs) {
					left = mid + 1
				} else {
					foundPage = mid
					break
				}
			}

			if (foundPage < 1) {
				foundPage = Math.min(Math.max(left, 1), totalPages)
			}

			_paginationRefs.current.page = foundPage
			_loadmore.current = foundPage < totalPages
			await handleGetListMessById()

			let extra = 0
			const maxExtra = 6
			while (!hasTarget() && _loadmore.current && extra < maxExtra) {
				extra += 1
				_paginationRefs.current.page += 1
				await handleGetListMessById()
			}

			return hasTarget()
		} catch (error) {
			openError(error)
			return false
		} finally {
			setLoadingEnsureMessage(false)
		}
	}

	const handleSendMessage = async ({
		type: _type,
		content,
		medias: _medias,
		parent,
		audio,
	}: {
		type: string
		content?: string
		medias?: any[]
		parent?: any
		audio?: any
	}) => {
		try {
			let type = _type
			let medias: any[] = []
			if (_medias?.length > 0) {
				medias = await buildChatMediasPayload(_medias)
				if (medias.length > 0) {
					type = 'MEDIAS'
				}
			}
			if (!!audio) {
				const resAudio = await handleUploadAudio(audio)
				type = 'MEDIAS'
				medias.push({
					url: resAudio,
					fileName: null,
					width: null,
					height: null,
					ratio: null,
					type: 'AUDIO',
					thumbnail: null,
					duration: 3,
				})
			}
			const parent_id = parent?.id
			const _id = randomString()
			const message_local_id = generateCustomUuid()
			const message = {
				type,
				message_local_id,
				...(parent_id && { parent_id }),
				...(medias.length > 0 && { medias }),
			} as {
				[key: string]: any
			}
			const { text, mentions } =
				type !== 'MEDIAS'
					? parseMentions(content)
					: { text: content, mentions: [] }

			switch (type) {
				default:
					message.content = text
					break
			}
			const _res = {
				content: text,
				mentions,
				type,
				user_id: getUserInfo('id'),
				message_local_id,
				id: _id,
				_id,
				isTemp: true,
				...(parent && { parent }),
			}
			setMessList((prev: any[]) => {
				const contents = prev
				const newData = [_res, ...contents]
				const dataShow = mappingMessageChat(newData)

				return dataShow
			})
			if (_scrollRef.current) {
				_scrollRef.current.scrollTop = _scrollRef.current.scrollHeight
			}
			const res: any = await sendMessage({
				conversation_id: convId,
				message: message,
				mentions,
			})
			const _data = res?.results?.object || {}
			setMessList((prev: any[]) => {
				const contents = prev
				const newMess = {
					user_id: _data.sender_id,
					user: _data?.sender,
					..._data,
					message_local_id,
					...(parent && { parent }),
				}
				const idx = (contents || []).findIndex(
					(i) => i.message_local_id === message_local_id,
				)
				if (idx > -1) {
					contents[idx] = newMess
				} else {
					contents.unshift(newMess)
				}

				const dataShow = mappingMessageChat(contents)

				return dataShow
			})
		} catch (error) {
			openError(error)
		}
	}

	const handleGetInfoConv = async () => {
		setLoadingConvInfo(true)
		try {
			const res: any = await getConvInfoById({
				id: convId,
				fields: ['$all'],
			})
			const { join, amount_of_user } = res?.results?.object || {}
			const { amount_of_remind } = join || {}
			if (!amount_of_remind || amount_of_remind < 2) {
				onChangeModal({ type: 'noti' })
			}
			setConvInfo(res?.results?.object)
			setTotal((prev) => ({ ...prev, member: amount_of_user }))
		} catch (error) {
			openError(error)
			onPushState({})
		} finally {
			setLoadingConvInfo(false)
		}
	}

	const handleGetMembersConv = async (isNoLoading = false) => {
		if (!isNoLoading) setLoadingPage(true)
		try {
			const res: any = await getConvMembersById({
				id: convId,
				fields: ['$all'],
				page: 1,
				limit: 50,
			})
			const { rows } = res?.results?.objects || {}
			setMember(rows)
		} catch (error) {
			openError(error)
		} finally {
			setLoadingPage(false)
		}
	}
	const handleDeleteMessage = async (value) => {
		const { id } = value || {}
		try {
			setMessList((prev) =>
				prev.map((i) => (i.id === id ? { ...i, isTemp: true } : i)),
			)
			const res: any = await deleteMessageById({ id })
			if (res?.results?.object) {
				if (pinList.some((item) => item.id === id)) {
					handleGetPinMessage()
				}
				setMessList((prev) => {
					const _data = prev.filter((i) => i.id !== id)
					return mappingMessageChat(_data)
				})
			}
		} catch (error) {
			openError(error)
			setMessList((prev) =>
				prev.map((i) => (i.id === id ? { ...i, isTemp: false } : i)),
			)
		} finally {
		}
	}

	const closeAdminDeleteFlow = () => {
		setAdminDeleteTarget(null)
		setAdminDeleteSelection(null)
		setOpenAdminDeleteReason(false)
	}

	const handleLoadReportContents = async () => {
		if (reportContents.length) return
		setLoadingReportContents(true)
		try {
			const res: any = await getConfigBootstrap()
			setReportContents(res?.results?.object?.report_contents ?? [])
		} catch (error) {
			openError(error)
		} finally {
			setLoadingReportContents(false)
		}
	}

	const handleAdminDeleteMessage = async (
		message: any,
		selection: AdminDeleteSelection,
		reason?: { title?: string; content?: string },
	) => {
		const { id, user_id } = message || {}
		if (!id) return

		try {
			setMessList((prev) =>
				prev.map((i) => (i.id === id ? { ...i, isTemp: true } : i)),
			)

			const res: any = await adminDeleteMessage(
				buildAdminDeleteMessageParams({ id, selection, reason }),
			)

			if (res?.results?.object) {
				if (pinList.some((item) => item.id === id)) {
					handleGetPinMessage()
				}

				if (selection.isDeleteAllFromUser) {
					setMessList((prev) => {
						const _data = prev.filter((i) => i.user_id !== user_id)
						return mappingMessageChat(_data)
					})
				} else {
					setMessList((prev) => {
						const _data = prev.filter((i) => i.id !== id)
						return mappingMessageChat(_data)
					})
				}
			}
		} catch (error) {
			openError(error)
			setMessList((prev) =>
				prev.map((i) => (i.id === id ? { ...i, isTemp: false } : i)),
			)
		} finally {
			closeAdminDeleteFlow()
		}
	}

	const handleAdminDeleteConfirm = async (selection: AdminDeleteSelection) => {
		if (!adminDeleteTarget) return
		setAdminDeleteSelection(selection)

		if (selection.isReportSpam) {
			await handleLoadReportContents()
			setOpenAdminDeleteReason(true)
			return
		}

		handleAdminDeleteMessage(adminDeleteTarget, selection)
	}

	const handleAdminDeleteReasonConfirm = (reason: {
		title: string
		content: string
	}) => {
		if (!adminDeleteTarget || !adminDeleteSelection) return
		handleAdminDeleteMessage(adminDeleteTarget, adminDeleteSelection, reason)
	}

	const handleCloseAdminDeleteReason = () => {
		setOpenAdminDeleteReason(false)
	}

	const handleEditMessage = async ({
		message,
		content,
		medias: _medias = [],
	}: {
		message: any
		content?: string
		medias?: any[]
	}) => {
		if (!message?.id) return
		try {
			const medias = await buildChatMediasPayload(
				(_medias || []).slice(0, MAX_CHAT_MEDIAS),
			)
			const type = medias.length > 0 ? 'MEDIAS' : 'TEXT'
			const { text, mentions } =
				type !== 'MEDIAS'
					? parseMentions(content)
					: { text: content || '', mentions: [] }

			const payload = {
				conversation_id: convId,
				message: {
					type,
					content: text,
					message_local_id: message.message_local_id,
					medias,
				},
				mentions,
			}

			setMessList((prev: any[]) =>
				mappingMessageChat(
					prev.map((m) =>
						m.id === message.id
							? { ...m, content: text, type, medias, isTemp: true }
							: m,
					),
				),
			)

			const res: any = await editMessageById({
				id: message.id,
				payload,
			})

			const _data = res?.results?.object || {}

			setMessList((prev: any[]) =>
				mappingMessageChat(
					prev.map((m) =>
						m.id === message.id ? { ...m, ..._data, isTemp: false } : m,
					),
				),
			)
			setEditingMessage(null)
		} catch (error) {
			openError(error)
			setMessList((prev: any[]) =>
				mappingMessageChat(
					prev.map((m) =>
						m.id === message.id ? { ...m, isTemp: false } : m,
					),
				),
			)
		}
	}

	const handlePinMessage = async ({ key, value }) => {
		const { id } = value || {}
		try {
			const res: any = await pinMessageById({
				id: id,
				payload: {
					type_pin: key,
				},
			})
			const { code, results } = res || {}
			if (code === 200) {
				setMessList((prev) =>
					prev.map((i) =>
						i.id === id
							? { ...i, pin_message_at: !!results?.object?.pin_message_at }
							: i,
					),
				)
				handleGetListMessById(true)
				handleGetPinMessage()
			}
		} catch (error) {
			openError(error)
		}
	}
	const handleActionMessage = async ({ key, value }) => {
		switch (key) {
			case 'edit':
				handleStartEdit(value)
				break
			case 'delete':
				handleDeleteMessage(value)
				break
			case 'admin_delete':
				setAdminDeleteTarget(value)
				setAdminDeleteSelection(null)
				setOpenAdminDeleteReason(false)
				break
			case 'pin':
			case 'unpin':
				handlePinMessage({ key, value })
				break
			default:
				break
		}
	}
	const handleGetPinMessage = async () => {
		try {
			const res: any = await getPinMessageById({
				id: convId,
				params: {
					page: 1,
					limit: 20,
				},
			})
			if (res) {
				const { rows, count } = res?.results?.objects || {}
				setPinList(rows)
				setTotalPin(count || 0)
			}
		} catch (error) {
			openError(error)
		}
	}
	const handleActionSettingConv = ({ key, value: _value }) => {
		switch (key) {
			case 'noti':
				setConvInfo((prev) => ({ ...prev, join: _value }))
				break
			case 'back':
				setOpenSetting(false)
				break
			case 'leave':
				onSuccess({ type: key, id: _value })
				break
			default:
				break
		}
	}

	const handleGetMessageById = useCallback(async (id: string) => {
		try {
			const res: any = await getMessageById({ id, fields: ['$all'] })
			return res?.results?.object
		} catch {}
	}, [])

	const handleParseDataSocket = useCallback(
		async (data) => {
			try {
				const { conversation_id, type, sender, parent_id, message_local_id } =
					data || {}
				let { content, content_en } = data || {}
				if (conversation_id !== convId) return
				let { parent: _parent, ...parent } =
					messListRef.current.find((i) => i.id === parent_id) || {}
				if (parent_id && isEmptyObject(parent)) {
					parent = await handleGetMessageById(parent_id)
				}
				setMessList((prev: any[]) => {
					const contents = prev
					switch (type) {
						case 'MEMBER_JOIN':
							const { name } = sender || {}
							content = content.replace('$name', name)
							content_en = content_en.replace('$name', name)
							break
						default:
							break
					}
					const newMess = {
						user_id: data.sender_id,
						user: data?.sender,
						...data,
						...(parent && { parent }),
						content,
						content_en,
					}
					const idx = (contents || []).findIndex(
						(i) => i.message_local_id === message_local_id,
					)
					if (idx > -1) {
						contents[idx] = newMess
					} else {
						contents.unshift(newMess)
					}

					const dataShow = mappingMessageChat(contents)

					return dataShow
				})
			} catch (error) {
				console.log('error:', error)
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[convId],
	)
	const handleDeleteMessageAll = useCallback(
		(data: any) => {
			const { user_id } = data || {}
			if (!user_id) return

			setMessList((prev) => {
				const filtered = prev.filter((i) => i.user_id !== user_id)
				return mappingMessageChat(filtered)
			})
		},
		[],
	)

	const handleParseDataSocketReact = useCallback((data) => {
		setMessList((prev) => {
			const _prev = cloneDeep(prev)
			const { message_id, user_id, id, reaction_id } = data || {}
			const findItem = (_prev || []).find((i) => i.id === message_id)
			if (!!findItem) {
				let reactions = findItem?.reactions || []
				const type = reactions.find((i) => i.id === id) ? 'remove' : 'add'
				reactions = reactions.filter((i) => i?.user_id !== user_id)
				if (type === 'add') {
					reactions.push({
						id: id,
						user_id: user_id,
						reaction_id: reaction_id,
						created_at: +new Date(),
						reaction: reactList.current[reaction_id],
						user: {
							id: user_id,
						},
					})
				}
				findItem.reactions = reactions
			}
			return _prev
		})
		try {
		} catch (error) {
			console.log('error:', error)
		}
	}, [])
	const handleAddReact = async ({ item, react, type }) => {
		const { conversation_id, _id } = item || {}
		const { id: reaction_id } = react || {}
		try {
			const payload = {
				type_reaction: type || 'add',
				conversation_id,
				reaction_id,
			}
			await reactMessageById({ id: _id, payload })
		} catch (error) {
			openError(error)
		}
	}

	useEffect(() => {
		handleGetReact()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])
	useEffect(() => {
		setEditingMessage(null)
		_paginationRefs.current.page = 1
		handleGetInfoConv()
		handleGetListMessById()
		handleGetMembersConv()
		handleGetPinMessage()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [convId])

	useEffect(() => {
		if (!socket) return

		socket.on('message', handleParseDataSocket)
		socket.on('message_reaction', handleParseDataSocketReact)
		socket.on('delete_message_all', handleDeleteMessageAll)
		return () => {
			socket.off('message', handleParseDataSocket)
			socket.off('message_reaction', handleParseDataSocketReact)
			socket.off('delete_message_all', handleDeleteMessageAll)
		}
	}, [convId, handleParseDataSocket, handleParseDataSocketReact, handleDeleteMessageAll, socket])

	useEffect(() => {
		messListRef.current = messList
	}, [messList])

	return {
		_scrollRef,
		messList,
		pinList,
		members,
		total,
		convInfo,
		loadingPage,
		loading,
		loadingConvInfo,
		modal,
		totalPin,
		setModal,
		openSetting,
		setOpenSetting,
		setMessList,
		editingMessage,
		onSendMessage: handleSendMessage,
		onEditMessage: handleEditMessage,
		onCancelEdit: handleCancelEdit,
		onLoadMore: handleLoadMore,
		onActionMessage: handleActionMessage,
		onGetPinMessage: handleGetPinMessage,
		onGetListMessById: handleGetListMessById,
		onActionSettingConv: handleActionSettingConv,
		onAddReact: handleAddReact,
		onEnsureMessageLoaded: handleEnsureMessageLoaded,
		loadingEnsureMessage,
		adminDeleteTarget,
		openAdminDeleteReason,
		reportContents,
		loadingReportContents,
		onCloseAdminDelete: closeAdminDeleteFlow,
		onCloseAdminDeleteReason: handleCloseAdminDeleteReason,
		onAdminDeleteConfirm: handleAdminDeleteConfirm,
		onAdminDeleteReasonConfirm: handleAdminDeleteReasonConfirm,
	}
}
