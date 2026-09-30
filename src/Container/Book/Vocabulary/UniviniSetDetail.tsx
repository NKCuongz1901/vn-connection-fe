'use client'

import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { IconChevronDown, IconChevronLeft, IconChevronUp, IconPlus, IconX } from '@tabler/icons-react'
import clsx from 'clsx'
import { toast } from 'react-toastify'

import { parseApiList, parseApiObject, parseListTotal } from '@/apis/book/bookApis'
import {
	getSetLanguages,
	getUniviniSetLevels,
	getUniviniSetWords,
	getUniviniVocabSets,
	parseLevelGroups,
	parseStrengthCounts,
	posterOf,
	updateSetLanguages,
	VocabFolder,
	VocabLanguages,
	VocabSort,
	VocabStrength,
	VocabStrengthCounts,
	VocabWord,
} from '@/apis/book/vocabApis'
import CModal from '@/Components/Custom/CModal/CModal'
import { useBookLibrary } from '@/context/BookLibraryContext'
import { useLocalePath } from '@/ultis/route'
import { BOOK_VOCAB_PATH } from '@/Variable/book.variable'

import LearnChoiceModal from './LearnChoiceModal'
import SetLanguagesModal, { languageName } from './SetLanguagesModal'
import { SortMenu, STRENGTHS, StrengthBox, WordList } from './VocabParts'
import VocabWordRow from './VocabWordRow'
import classes from './Vocabulary.module.scss'

const PREVIEW_COUNT = 2
const PAGE_SIZE = 20

type Tab = 'all' | 'progress'

