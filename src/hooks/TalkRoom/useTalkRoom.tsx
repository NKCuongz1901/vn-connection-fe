import {
	buildTalkRoomListWhere,
	createTalkRoom,
	CreateTalkRoomInput,
	getListTalkRoom,
	getMyTalkRoomAnalysis,
	getTalkRoomCategories,
	getTalkRoomLanguages,
	TalkRoomCategoryItem,
	TalkRoomLanguageItem,
	TalkRoomListFilters,
	TalkRoomListItem,
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
	const [loadingLanguages, setLoadingLanguages] = useState(false)
	const [loadingCategories, setLoadingCategories] = useState(false)
	const [myTalkRoomAnalysis, setMyTalkRoomAnalysis] = useState<any>(null)
	const [languages, setLanguages] = useState<TalkRoomLanguageItem[]>([])
	const [categories, setCategories] = useState<TalkRoomCategoryItem[]>([])
	const [listTalkRooms, setListTalkRooms] = useState<TalkRoomListItem[]>([])
	const [totalTalkRooms, setTotalTalkRooms] = useState(0)
	const [loadingListTalkRooms, setLoadingListTalkRooms] = useState(false)
	const [listTalkRoomFilters, setListTalkRoomFilters] =
		useState<TalkRoomListFilters>({})
	const [searchKeyword, setSearchKeyword] = useState('')

	const _listTalkRoomPaginationRef = useRef<PaginationType>(
		cloneDeep({ ...paginationCommon, limit: 30 }),
	)
	const _listTalkRoomFilterRef = useRef<TalkRoomListFilters>({})

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
		(languageId: string) => {
			const next: TalkRoomListFilters = {
				..._listTalkRoomFilterRef.current,
			}

			if (languageId) {
				next.languageIds = [languageId]
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

	const handleGetListMyFriendTalkRoom = async () => {}

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
						message: 'Create talk room successfully',
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return {
		loading,
		loadingCreate,
		loadingLanguages,
		loadingCategories,
		loadingListTalkRooms,
		myTalkRoomAnalysis,
		languages,
		categories,
		listTalkRooms,
		displayTalkRooms,
		totalTalkRooms,
		listTalkRoomFilters,
		searchKeyword,
		languageFilterOptions,
		selectedLevelFilters,

		// ===== ACTIONS =====
		onGetLanguages: handleGetLanguages,
		onGetCategories: handleGetCategories,
		onGetMyTalkRoomAnalysis: handleGetMyTalkRoomAnalysis,
		onGetListTalkRoom: handleGetListTalkRoom,
		onChangeListTalkRoomFilters: handleChangeListTalkRoomFilters,
		onChangeLanguageFilter: handleChangeLanguageFilter,
		onChangeLevelFilter: handleChangeLevelFilter,
		onChangeSearchKeyword: handleChangeSearchKeyword,
		onLoadMoreListTalkRooms: handleLoadMoreListTalkRooms,
		onCreateTalkRoom: handleCreateTalkRoom,
	}
}
