import {
	buildTalkRoomListWhere,
	countMeInTalkRoom,
	createTalkRoom,
	CreateTalkRoomInput,
	deleteTalkRoom,
	getDetailTalkRoom,
	getListMyFriendTalkRoom,
	getListTalkRoom,
	getMyTalkRoomAnalysis,
	getTalkRoomCategories,
	getTalkRoomConnectedCountry,
	getTalkRoomConnectedPeople,
	getTalkRoomCountMeInList,
	getTalkRoomLanguages,
	getTalkRoomLeaderBoard,
	notificationMeInTalkRoom,
	TalkRoomCategoryItem,
	TalkRoomConnectedUser,
	TalkRoomCountMeInListItem,
	TalkRoomDetail,
	TalkRoomLanguageItem,
	TalkRoomLeaderBoardItem,
	TalkRoomListFilters,
	TalkRoomListItem,
	updateTalkRoom,
	UpdateTalkRoomInput,
} from '@/apis/talkRoomApis'
import { useModal } from '@/context/ModalContext'
import { PaginationType } from '@/interface/common/common.interface'
import { isArray, uniqueArray } from '@/ultis/array'
import { cloneDeep } from '@/ultis/common'
import { isEmptyObject } from '@/ultis/object'
import { filterTalkRoomsByKeyword } from '@/ultis/talkRoom'
import { generateCustomUuid } from '@/ultis/string'
import { paginationCommon } from '@/Variable/common.variable'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export default function useTalkRoom() {
	const { openError, openSuccess } = useModal()
	const [loading, setLoading] = useState(false)
	const [loadingCreate, setLoadingCreate] = useState(false)
	const [loadingUpdate, setLoadingUpdate] = useState(false)
	const [loadingDelete, setLoadingDelete] = useState(false)
	const [loadingCountMeIn, setLoadingCountMeIn] = useState(false)
	const [loadingNotification, setLoadingNotification] = useState(false)
	const [loadingLanguages, setLoadingLanguages] = useState(false)
	const [loadingCategories, setLoadingCategories] = useState(false)
	const [loadingConnectedCountry, setLoadingConnectedCountry] = useState(false)
	const [loadingConnectedPeople, setLoadingConnectedPeople] = useState(false)
	const [loadingLeaderBoard, setLoadingLeaderBoard] = useState(false)
	const [topLeaderBoard, setTopLeaderBoard] = useState<
		TalkRoomLeaderBoardItem[]
	>([])
	const [myLeaderBoardPosition, setMyLeaderBoardPosition] = useState<any>(null)
	const [leaderBoardList, setLeaderBoardList] = useState<
		TalkRoomLeaderBoardItem[]
	>([])
	const [myTalkRoomAnalysis, setMyTalkRoomAnalysis] = useState<any>(null)
	const [languages, setLanguages] = useState<TalkRoomLanguageItem[]>([])
	const [categories, setCategories] = useState<TalkRoomCategoryItem[]>([])
	const [listTalkRooms, setListTalkRooms] = useState<TalkRoomListItem[]>([])
	const [loadingListMyFriendTalkRooms, setLoadingListMyFriendTalkRooms] =
		useState(false)
	const [listMyFriendTalkRooms, setListMyFriendTalkRooms] = useState<
		TalkRoomListItem[]
	>([])
	const [totalMyFriendTalkRooms, setTotalMyFriendTalkRooms] = useState(0)
	const [totalTalkRooms, setTotalTalkRooms] = useState(0)
	const [loadingListTalkRooms, setLoadingListTalkRooms] = useState(false)
	const [listTalkRoomFilters, setListTalkRoomFilters] =
		useState<TalkRoomListFilters>({})
	const [searchKeyword, setSearchKeyword] = useState('')
	const [talkRoomDetail, setTalkRoomDetail] = useState<TalkRoomDetail | null>(
		null,
	)
	const [loadingTalkRoomDetail, setLoadingTalkRoomDetail] = useState(false)
	const [connectedUsers, setConnectedUsers] = useState<TalkRoomConnectedUser[]>(
		[],
	)
	const [totalConnectedUsers, setTotalConnectedUsers] = useState(0)
	const [connectedCountries, setConnectedCountries] = useState<string[]>([])
	const [loadingCountMeInList, setLoadingCountMeInList] = useState(false)
	const [countMeInUsers, setCountMeInUsers] = useState<
		TalkRoomCountMeInListItem[]
	>([])
	const [totalCountMeInUsers, setTotalCountMeInUsers] = useState(0)

	const _listTalkRoomPaginationRef = useRef<PaginationType>(
		cloneDeep({ ...paginationCommon, limit: 30 }),
	)
	const _listMyFriendTalkRoomPaginationRef = useRef<PaginationType>(
		cloneDeep({ ...paginationCommon, limit: 30 }),
	)
	const _listTalkRoomFilterRef = useRef<TalkRoomListFilters>({})
	const _connectedUsersPaginationRef = useRef<PaginationType>(
		cloneDeep({ ...paginationCommon, limit: 50 }),
	)
	const _countMeInListPaginationRef = useRef<PaginationType>(
		cloneDeep({ ...paginationCommon, limit: 10 }),
	)
	const _countMeInRoomIdRef = useRef<string | null>(null)

	const patchTalkRoomInState = useCallback(
		(id: string, room: Partial<TalkRoomListItem>) => {
			setListTalkRooms((prev) =>
				prev.map((item) => (item.id === id ? { ...item, ...room } : item)),
			)
			setListMyFriendTalkRooms((prev) =>
				prev.map((item) => (item.id === id ? { ...item, ...room } : item)),
			)
			setTalkRoomDetail((prev) =>
				prev?.id === id ? { ...prev, ...room } : prev,
			)
		},
		[],
	)

	const handleGetTopLeaderBoard = useCallback(async () => {
		setLoadingLeaderBoard(true)
		try {
			const res: any = await getTalkRoomLeaderBoard({
				params: {
					fields: ['$all'],
					page: 1,
					limit: 3,
					period: 'all_time',
					metric: 'host_time',
				},
			})
			const { code, results } = res || {}

			if (code === 200) {
				setTopLeaderBoard(results?.objects?.rows ?? [])
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoadingLeaderBoard(false)
		}
	}, [openError])

	const handleGetConnectedUsers = useCallback(
		async (isNotLoading = false, reset = false) => {
			if (reset) {
				_connectedUsersPaginationRef.current.page = 1
			}

			setLoadingConnectedPeople(true)
			try {
				const { page, limit } = _connectedUsersPaginationRef.current
				const isNew = page === 1

				if (isNew && !isNotLoading) {
					setConnectedUsers([])
				}

				const res: any = await getTalkRoomConnectedPeople({
					params: {
						fields: ['$all'],
						page: !isNotLoading ? page : 1,
						limit: !isNotLoading ? limit : limit * page,
					},
				})
				const { code, results, pagination } = res || {}

				if (code === 200) {
					const rows: TalkRoomConnectedUser[] = results?.objects?.rows ?? []
					const count =
						results?.objects?.count ?? pagination?.total ?? rows.length

					_connectedUsersPaginationRef.current.totalPage =
						Math.ceil(count / limit) || 0

					setConnectedUsers((prev) => {
						const contents = isNew && !isNotLoading ? [] : prev
						return uniqueArray(
							[...contents, ...rows],
							'id',
						) as TalkRoomConnectedUser[]
					})
					setTotalConnectedUsers(count)
				}
			} catch (error) {
				openError(error)
			} finally {
				setLoadingConnectedPeople(false)
			}
		},
		[openError],
	)

	const handleLoadMoreConnectedUsers = useCallback(async () => {
		const { page, totalPage } = _connectedUsersPaginationRef.current
		if (loadingConnectedPeople || page >= totalPage) return

		_connectedUsersPaginationRef.current.page += 1
		await handleGetConnectedUsers()
	}, [handleGetConnectedUsers, loadingConnectedPeople])

	const handleGetCountMeInList = useCallback(
		async (roomId: string, isNotLoading = false, reset = false) => {
			if (!roomId) return

			if (reset || _countMeInRoomIdRef.current !== roomId) {
				_countMeInListPaginationRef.current.page = 1
				_countMeInRoomIdRef.current = roomId
				if (!isNotLoading) {
					setCountMeInUsers([])
					setTotalCountMeInUsers(0)
				}
			}

			setLoadingCountMeInList(true)
			try {
				const { page, limit } = _countMeInListPaginationRef.current
				const isNew = page === 1

				if (isNew && !isNotLoading) {
					setCountMeInUsers([])
				}

				const res: any = await getTalkRoomCountMeInList({
					id: roomId,
					params: {
						fields: ['$all'],
						page: !isNotLoading ? page : 1,
						limit: !isNotLoading ? limit : limit * page,
					},
				})
				const { code, results, pagination } = res || {}

				if (code === 200) {
					const rows: TalkRoomCountMeInListItem[] =
						results?.objects?.rows ?? []
					const count =
						results?.objects?.count ?? pagination?.total ?? rows.length

					_countMeInListPaginationRef.current.totalPage =
						Math.ceil(count / limit) || 0

					setCountMeInUsers((prev) => {
						const contents = isNew && !isNotLoading ? [] : prev
						return uniqueArray(
							[...contents, ...rows],
							'user_id',
						) as TalkRoomCountMeInListItem[]
					})
					setTotalCountMeInUsers(count)
				}
			} catch (error) {
				openError(error)
			} finally {
				setLoadingCountMeInList(false)
			}
		},
		[openError],
	)

	const handleLoadMoreCountMeInList = useCallback(async () => {
		const roomId = _countMeInRoomIdRef.current
		const { page, totalPage } = _countMeInListPaginationRef.current
		if (!roomId || loadingCountMeInList || page >= totalPage) return

		_countMeInListPaginationRef.current.page += 1
		await handleGetCountMeInList(roomId)
	}, [handleGetCountMeInList, loadingCountMeInList])

	const handleGetConnectedCountry = useCallback(async () => {
		setLoadingConnectedCountry(true)
		try {
			const res: any = await getTalkRoomConnectedCountry()
			const { code, results } = res || {}

			if (code === 200) {
				setConnectedCountries(results?.object ?? [])
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoadingConnectedCountry(false)
		}
	}, [openError])

	const handleNotificationMeInTalkRoom = useCallback(
		async (id: string, isEnabled: boolean) => {
			if (!id) return false

			setLoadingNotification(true)
			try {
				const res: any = await notificationMeInTalkRoom({
					id,
					payload: { isEnabled },
				})
				const { code } = res || {}

				if (code === 200) {
					const detailRes: any = await getDetailTalkRoom({
						id,
						params: { fields: ['$all'] },
					})
					const refreshed: TalkRoomDetail | null =
						detailRes?.code === 200
							? (detailRes?.results?.object ?? null)
							: null

					if (refreshed) {
						patchTalkRoomInState(id, {
							...refreshed,
							user_notified: refreshed.user_notified ?? isEnabled,
						})
					} else {
						patchTalkRoomInState(id, { user_notified: isEnabled })
					}

					openSuccess({
						autoCloseMs: 2000,
						hideFooter: true,
						styles: {
							content: {
								width: '360px',
								maxWidth: 'calc(100vw - 32px)',
								minHeight: 'unset',
								padding: '20px 24px',
							},
							body: {
								flex: 'unset',
								padding: 0,
							},
						},
						message: isEnabled
							? 'Notification turned on successfully'
							: 'Notification turned off successfully',
					})
					return true
				}
			} catch (error) {
				openError(error)
			} finally {
				setLoadingNotification(false)
			}

			return false
		},
		[openError, openSuccess, patchTalkRoomInState],
	)

	const handleCountMeInTalkRoom = useCallback(
		async (id: string, isEnabled: boolean) => {
			if (!id) return false

			setLoadingCountMeIn(true)
			try {
				const res: any = await countMeInTalkRoom({
					id,
					payload: { isEnabled },
				})
				const { code } = res || {}

				if (code === 200) {
					const detailRes: any = await getDetailTalkRoom({
						id,
						params: { fields: ['$all'] },
					})
					const refreshed: TalkRoomDetail | null =
						detailRes?.code === 200
							? (detailRes?.results?.object ?? null)
							: null

					if (refreshed) {
						patchTalkRoomInState(id, refreshed)
					} else {
						patchTalkRoomInState(id, { is_cmi: isEnabled })
					}

					openSuccess({
						autoCloseMs: 2000,
						hideFooter: true,
						message: isEnabled
							? 'Count me in successfully'
							: 'You opted out successfully',
						styles: {
							content: {
								width: '360px',
								maxWidth: 'calc(100vw - 32px)',
								minHeight: 'unset',
								padding: '20px 24px',
							},
							body: {
								flex: 'unset',
								padding: 0,
							},
						},
					})
					handleGetMyTalkRoomAnalysis()
					return true
				}
			} catch (error) {
				openError(error)
			} finally {
				setLoadingCountMeIn(false)
			}

			return false
		},
		[openError, openSuccess, patchTalkRoomInState],
	)

	const handleDeleteTalkRoom = useCallback(
		async (id: string) => {
			if (!id) return false

			setLoadingDelete(true)
			try {
				const res: any = await deleteTalkRoom(id)
				const { code } = res || {}

				if (code === 200) {
					setListTalkRooms((prev) => prev.filter((item) => item.id !== id))
					setListMyFriendTalkRooms((prev) =>
						prev.filter((item) => item.id !== id),
					)
					setTotalTalkRooms((prev) => Math.max(0, prev - 1))
					setTotalMyFriendTalkRooms((prev) => Math.max(0, prev - 1))
					setTalkRoomDetail((prev) => (prev?.id === id ? null : prev))
					openSuccess({
						message: 'Your talk room has been canceled',
						autoCloseMs: 2000,
						hideFooter: true,
						styles: {
							content: {
								width: '360px',
								maxWidth: 'calc(100vw - 32px)',
								minHeight: 'unset',
								padding: '20px 24px',
							},
							body: {
								flex: 'unset',
								padding: 0,
							},
						},
					})
					handleGetMyTalkRoomAnalysis()
					return true
				}
			} catch (error) {
				openError(error)
			} finally {
				setLoadingDelete(false)
			}

			return false
		},
		[openError, openSuccess],
	)

	const handleGetListMyFriendTalkRoom = useCallback(
		async (isNotLoading = false) => {
			setLoadingListMyFriendTalkRooms(true)
			try {
				const { page, limit } = _listMyFriendTalkRoomPaginationRef.current
				const isNew = page === 1

				if (isNew && !isNotLoading) {
					setListMyFriendTalkRooms([])
				}

				const res: any = await getListMyFriendTalkRoom({
					params: {
						fields: ['$all'],
						page: !isNotLoading ? page : 1,
						limit: !isNotLoading ? limit : limit * page,
					},
				})
				const { code, results, pagination } = res || {}

				if (code === 200) {
					const rows: TalkRoomListItem[] = results?.objects?.rows ?? []
					const count =
						results?.objects?.count ?? pagination?.total ?? rows.length

					_listMyFriendTalkRoomPaginationRef.current.totalPage =
						Math.ceil(count / limit) || 0

					setListMyFriendTalkRooms((prev) => {
						const contents = isNew && !isNotLoading ? [] : prev
						return uniqueArray(
							[...contents, ...rows],
							'id',
						) as TalkRoomListItem[]
					})
					setTotalMyFriendTalkRooms(count)
				}
			} catch (error) {
				openError(error)
			} finally {
				setLoadingListMyFriendTalkRooms(false)
			}
		},
		[openError],
	)

	const handleGetListTalkRoom = useCallback(
		async (isNotLoading = false) => {
			setLoadingListTalkRooms(true)
			try {
				const { page, limit } = _listTalkRoomPaginationRef.current
				const filters = _listTalkRoomFilterRef.current
				const isNew = page === 1
				const where = buildTalkRoomListWhere(filters)

				if (isNew && !isNotLoading) {
					setListTalkRooms([])
				}

				const res: any = await getListTalkRoom({
					params: {
						fields: ['$all'],
						...(isEmptyObject(where) ? {} : { where }),
						page: !isNotLoading ? page : 1,
						limit: !isNotLoading ? limit : limit * page,
					},
				})
				const { code, results, pagination } = res || {}

				if (code === 200) {
					const rows: TalkRoomListItem[] = results?.objects?.rows ?? []
					const count =
						results?.objects?.count ?? pagination?.total ?? rows.length

					_listTalkRoomPaginationRef.current.totalPage =
						Math.ceil(count / limit) || 0

					setListTalkRooms((prev) => {
						const contents = isNew && !isNotLoading ? [] : prev
						return uniqueArray(
							[...contents, ...rows],
							'id',
						) as TalkRoomListItem[]
					})
					setTotalTalkRooms(count)
				}
			} catch (error) {
				openError(error)
			} finally {
				setLoadingListTalkRooms(false)
			}
		},
		[openError],
	)

	const handleGetDetailTalkRoom = useCallback(
		async (
			id: string,
			params: { [key: string]: any } = { fields: ['$all'] },
		) => {
			if (!id) return null

			setLoadingTalkRoomDetail(true)
			try {
				const res: any = await getDetailTalkRoom({ id, params })
				const { code, results } = res || {}

				if (code === 200) {
					const room: TalkRoomDetail = results?.object ?? null
					setTalkRoomDetail(room)
					return room
				}
			} catch (error) {
				openError(error)
			} finally {
				setLoadingTalkRoomDetail(false)
			}

			return null
		},
		[openError],
	)

	const handleChangeListTalkRoomFilters = useCallback(
		(filters: TalkRoomListFilters) => {
			_listTalkRoomFilterRef.current = filters
			_listTalkRoomPaginationRef.current.page = 1
			setListTalkRoomFilters(filters)
			handleGetListTalkRoom()
		},
		[handleGetListTalkRoom],
	)

	const handleChangeLanguageFilter = useCallback(
		(languageIds: string[]) => {
			const next: TalkRoomListFilters = {
				..._listTalkRoomFilterRef.current,
			}

			if (isArray(languageIds, 1)) {
				next.languageIds = languageIds
			} else {
				delete next.languageIds
			}

			handleChangeListTalkRoomFilters(next)
		},
		[handleChangeListTalkRoomFilters],
	)

	const handleChangeLevelFilter = useCallback(
		(levels: string[]) => {
			const next: TalkRoomListFilters = {
				..._listTalkRoomFilterRef.current,
			}
			const apiLevels = levels.map((item) => item.toLowerCase())

			if (isArray(apiLevels, 1)) {
				next.levels = apiLevels
			} else {
				delete next.levels
			}

			handleChangeListTalkRoomFilters(next)
		},
		[handleChangeListTalkRoomFilters],
	)

	const handleChangeSearchKeyword = useCallback((keyword: string) => {
		setSearchKeyword(keyword)
	}, [])

	const languageFilterOptions = useMemo(
		() =>
			languages.map((item) => ({
				label: item.name,
				value: item.id,
				flag: item.flag,
			})),
		[languages],
	)

	const selectedLevelFilters = useMemo(
		() => (listTalkRoomFilters.levels || []).map((item) => item.toUpperCase()),
		[listTalkRoomFilters.levels],
	)

	const displayTalkRooms = useMemo(
		() => filterTalkRoomsByKeyword(listTalkRooms, searchKeyword),
		[listTalkRooms, searchKeyword],
	)

	const handleLoadMoreListTalkRooms = useCallback(async () => {
		const { page, totalPage } = _listTalkRoomPaginationRef.current
		if (loadingListTalkRooms || page >= totalPage) return

		_listTalkRoomPaginationRef.current.page += 1
		await handleGetListTalkRoom()
	}, [handleGetListTalkRoom, loadingListTalkRooms])

	const handleLoadMoreListMyFriendTalkRooms = useCallback(async () => {
		const { page, totalPage } = _listMyFriendTalkRoomPaginationRef.current
		if (loadingListMyFriendTalkRooms || page >= totalPage) return

		_listMyFriendTalkRoomPaginationRef.current.page += 1
		await handleGetListMyFriendTalkRoom()
	}, [handleGetListMyFriendTalkRoom, loadingListMyFriendTalkRooms])

	const handleGetMyTalkRoomAnalysis = async () => {
		setLoading(true)
		try {
			const res: any = await getMyTalkRoomAnalysis({
				params: {
					fields: ['$all'],
				},
			})
			const { code, results } = res || {}
			if (code === 200) {
				setMyTalkRoomAnalysis(results?.object)
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoading(false)
		}
	}

	const handleGetLanguages = useCallback(async () => {
		setLoadingLanguages(true)
		try {
			const res: any = await getTalkRoomLanguages({
				params: {
					fields: ['$all'],
					page: 1,
					limit: 50,
				},
			})
			const { code, results } = res || {}
			if (code === 200) {
				setLanguages(results?.objects?.rows ?? [])
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoadingLanguages(false)
		}
	}, [openError])

	const handleGetCategories = useCallback(async () => {
		setLoadingCategories(true)
		try {
			const res: any = await getTalkRoomCategories()
			const { code, results } = res || {}
			if (code === 200) {
				setCategories(results?.object ?? [])
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoadingCategories(false)
		}
	}, [openError])

	const handleUpdateTalkRoom = useCallback(
		async (id: string, input: UpdateTalkRoomInput) => {
			if (!id || !input.name.trim() || !input.language_id) return null

			setLoadingUpdate(true)
			try {
				const { categorySlugs, idempotency_key, level, ...rest } = input
				const res: any = await updateTalkRoom({
					id,
					payload: {
						...rest,
						name: rest.name.trim(),
						level: level.map((item) => item.toLowerCase()),
						categories: (categorySlugs || []).map((slug) => ({ slug })),
						idempotency_key: idempotency_key || generateCustomUuid(),
					},
				})
				const { code, results } = res || {}

				if (code === 200) {
					const updated: TalkRoomListItem = results?.object

					setListTalkRooms((prev) =>
						prev.map((item) =>
							item.id === id ? { ...item, ...updated } : item,
						),
					)
					setListMyFriendTalkRooms((prev) =>
						prev.map((item) =>
							item.id === id ? { ...item, ...updated } : item,
						),
					)
					setTalkRoomDetail((prev) =>
						prev?.id === id ? { ...prev, ...updated } : prev,
					)
					openSuccess({
						message: 'Update talk room successfully',
						autoCloseMs: 2000,
						hideFooter: true,
					})
					return updated ?? { id, ...input, name: rest.name.trim() }
				}
			} catch (error) {
				openError(error)
			} finally {
				setLoadingUpdate(false)
			}

			return null
		},
		[openError, openSuccess],
	)

	const handleCreateTalkRoom = useCallback(
		async (input: CreateTalkRoomInput) => {
			setLoadingCreate(true)
			try {
				const { categorySlugs, schedules, idempotency_key, ...rest } = input
				const res: any = await createTalkRoom({
					...rest,
					categories: (categorySlugs || []).map((slug) => ({ slug })),
					idempotency_key: idempotency_key || generateCustomUuid(),
					...(isArray(schedules, 1) ? { schedules } : {}),
				})
				const { code, results } = res || {}
				if (code === 200) {
					const room = results?.object
					openSuccess({
						titleLabel: 'Create successfully!',
						message:
							'Your talk room is ready and will start at the time you set',
						autoCloseMs: 2000,
						styles: {
							content: {
								width: '380px',
								maxWidth: 'calc(100vw - 32px)',
								minHeight: 'unset',
								padding: '20px 24px',
							},
							body: {
								flex: 'unset',
								padding: 0,
							},
						},
						hideFooter: true,
						onAccept: () => {
							handleGetMyTalkRoomAnalysis()
						},
					})
					return room
				}
			} catch (error) {
				openError(error)
			} finally {
				setLoadingCreate(false)
			}
		},
		[openError, openSuccess],
	)

	useEffect(() => {
		handleGetMyTalkRoomAnalysis()
		handleGetLanguages()
		handleGetCategories()
		handleGetListTalkRoom()
		handleGetListMyFriendTalkRoom()
		handleGetTopLeaderBoard()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return {
		loading,
		loadingCreate,
		loadingUpdate,
		loadingDelete,
		loadingCountMeIn,
		loadingNotification,
		loadingLanguages,
		loadingCategories,
		loadingListTalkRooms,
		loadingListMyFriendTalkRooms,
		loadingTalkRoomDetail,
		loadingConnectedPeople,
		loadingConnectedCountry,
		loadingLeaderBoard,
		loadingCountMeInList,
		topLeaderBoard,
		myTalkRoomAnalysis,
		languages,
		categories,
		listTalkRooms,
		listMyFriendTalkRooms,
		displayTalkRooms,
		talkRoomDetail,
		connectedUsers,
		connectedCountries,
		totalConnectedUsers,
		countMeInUsers,
		totalCountMeInUsers,
		totalTalkRooms,
		totalMyFriendTalkRooms,
		listTalkRoomFilters,
		searchKeyword,
		languageFilterOptions,
		selectedLevelFilters,

		// ===== ACTIONS =====
		onGetLanguages: handleGetLanguages,
		onGetCategories: handleGetCategories,
		onGetMyTalkRoomAnalysis: handleGetMyTalkRoomAnalysis,
		onGetListTalkRoom: handleGetListTalkRoom,
		onGetListMyFriendTalkRoom: handleGetListMyFriendTalkRoom,
		onGetDetailTalkRoom: handleGetDetailTalkRoom,
		onChangeListTalkRoomFilters: handleChangeListTalkRoomFilters,
		onChangeLanguageFilter: handleChangeLanguageFilter,
		onChangeLevelFilter: handleChangeLevelFilter,
		onChangeSearchKeyword: handleChangeSearchKeyword,
		onLoadMoreListTalkRooms: handleLoadMoreListTalkRooms,
		onLoadMoreListMyFriendTalkRooms: handleLoadMoreListMyFriendTalkRooms,
		onCreateTalkRoom: handleCreateTalkRoom,
		onUpdateTalkRoom: handleUpdateTalkRoom,
		onDeleteTalkRoom: handleDeleteTalkRoom,
		onCountMeInTalkRoom: handleCountMeInTalkRoom,
		onNotificationMeInTalkRoom: handleNotificationMeInTalkRoom,
		onGetConnectedUsers: handleGetConnectedUsers,
		onLoadMoreConnectedUsers: handleLoadMoreConnectedUsers,
		onGetConnectedCountry: handleGetConnectedCountry,
		onGetCountMeInList: handleGetCountMeInList,
		onLoadMoreCountMeInList: handleLoadMoreCountMeInList,
		onGetTopLeaderBoard: handleGetTopLeaderBoard,
	}
}
