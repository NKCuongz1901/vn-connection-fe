'use client'

import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { IconChevronLeft, IconPlus } from '@tabler/icons-react'
import clsx from 'clsx'
import { toast } from 'react-toastify'

import { parseApiList, parseApiObject, parseListTotal } from '@/apis/book/bookApis'
import {
	getMyVocabSets,
	getMyVocabSetWords,
	getSetLanguages,
	parseStrengthCounts,
	removeWordFromMyVocabSet,
	setMyVocabSetWords,
	VocabFolder,
	VocabLanguages,
	VocabSort,
	VocabStrength,
	VocabStrengthCounts,
	VocabWord,
} from '@/apis/book/vocabApis'
import { useBookLibrary } from '@/context/BookLibraryContext'
import { useModal } from '@/context/ModalContext'
import { useLocalePath } from '@/ultis/route'
import { BOOK_VOCAB_PATH } from '@/Variable/book.variable'

import LearnChoiceModal from './LearnChoiceModal'
import { languageName } from './SetLanguagesModal'
import VocabListModal from './VocabListModal'
import { SortMenu, STRENGTHS, StrengthBox, WordList } from './VocabParts'
import classes from './Vocabulary.module.scss'

const PAGE_SIZE = 50

type Tab = 'all' | 'progress'
type WordsState = { words: VocabWord[]; total: number; counts: VocabStrengthCounts }

