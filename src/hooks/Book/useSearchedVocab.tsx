'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'

import { deleteReadingSearchVocabWord, parseApiList, parseListTotal } from '@/apis/book/bookApis'
import {
	getReadingSearchedVocab,
	parseStrengthCounts,
	VocabSort,
	VocabStrength,
	VocabStrengthCounts,
	VocabWord,
} from '@/apis/book/vocabApis'
import { useModal } from '@/context/ModalContext'

const PAGE_SIZE = 20

/** The reader's searched words: sort, weak / medium / strong filter, load more and remove */
export default function useSearchedVocab(nativeLang: string, wordType?: VocabStrength) {
	const { openConfirm, closeModal } = useModal()
	const [sortBy, setSortBy] = useState<VocabSort>('latest_add')
	const [words, setWords] = useState<VocabWord[]>([])
	const [total, setTotal] = useState(0)
	const [counts, setCounts] = useState<VocabStrengthCounts>({})
	const [loading, setLoading] = useState(true)
	const [loadingMore, setLoadingMore] = useState(false)
	const seq = useRef(0)
	const language = nativeLang.split('-')[0]

	const load = useCallback(
		async (offset: number) => {
			const current = ++seq.current
			const res = await getReadingSearchedVocab({
				sort_by: sortBy,
				word_type: wordType,
				languages: language ? [language] : undefined,
				limit: PAGE_SIZE,
				offset,
			})
			if (current !== seq.current) return
			const rows = parseApiList<VocabWord>(res)
			setWords((prev) => (offset ? [...prev, ...rows] : rows))
			setTotal(parseListTotal(res, rows.length))
			setCounts(parseStrengthCounts(res))
		},
		[language, sortBy, wordType],
	)

	const reload = useCallback(() => {
		setLoading(true)
		load(0)
			.catch(() => {
				setWords([])
				setTotal(0)
			})
			.finally(() => setLoading(false))
	}, [load])

	useEffect(() => {
		reload()
	}, [reload])

	const loadMore = async () => {
		if (loadingMore || words.length >= total) return
		setLoadingMore(true)
		await load(words.length).catch(() => {})
		setLoadingMore(false)
	}

	const remove = (word: VocabWord) => {
		openConfirm({
			titleLabel: 'Remove this word',
			message: `Remove "${word.vocab}" from your searched words?`,
			confirmLabel: 'Remove',
			cancelLabel: 'Cancel',
			onAccept: async () => {
				closeModal()
				try {
					await deleteReadingSearchVocabWord(word.source_vocab_id)
					toast.success('Word removed')
					reload()
				} catch {
					toast.error('Could not remove the word')
				}
			},
		})
	}

	return { words, total, counts, loading, loadingMore, sortBy, setSortBy, loadMore, remove }
}
