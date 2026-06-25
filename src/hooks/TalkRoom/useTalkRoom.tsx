import {
	createTalkRoom,
	CreateTalkRoomInput,
	getMyTalkRoomAnalysis,
	getTalkRoomCategories,
	getTalkRoomLanguages,
	TalkRoomCategoryItem,
	TalkRoomLanguageItem,
} from '@/apis/talkRoomApis'
import { useModal } from '@/context/ModalContext'
import { isArray } from '@/ultis/array'
import { generateCustomUuid } from '@/ultis/string'
import { useCallback, useEffect, useState } from 'react'

export default function useTalkRoom() {
	const { openError, openSuccess } = useModal()
	const [loading, setLoading] = useState(false)
	const [loadingCreate, setLoadingCreate] = useState(false)
	const [loadingLanguages, setLoadingLanguages] = useState(false)
	const [loadingCategories, setLoadingCategories] = useState(false)
	const [myTalkRoomAnalysis, setMyTalkRoomAnalysis] = useState<any>(null)
	const [languages, setLanguages] = useState<TalkRoomLanguageItem[]>([])
	const [categories, setCategories] = useState<TalkRoomCategoryItem[]>([])

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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return {
		loading,
		loadingCreate,
		loadingLanguages,
		loadingCategories,
		myTalkRoomAnalysis,
		languages,
		categories,
		onGetLanguages: handleGetLanguages,
		onGetCategories: handleGetCategories,
		onGetMyTalkRoomAnalysis: handleGetMyTalkRoomAnalysis,
		onCreateTalkRoom: handleCreateTalkRoom,
	}
}
