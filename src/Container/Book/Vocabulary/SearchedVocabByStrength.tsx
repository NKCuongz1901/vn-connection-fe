'use client'

import { memo, useState } from 'react'
import { IconChevronLeft } from '@tabler/icons-react'

import { VocabStrength, VocabWord } from '@/apis/book/vocabApis'
import { useBookLibrary } from '@/context/BookLibraryContext'
import useSearchedVocab from '@/hooks/Book/useSearchedVocab'
import { useLocalePath } from '@/ultis/route'
import { BOOK_VOCAB_PATH } from '@/Variable/book.variable'

import { SortMenu, STRENGTHS, StrengthBox, WordList } from './VocabParts'
import AddToSetModal from './AddToSetModal'
import LearnChoiceModal from './LearnChoiceModal'
import classes from './Vocabulary.module.scss'

/** Searched words of one strength (weak, medium or strong) */
function SearchedVocabByStrength({ type }: { type: VocabStrength }) {
	const { onChangeRoute } = useLocalePath()
	const { nativeLang } = useBookLibrary()
	const searched = useSearchedVocab(nativeLang, type)
	const [learnOpen, setLearnOpen] = useState(false)
	const [adding, setAdding] = useState<VocabWord | null>(null)
	const view = STRENGTHS.find((item) => item.key === type) || STRENGTHS[0]
	const count = searched.counts[view.countKey] || 0
	const total =
		(searched.counts.weak_words_count || 0) +
		(searched.counts.medium_words_count || 0) +
		(searched.counts.strong_words_count || 0)

	return (
		<div className={classes.page}>
			<div className={classes.pageHead}>
				<button type="button" className={classes.back} onClick={() => onChangeRoute(BOOK_VOCAB_PATH)}>
					<IconChevronLeft size={20} />
				</button>
				<div>
					<div className={classes.pageTitle}>
						{view.label.replace(' words', '')} words <span className={classes.badge}>{count}</span>
					</div>
					<div className={classes.pageHint}>Reading searched vocab</div>
				</div>
				<span className={classes.grow} />
				<SortMenu value={searched.sortBy} onChange={searched.setSortBy} />
			</div>
			<div className={classes.boxes}>
				<StrengthBox label={view.label} count={count} total={total} className={view.className} />
			</div>
			<WordList
				words={searched.words}
				nativeLang={nativeLang}
				loading={searched.loading}
				total={searched.total}
				loadingMore={searched.loadingMore}
				onLoadMore={searched.loadMore}
				onRemove={searched.remove}
					onAdd={setAdding}
				emptyText={`No ${view.label.toLowerCase()} yet.`}
			/>
			{searched.total ? (
				<button type="button" className={classes.learnBtn} onClick={() => setLearnOpen(true)}>
					Learning these words
				</button>
			) : null}
			<AddToSetModal word={adding} onClose={() => setAdding(null)} />
			<LearnChoiceModal
				open={learnOpen}
				onClose={() => setLearnOpen(false)}
				onPick={(learnType) => onChangeRoute(`${BOOK_VOCAB_PATH}/learn?type=${learnType}&word_type=${type}`)}
			/>
		</div>
	)
}

export default memo(SearchedVocabByStrength)