/** One of the reader's vocab sets: its words, the vocabulary list form and progress */
function MySetDetail({ folderId }: { folderId: string }) {
	const { onChangeRoute } = useLocalePath()
	const { openConfirm, closeModal } = useModal()
	const { nativeLang } = useBookLibrary()
	const [folder, setFolder] = useState<VocabFolder | null>(null)
	const [langs, setLangs] = useState<VocabLanguages>({})
	const [tab, setTab] = useState<Tab>('all')
	const [sortBy, setSortBy] = useState<VocabSort>('latest_add')
	const [wordType, setWordType] = useState<VocabStrength | undefined>()
	const [data, setData] = useState<WordsState>({ words: [], total: 0, counts: {} })
	const [loading, setLoading] = useState(true)
	const [loadingMore, setLoadingMore] = useState(false)
	const [listOpen, setListOpen] = useState(false)
	const [learnOpen, setLearnOpen] = useState(false)
	const [allWords, setAllWords] = useState<string[]>([])

	const source = (folder?.source_language || 'en').split('-')[0]
	const native = (langs.native_language || nativeLang).split('-')[0]
	const languages = useMemo(() => [native], [native])

	const loadFolder = useCallback(() => {
		getMyVocabSets(200)
			.then((res) => setFolder(parseApiList<VocabFolder>(res).find((item) => item.id === folderId) || null))
			.catch(() => setFolder(null))
		getSetLanguages(folderId)
			.then((res) => setLangs(parseApiObject<VocabLanguages>(res) || {}))
			.catch(() => setLangs({}))
	}, [folderId])

	useEffect(() => {
		loadFolder()
	}, [loadFolder])

	const load = useCallback(
		async (offset: number) => {
			const res = await getMyVocabSetWords({
				folder_id: folderId,
				languages,
				sort_by: sortBy,
				word_type: tab === 'progress' ? wordType : undefined,
				in_progress: tab === 'progress' && !wordType ? true : undefined,
				limit: PAGE_SIZE,
				offset,
			})
			const rows = parseApiList<VocabWord>(res)
			setData((prev) => ({
				words: offset ? [...prev.words, ...rows] : rows,
				total: parseListTotal(res, rows.length),
				counts: parseStrengthCounts(res),
			}))
		},
		[folderId, languages, sortBy, tab, wordType],
	)

	const reload = useCallback(() => {
		setLoading(true)
		return load(0)
			.catch(() => setData({ words: [], total: 0, counts: {} }))
			.finally(() => setLoading(false))
	}, [load])

	useEffect(() => {
		reload()
	}, [reload])

	// the list form needs every word of the set, since saving replaces the list
	const openList = async () => {
		try {
			const res = await getMyVocabSetWords({ folder_id: folderId, languages, limit: 100 })
			setAllWords(parseApiList<VocabWord>(res).map((item) => item.vocab))
		} catch {
			setAllWords(data.words.map((item) => item.vocab))
		}
		setListOpen(true)
	}

	const saveList = async (words: string[], target: string) => {
		try {
			const res = await setMyVocabSetWords({
				folder_id: folderId,
				words,
				source_language: source,
				target_language: target,
			})
			const result = parseApiObject<{ words_updated?: number; not_found_words?: string[] }>(res)
			const missing = result?.not_found_words || []
			if (missing.length) {
				toast.warning(`Not found: ${missing.slice(0, 5).join(', ')}${missing.length > 5 ? '…' : ''}`)
			} else {
				toast.success('Vocabulary list saved')
			}
			setLangs((prev) => ({ ...prev, native_language: target }))
			loadFolder()
			await reload()
		} catch {
			toast.error('Could not save the list')
			throw new Error('save failed')
		}
	}

	const removeWord = (word: VocabWord) => {
		openConfirm({
			titleLabel: 'Remove this word',
			message: `Remove "${word.vocab}" from ${folder?.name || 'this set'}?`,
			confirmLabel: 'Remove',
			cancelLabel: 'Cancel',
			onAccept: async () => {
				closeModal()
				try {
					await removeWordFromMyVocabSet(folderId, word.vocab)
					toast.success('Word removed')
					reload()
				} catch {
					toast.error('Could not remove the word')
				}
			},
		})
	}

	const counts = data.counts
	const countTotal =
		(counts.weak_words_count || 0) + (counts.medium_words_count || 0) + (counts.strong_words_count || 0)
	const name = folder?.name || 'My vocab set'
	const wordCount = folder ? folder.total_words ?? countTotal : data.total

	return (
		<div className={classes.page}>
			<div className={classes.tabsBar} role="tablist">
				{(['all', 'progress'] as const).map((key) => (
					<button
						key={key}
						type="button"
						role="tab"
						aria-selected={tab === key}
						className={clsx(classes.tabBtn, { [classes.tabOn]: tab === key })}
						onClick={() => setTab(key)}
					>
						{key === 'all' ? 'All' : 'Learning progress'}
					</button>
				))}
			</div>

			<div className={classes.pageHead}>
				<button type="button" className={classes.back} onClick={() => onChangeRoute(`${BOOK_VOCAB_PATH}/mine`)}>
					<IconChevronLeft size={20} />
				</button>
				<div>
					<div className={classes.pageTitle}>
						{name} {wordCount ? <span className={classes.badge}>{wordCount}</span> : null}
					</div>
					<div className={classes.pageHint}>{languageName(source).toUpperCase()} - My vocab sets</div>
				</div>
				{tab === 'all' ? (
					<button type="button" className={classes.roundAdd} onClick={openList} aria-label="Create Vocabulary List">
						<IconPlus size={18} />
					</button>
				) : null}
				<span className={classes.grow} />
				{tab === 'all' ? <SortMenu value={sortBy} onChange={setSortBy} label="Sort" /> : null}
			</div>

			<div className={classes.translatedTo}>
				Vocab to be translated to <span className={clsx(classes.langChip, classes.langNative)}>{languageName(native)}</span>
			</div>

			{tab === 'progress' ? (
				<div className={classes.boxes}>
					{STRENGTHS.map((item) => (
						<StrengthBox
							key={item.key}
							label={item.label}
							count={counts[item.countKey] || 0}
							total={countTotal}
							className={clsx(item.className, { [classes.boxOn]: wordType === item.key })}
							onClick={() => setWordType((prev) => (prev === item.key ? undefined : item.key))}
						/>
					))}
				</div>
			) : null}

			{tab === 'all' && !loading && !data.words.length ? (
				<div className={classes.buildCard}>
					<b>No words in this set yet.</b>
					<span>Add the words you want to learn.</span>
					<button type="button" className={classes.primaryBtn} onClick={openList}>
						Create Vocabulary List
					</button>
				</div>
			) : (
				<WordList
					words={data.words}
					nativeLang={native}
					loading={loading}
					total={data.total}
					loadingMore={loadingMore}
					onLoadMore={async () => {
						setLoadingMore(true)
						await load(data.words.length).catch(() => {})
						setLoadingMore(false)
					}}
					onRemove={tab === 'all' ? removeWord : undefined}
					emptyText={wordType ? `No ${wordType} words in this set yet.` : 'Learn these words to see your progress here.'}
				/>
			)}

			{data.total || wordCount ? (
				<button type="button" className={classes.learnBtn} onClick={() => setLearnOpen(true)}>
					Learning these words
				</button>
			) : null}

			<LearnChoiceModal
				open={learnOpen}
				onClose={() => setLearnOpen(false)}
				onPick={(learnType) =>
					onChangeRoute(
						`${BOOK_VOCAB_PATH}/learn?type=${learnType}&folder=${folderId}&name=${encodeURIComponent(name)}${
							tab === 'progress' && wordType ? `&word_type=${wordType}` : ''
						}`,
					)
				}
			/>
			<VocabListModal
				open={listOpen}
				sourceLanguage={source}
				words={allWords}
				nativeLanguage={native}
				onClose={() => setListOpen(false)}
				onSave={saveList}
			/>
		</div>
	)
}

export default memo(MySetDetail)
