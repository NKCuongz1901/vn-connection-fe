'use client'

import { memo, useEffect, useState } from 'react'
import { IconBook, IconFolder, IconSparkles, IconUserSquare } from '@tabler/icons-react'

import { parseApiList, parseListTotal } from '@/apis/book/bookApis'
import { folderWordCount, getMyVocabSets, getUniviniVocabSets, VocabFolder } from '@/apis/book/vocabApis'
import { useBookLibrary } from '@/context/BookLibraryContext'
import useSearchedVocab from '@/hooks/Book/useSearchedVocab'
import { useLocalePath } from '@/ultis/route'
import { BOOK_VOCAB_PATH } from '@/Variable/book.variable'

import { SortMenu, STRENGTHS, StrengthBox, WordList } from './VocabParts'
import classes from './Vocabulary.module.scss'

// an avatar can be an image URL or an emoji
const FolderAvatar = ({ avatar, fallback }: { avatar?: string | null; fallback: React.ReactNode }) =>
	avatar && /^https?:\/\//.test(avatar) ? (
		// eslint-disable-next-line @next/next/no-img-element
		<img src={avatar} alt="" />
	) : avatar ? (
		<span className={classes.emoji}>{avatar}</span>
	) : (
		<>{fallback}</>
	)

/** Vocabulary home: UniVini sets, the reader's sets and the words searched while reading */
function VocabularyOverview() {
	const { onChangeRoute } = useLocalePath()
	const { nativeLang } = useBookLibrary()
	const searched = useSearchedVocab(nativeLang)
	const [univini, setUnivini] = useState<VocabFolder[]>([])
	const [univiniTotal, setUniviniTotal] = useState(0)
	const [mine, setMine] = useState<VocabFolder[]>([])
	const [mineTotal, setMineTotal] = useState(0)

	useEffect(() => {
		getUniviniVocabSets()
			.then((res) => {
				const rows = parseApiList<VocabFolder>(res)
				setUnivini(rows)
				setUniviniTotal(parseListTotal(res, rows.length))
			})
			.catch(() => setUnivini([]))
		getMyVocabSets()
			.then((res) => {
				const rows = parseApiList<VocabFolder>(res)
				setMine(rows)
				setMineTotal(parseListTotal(res, rows.length))
			})
			.catch(() => setMine([]))
	}, [])

	const countTotal =
		(searched.counts.weak_words_count || 0) +
		(searched.counts.medium_words_count || 0) +
		(searched.counts.strong_words_count || 0)

	return (
		<div className={classes.page}>
			<section className={classes.section}>
				<div className={classes.sectionHead}>
					<IconSparkles size={18} className={classes.sectionIcon} />
					<span className={classes.sectionTitle}>UniVini vocab sets</span>
					{univiniTotal ? <span className={classes.badge}>{univiniTotal}</span> : null}
				</div>
				{univini.length ? (
					<div className={classes.rail}>
						{univini.map((folder) => (
							<div key={folder.id} className={classes.setCard} title={folder.name}>
								<span className={classes.setAvatar}>
									<FolderAvatar avatar={folder.avatar} fallback={<IconFolder size={32} stroke={1.5} />} />
								</span>
								<span className={classes.setName}>{folder.name}</span>
							</div>
						))}
					</div>
				) : (
					<div className={classes.empty}>No UniVini vocab sets yet.</div>
				)}
			</section>

			<section className={classes.section}>
				<div className={classes.sectionHead}>
					<IconUserSquare size={18} className={classes.sectionIcon} />
					<span className={classes.sectionTitle}>My vocab sets</span>
					{mineTotal ? <span className={classes.badge}>{mineTotal}</span> : null}
				</div>
				{mine.length ? (
					<div className={classes.rail}>
						{mine.map((folder) => (
							<div key={folder.id} className={classes.myCard}>
								<span className={classes.myAvatar}>
									<FolderAvatar avatar={folder.avatar} fallback={<IconFolder size={18} />} />
								</span>
								<span className={classes.myCopy}>
									<b>{folder.name}</b>
									<span>{folderWordCount(folder)} words</span>
								</span>
							</div>
						))}
					</div>
				) : (
					<div className={classes.buildCard}>
						<IconFolder size={28} className={classes.sectionIcon} />
						<b>Build your own vocabulary set.</b>
						<span>Save the words you want to learn in your own sets.</span>
					</div>
				)}
			</section>

			<section className={classes.section}>
				<div className={classes.sectionHead}>
					<IconBook size={18} className={classes.sectionIcon} />
					<span className={classes.sectionTitle}>Reading searched vocab</span>
					{searched.total ? <span className={classes.badge}>{searched.total}</span> : null}
					<span className={classes.grow} />
					<SortMenu value={searched.sortBy} onChange={searched.setSortBy} label="Sort" />
				</div>
				<div className={classes.boxes}>
					{STRENGTHS.map((item) => (
						<StrengthBox
							key={item.key}
							label={item.label}
							count={searched.counts[item.countKey] || 0}
							total={countTotal}
							className={item.className}
							onClick={() => onChangeRoute(`${BOOK_VOCAB_PATH}/searched?type=${item.key}`)}
						/>
					))}
				</div>
				<WordList
					words={searched.words}
					nativeLang={nativeLang}
					loading={searched.loading}
					total={searched.total}
					loadingMore={searched.loadingMore}
					onLoadMore={searched.loadMore}
					onRemove={searched.remove}
					emptyText="Words you look up while reading show up here."
				/>
			</section>
		</div>
	)
}

export default memo(VocabularyOverview)
