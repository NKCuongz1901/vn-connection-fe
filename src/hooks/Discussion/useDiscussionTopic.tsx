import { useEffect, useRef, useState } from 'react'

import { useLoading } from '@/context/LoadingContext'
import { useModal } from '@/context/ModalContext'

import {
	getCategoryExplore,
	getMyCategory,
	likeCategory,
} from '@/apis/discussionApis'

import { cloneDeep, delay } from '@/ultis/common'

import { PaginationType } from '@/interface/common/common.interface'
import { paginationCommon } from '@/Variable/common.variable'

export default function useDiscussionTopic({ type }) {
	const { openError } = useModal()
	const { toggleLoadingContext } = useLoading()
	const _paginationRecommendRefs = useRef<PaginationType>(
		cloneDeep(paginationCommon),
	)

	const [category, setCategory] = useState<any[]>([])

	const [loadingJoin, setLoadingJoin] = useState(false)
	const [loading, setLoading] = useState(true)
	const [titleTopic, setTitleTopic] = useState('')
	const handleGetMyCategory = async () => {
		const { page, limit } = _paginationRecommendRefs.current
		setLoading(true)

		try {
			const api = type === 'join' ? getMyCategory : getCategoryExplore
			const res: any = await api({
				fields: ['$all'],
				page,
				limit,
				...(titleTopic && { where: { title: titleTopic } }),
			})
			await delay(200)
			if (res) {
				const { rows } = res?.results?.objects || {}
				setCategory(rows || [])
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoading(false)
		}
	}
	const handleJoinCategory = async ({ id, parentId }) => {
		if (loadingJoin) return
		try {
			setLoadingJoin(true)
			toggleLoadingContext(true)
			const _category = cloneDeep(category)
			const parentItemIndex = _category.findIndex((i) => i.id === parentId)
			const itemIndex = (category[parentItemIndex].children || []).findIndex(
				(i) => i.id === id,
			)
			const res: any = await likeCategory({ id })
			if (res) {
				const { status } = res?.results?.object || {}
				const isLike = status === 'like'
				if (parentItemIndex > -1 && itemIndex > -1) {
					const { amount_of_user } =
						_category[parentItemIndex].children[itemIndex] || {}
					Object.assign(_category[parentItemIndex].children[itemIndex], {
						is_liked: isLike,
						amount_of_user: amount_of_user + (isLike ? 1 : -1),
					})
					setCategory(_category || [])
				}
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoadingJoin(false)
			toggleLoadingContext()
		}
	}

	useEffect(() => {
		const id = setTimeout(() => {
			handleGetMyCategory()
		}, 1000) // 2s
		return () => {
			clearTimeout(id)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [titleTopic])

	return {
		loading,
		loadingJoin,
		category,
		titleTopic,
		setTitleTopic,
		onJoinCategory: handleJoinCategory,
	}
}