/** A UniVini vocab set: its words by level (All) and the reader's progress on them */
function UniviniSetDetail({ folderId }: { folderId: string }) {
	const { onChangeRoute } = useLocalePath()
	const { nativeLang } = useBookLibrary()
	const [folder, setFolder] = useState<VocabFolder | null>(null)
	const [langs, setLangs] = useState<VocabLanguages>({})
	const [tab, setTab] = useState<Tab>('all')
	const [sortBy, setSortBy] = useState<VocabSort>('latest_add')
	const [groups, setGroups] = useState<{ level: string; items: VocabWord[]; total: number }[]>([])
	const [expanded, setExpanded] = useState<string[]>([])
	const [loading, setLoading] = useState(true)
	const [wordType, setWordType] = useState<VocabStrength | undefined>()
	const [progress, setProgress] = useState<{ words: VocabWord[]; total: number; counts: VocabStrengthCounts }>({
		words: [],
		total: 0,
		counts: {},
	})
	const [progressLoading, setProgressLoading] = useState(false)
	const [loadingMore, setLoadingMore] = useState(false)
	const [poster, setPoster] = useState<{ level: string; url: string } | null>(null)
	const [langOpen, setLangOpen] = useState(false)
	const [learnOpen, setLearnOpen] = useState(false)

	const native = (langs.native_language || nativeLang).split('-')[0]
	const extra = useMemo(() => (langs.learning_languages || []).filter((code) => code !== native), [langs, native])
	const languages = useMemo(() => [...extra, native], [extra, native])
	const wordCount = groups.reduce((sum, group) => sum + group.total, 0)

	useEffect(() => {
		getUniviniVocabSets(100)
			.then((res) => setFolder(parseApiList<VocabFolder>(res).find((item) => item.id === folderId) || null))
			.catch(() => setFolder(null))
		getSetLanguages(folderId)
			.then((res) => setLangs(parseApiObject<VocabLanguages>(res) || {}))
			.catch(() => setLangs({}))
	}, [folderId])

	useEffect(() => {
		let cancelled = false
		setLoading(true)
		getUniviniSetLevels({ folder_id: folderId, languages, sort_by: sortBy })
			.then((res) => {
				if (!cancelled) setGroups(parseLevelGroups(res))
			})
			.catch(() => {
				if (!cancelled) setGroups([])
			})
			.finally(() => {
				if (!cancelled) setLoading(false)
			})
		return () => {
			cancelled = true
		}
	}, [folderId, languages, sortBy])

	const loadProgress = useCallback(
		async (offset: number) => {
			const res = await getUniviniSetWords({
				folder_id: folderId,
				languages,
				word_type: wordType,
				in_progress: wordType ? undefined : true,
				limit: PAGE_SIZE,
				offset,
			})
			const rows = parseApiList<VocabWord>(res)
			setProgress((prev) => ({
				words: offset ? [...prev.words, ...rows] : rows,
				total: parseListTotal(res, rows.length),
				counts: parseStrengthCounts(res),
			}))
		},
		[folderId, languages, wordType],
	)

	useEffect(() => {
		if (tab !== 'progress') return
		setProgressLoading(true)
		loadProgress(0)
			.catch(() => setProgress({ words: [], total: 0, counts: {} }))
			.finally(() => setProgressLoading(false))
	}, [loadProgress, tab])

	const saveLanguages = async (picked: string[]) => {
		try {
			await updateSetLanguages(folderId, picked, native)
			setLangs((prev) => ({ ...prev, learning_languages: picked, native_language: native }))
		} catch {
			toast.error('Could not save the languages')
			throw new Error('save failed')
		}
	}

	const counts = progress.counts
	const countTotal =
		(counts.weak_words_count || 0) + (counts.medium_words_count || 0) + (counts.strong_words_count || 0)
	const name = folder?.name || 'Vocab set'

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
				<button type="button" className={classes.back} onClick={() => onChangeRoute(`${BOOK_VOCAB_PATH}/univini`)}>
					<IconChevronLeft size={20} />
				</button>
				<div>
					<div className={classes.pageTitle}>
						{name} {wordCount ? <span className={classes.badge}>{wordCount}</span> : null}
					</div>
					<div className={classes.pageHint}>UniVini vocab set</div>
				</div>
				<span className={classes.grow} />
				{tab === 'all' ? <SortMenu value={sortBy} onChange={setSortBy} label="Sort" /> : null}
			</div>

			<div className={classes.langRow}>
				<span className={classes.langChip}>English</span>
				{extra.map((code) => (
					<span key={code} className={classes.langChip}>
						{languageName(code)}
						<button
							type="button"
							className={classes.langRemove}
							onClick={() => saveLanguages(extra.filter((item) => item !== code)).catch(() => {})}
							aria-label={`Remove ${languageName(code)}`}
						>
							<IconX size={12} />
						</button>
					</span>
				))}
				<button type="button" className={classes.langAdd} onClick={() => setLangOpen(true)}>
					<IconPlus size={14} /> Add language
				</button>
				<span className={classes.langArrow}>→</span>
				<span className={clsx(classes.langChip, classes.langNative)}>{languageName(native)}</span>
			</div>

			{tab === 'all' ? (
				loading ? (
					<div className={classes.empty}>Loading…</div>
				) : groups.length ? (
					groups.map((group) => {
						const open = expanded.includes(group.level)
						const shown = open ? group.items : group.items.slice(0, PREVIEW_COUNT)
						const posterUrl = posterOf(folder, group.level)
						return (
							<section key={group.level} className={classes.levelGroup}>
								<div className={classes.sectionHead}>
									<span className={classes.levelTag}>{group.level}</span>
									<span className={classes.badge}>{group.total}</span>
									<span className={classes.grow} />
									{posterUrl ? (
										<button
											type="button"
											className={classes.posterLink}
											onClick={() => setPoster({ level: group.level, url: posterUrl })}
										>
											Vocabulary Poster
										</button>
									) : null}
								</div>
								<div className={classes.words}>
									{shown.map((word) => (
										<VocabWordRow key={word.source_vocab_id} word={word} nativeLang={native} extraLangs={extra} />
									))}
									{group.items.length > PREVIEW_COUNT ? (
										<button
											type="button"
											className={classes.showMore}
											onClick={() =>
												setExpanded((prev) =>
													open ? prev.filter((item) => item !== group.level) : [...prev, group.level],
												)
											}
										>
											{open ? 'Show less' : 'Show more'}
											{open ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
										</button>
									) : null}
								</div>
							</section>
						)
					})
				) : (
					<div className={classes.empty}>This set has no words yet.</div>
				)
			) : (
				<>
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
					<WordList
						words={progress.words}
						nativeLang={native}
						loading={progressLoading}
						total={progress.total}
						loadingMore={loadingMore}
						onLoadMore={async () => {
							setLoadingMore(true)
							await loadProgress(progress.words.length).catch(() => {})
							setLoadingMore(false)
						}}
						emptyText={
							wordType ? `No ${wordType} words in this set yet.` : 'Learn these words to see your progress here.'
						}
					/>
				</>
			)}

			{wordCount ? (
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
			<SetLanguagesModal
				open={langOpen}
				value={extra}
				exclude={['en', native]}
				onClose={() => setLangOpen(false)}
				onSave={saveLanguages}
			/>
			<CModal
				open={Boolean(poster)}
				centered
				title="Vocabulary Poster"
				footer={null}
				onCancel={() => setPoster(null)}
				styles={{ content: { width: 560, maxWidth: 'calc(100vw - 32px)' } }}
			>
				{poster ? (
					<div className={classes.poster}>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img src={poster.url} alt={`${name} ${poster.level} poster`} />
						<a
							className={classes.primaryBtn}
							href={poster.url}
							download={`${name}-${poster.level}.png`}
							target="_blank"
							rel="noreferrer"
						>
							Download
						</a>
					</div>
				) : null}
			</CModal>
		</div>
	)
}

export default memo(UniviniSetDetail)
