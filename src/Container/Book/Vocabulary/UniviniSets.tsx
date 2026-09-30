'use client'

import { memo, useEffect, useState } from 'react'
import { IconChevronLeft, IconFolder } from '@tabler/icons-react'

import { parseApiList, parseListTotal } from '@/apis/book/bookApis'
import { getUniviniVocabSets, VocabFolder } from '@/apis/book/vocabApis'
import { useLocalePath } from '@/ultis/route'
import { BOOK_VOCAB_PATH } from '@/Variable/book.variable'

import { FolderAvatar } from './VocabParts'
import classes from './Vocabulary.module.scss'

/** Every UniVini vocab set */
function UniviniSets() {
	const { onChangeRoute } = useLocalePath()
	const [sets, setSets] = useState<VocabFolder[]>([])
	const [total, setTotal] = useState(0)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		getUniviniVocabSets(100)
			.then((res) => {
				const rows = parseApiList<VocabFolder>(res)
				setSets(rows)
				setTotal(parseListTotal(res, rows.length))
			})
			.catch(() => setSets([]))
			.finally(() => setLoading(false))
	}, [])

	return (
		<div className={classes.page}>
			<div className={classes.pageHead}>
				<button type="button" className={classes.back} onClick={() => onChangeRoute(BOOK_VOCAB_PATH)}>
					<IconChevronLeft size={20} />
				</button>
				<span className={classes.pageTitle}>UniVini vocab sets</span>
				{total ? <span className={classes.badge}>{total}</span> : null}
			</div>
			{loading ? (
				<div className={classes.empty}>Loading…</div>
			) : sets.length ? (
				<div className={classes.setGrid}>
					{sets.map((folder) => (
						<button
							key={folder.id}
							type="button"
							className={classes.setCard}
							onClick={() => folder.id && onChangeRoute(`${BOOK_VOCAB_PATH}/univini/${folder.id}`)}
						>
							<span className={classes.setAvatar}>
								<FolderAvatar avatar={folder.avatar} fallback={<IconFolder size={32} stroke={1.5} />} />
							</span>
							<span className={classes.setName}>{folder.name}</span>
						</button>
					))}
				</div>
			) : (
				<div className={classes.empty}>No UniVini vocab sets yet.</div>
			)}
		</div>
	)
}

export default memo(UniviniSets)
