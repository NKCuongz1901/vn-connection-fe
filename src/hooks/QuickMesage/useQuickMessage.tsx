import { useCallback, useEffect, useRef, useState } from 'react'

import {
	createQuickMessage,
	deleteQuickMessage,
	getQuickMessage,
	QuickMessageMedia,
	QuickMessagePayload,
	updateQuickMessage,
} from '@/apis/conversationApis'
import { handleUploadImage, handleUploadVideo } from '@/apis/uploadApis'
import { useLoading } from '@/context/LoadingContext'
import { useModal } from '@/context/ModalContext'
import { PaginationType } from '@/interface/common/common.interface'
import { uniqueArray } from '@/ultis/array'
import { cloneDeep, handleScrollCallback } from '@/ultis/common'
import { paginationCommon } from '@/Variable/common.variable'

export type { QuickMessageMedia, QuickMessagePayload } from '@/apis/conversationApis'

export interface QuickMessageItem {
	id: string
	shortcut: string
	content: string
	media?: string
	medias?: QuickMessageMedia[]
	[key: string]: any
}

/** Local file picked in UI — `file` is uploaded via pre-signed URL before API call */
export interface QuickMessageLocalMedia {
	type?: string
	url?: string
	file?: File
	width?: number
	height?: number
	ratio?: number
	duration?: number
}

export interface QuickMessageFormData {
	shortcut: string
	content: string
	/** New local files to upload (must include `file`) */
	fileList?: QuickMessageLocalMedia[]
	/** Existing server medias to keep (e.g. when editing) */
	existingMedias?: QuickMessageMedia[]
}

const defaultParams = {
	fields: ['$all'],
}

const buildQuickMessagePayload = async ({
	shortcut,
	content,
	fileList = [],
	existingMedias = [],
}: QuickMessageFormData): Promise<QuickMessagePayload> => {
	const toUpload = (fileList || []).filter((item) => item?.file)
	let uploadedMedias: QuickMessageMedia[] = []

	if (toUpload.length > 0) {
		const uploadPromises = toUpload.map((media) =>
			media?.type === 'VIDEO'
				? handleUploadVideo(media.file)
				: handleUploadImage(media.file),
		)
		const resList = await Promise.all(uploadPromises)

		uploadedMedias = toUpload.map((item, index) => ({
			url: resList[index],
			type: item?.type || 'IMAGE',
			width: item?.width ?? 692,
			height: item?.height ?? 1500,
			ratio: item?.ratio ?? 0.4613333333333333,
			duration: item?.duration ?? 0,
		}))
	}

	const keptMedias: QuickMessageMedia[] = (existingMedias || []).map((item) => ({
		url: item?.url,
		type: item?.type || 'IMAGE',
		width: item?.width,
		height: item?.height,
		ratio: item?.ratio,
		duration: item?.duration ?? 0,
	}))

	const medias = [...keptMedias, ...uploadedMedias]
	const media = medias[0]?.url || ''

	return { shortcut, content, media, medias }
}

export default function useQuickMessage() {
	const { openError, openSuccess } = useModal()
	const { toggleLoadingContext } = useLoading()

	const paginationRef = useRef<PaginationType>(cloneDeep(paginationCommon))
	const canLoadMoreRef = useRef(true)

	const [list, setList] = useState<QuickMessageItem[]>([])
	const [loading, setLoading] = useState(false)
	const [total, setTotal] = useState(0)

	const fetchList = useCallback(
		async ({ page, append = false }: { page?: number; append?: boolean } = {}) => {
			const currentPage = page ?? paginationRef.current.page
			const { limit } = paginationRef.current
			const isNew = currentPage === 1 && !append

			setLoading(true)
			try {
				const res: any = await getQuickMessage({
					params: {
						...defaultParams,
						page: currentPage,
						limit,
					},
				})
				const { code, results } = res || {}
				if (code === 200) {
					const { rows = [], count = 0 } = results?.objects || {}
					canLoadMoreRef.current = rows.length >= limit
					paginationRef.current.page = currentPage
					setTotal(count)
					setList((prev) =>
						uniqueArray(isNew ? rows : [...prev, ...rows], 'id') as QuickMessageItem[],
					)
				}
			} catch (error) {
				openError(error)
			} finally {
				setLoading(false)
			}
		},
		[openError],
	)

	const onRefresh = useCallback(async () => {
		paginationRef.current.page = 1
		canLoadMoreRef.current = true
		await fetchList({ page: 1 })
	}, [fetchList])

	const onLoadMore = useCallback(async () => {
		if (!canLoadMoreRef.current || loading) return
		const nextPage = paginationRef.current.page + 1
		await fetchList({ page: nextPage, append: true })
	}, [fetchList, loading])

	const onScroll = useCallback(
		(e: any) => {
			handleScrollCallback(e, onLoadMore)
		},
		[onLoadMore],
	)

	const onCreate = useCallback(
		async (data: QuickMessageFormData) => {
			toggleLoadingContext(true)
			try {
				const payload = await buildQuickMessagePayload(data)
				const res: any = await createQuickMessage(payload)
				const { code, results } = res || {}
				if (code === 200) {
					openSuccess({ message: 'Quick message created successfully' })
					await onRefresh()
					return results?.object
				}
			} catch (error) {
				openError(error)
			} finally {
				toggleLoadingContext()
			}
		},
		[openError, openSuccess, onRefresh, toggleLoadingContext],
	)

	const onUpdate = useCallback(
		async (id: string, data: QuickMessageFormData) => {
			toggleLoadingContext(true)
			try {
				const payload = await buildQuickMessagePayload(data)
				const res: any = await updateQuickMessage(id, payload)
				const { code, results } = res || {}
				if (code === 200) {
					openSuccess({ message: 'Quick message updated successfully' })
					const updated = results?.object
					if (updated?.id) {
						setList((prev) =>
							prev.map((item) => (item.id === id ? { ...item, ...updated } : item)),
						)
					} else {
						await onRefresh()
					}
					return updated
				}
			} catch (error) {
				openError(error)
			} finally {
				toggleLoadingContext()
			}
		},
		[openError, openSuccess, onRefresh, toggleLoadingContext],
	)

	const onDelete = useCallback(
		async (id: string) => {
			toggleLoadingContext(true)
			try {
				const res: any = await deleteQuickMessage(id)
				const { code } = res || {}
				if (code === 200) {
					openSuccess({ message: 'Quick message deleted successfully' })
					setList((prev) => prev.filter((item) => item.id !== id))
					setTotal((prev) => Math.max(prev - 1, 0))
					return true
				}
			} catch (error) {
				openError(error)
			} finally {
				toggleLoadingContext()
			}
		},
		[openError, openSuccess, toggleLoadingContext],
	)

	useEffect(() => {
		onRefresh()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return {
		list,
		loading,
		total,
		canLoadMore: canLoadMoreRef,
		onRefresh,
		onLoadMore,
		onScroll,
		onCreate,
		onUpdate,
		onDelete,
	}
}
