'use client'

import { memo, useRef, useState } from 'react'
import {
	IconChevronDown,
	IconDots,
	IconPlus,
	IconTrash,
	IconVolume,
} from '@tabler/icons-react'
import { Dropdown } from 'antd'
import clsx from 'clsx'

import { VocabWord } from '@/apis/book/vocabApis'

import classes from './Vocabulary.module.scss'

type VocabWordRowProps = {
	word: VocabWord
	/** translation language, e.g. "vi" */
	nativeLang: string
	/** more languages shown next to the word (e.g. ja, ko) */
	extraLangs?: string[]
	/** without it the word has no menu (UniVini sets) */
	onRemove?: (word: VocabWord) => void
	/** add the word to one of the reader's sets */
	onAdd?: (word: VocabWord) => void
}

const EXTRA_COLORS = ['#f59e0b', '#c026d3', '#0ea5e9', '#16a34a']

const LEVEL = {
	WEAK: { label: 'Weak', bars: 1, className: classes.weak },
	MEDIUM: { label: 'Medium', bars: 2, className: classes.medium },
	STRONG: { label: 'Strong', bars: 3, className: classes.strong },
} as const

const sameLang = (a?: string, b?: string) =>
	Boolean(a && b) &&
	a?.split('-')[0].toLowerCase() === b?.split('-')[0].toLowerCase()

export function StrengthBadge({ level }: { level?: keyof typeof LEVEL }) {
	const view = LEVEL[level || 'WEAK']
	return (
		<span className={clsx(classes.strength, view.className)}>
			<span className={classes.bars} aria-hidden>
				{[1, 2, 3].map((bar) => (
					<i
						key={bar}
						className={clsx({ [classes.barOn]: bar <= view.bars })}
					/>
				))}
			</span>
			{view.label}
		</span>
	)
}

/** A looked-up word: pronunciation, translation, strength; expands to meanings and an example */
function VocabWordRow({
	word,
	nativeLang,
	extraLangs = [],
	onRemove,
	onAdd,
}: VocabWordRowProps) {
	const [open, setOpen] = useState(false)
	const audioRef = useRef<HTMLAudioElement | null>(null)

	const translations = (word.senses || [])
		.map((sense) =>
			sense.translations?.find((item) => sameLang(item.language, nativeLang)),
		)
		.filter((item): item is NonNullable<typeof item> => Boolean(item))
	const summary = Array.from(
		new Set(translations.map((item) => item.vocab).filter(Boolean)),
	).join(', ')
	const firstExample = (word.senses || []).find((sense) => sense.example)
	const extras = extraLangs
		.map((lang, index) => {
			const found = (word.senses || [])
				.map((sense) =>
					sense.translations?.find((item) => sameLang(item.language, lang)),
				)
				.find(Boolean)
			return found?.vocab
				? {
						lang,
						vocab: found.vocab,
						ipa: found.ipa,
						color: EXTRA_COLORS[index % EXTRA_COLORS.length],
					}
				: null
		})
		.filter((item): item is NonNullable<typeof item> => Boolean(item))

	const play = () => {
		if (!word.audio_url) return
		if (!audioRef.current) audioRef.current = new Audio(word.audio_url)
		audioRef.current.currentTime = 0
		audioRef.current.play().catch(() => {})
	}

	return (
		<div className={classes.word}>
			<div className={classes.wordHead}>
				<div className={classes.wordText}>
					{word.vocab}
					{extras.map((item) => (
						<span
							key={item.lang}
							className={classes.extraWord}
							style={{ color: item.color }}
						>
							{item.vocab}
						</span>
					))}
				</div>
				<StrengthBadge level={word.learning_stats?.level} />
				{onRemove || onAdd ? (
					<Dropdown
						trigger={['click']}
						placement="bottomRight"
						menu={{
							items: [
								...(onAdd
									? [{ key: 'add', label: 'Add', icon: <IconPlus size={16} /> }]
									: []),
								...(onRemove
									? [
											{
												key: 'remove',
												label: 'Remove',
												icon: <IconTrash size={16} />,
												danger: true,
											},
										]
									: []),
							],
							onClick: ({ key }) =>
								key === 'add' ? onAdd?.(word) : onRemove?.(word),
						}}
					>
						<button type="button" className={classes.iconBtn} aria-label="More">
							<IconDots size={18} />
						</button>
					</Dropdown>
				) : null}
				<button
					type="button"
					className={clsx(classes.iconBtn, { [classes.flip]: open })}
					onClick={() => setOpen((prev) => !prev)}
					aria-label={open ? 'Collapse' : 'Expand'}
					aria-expanded={open}
				>
					<IconChevronDown size={18} />
				</button>
			</div>
			{word.ipa || word.audio_url ? (
				<div className={classes.ipa}>
					{word.ipa ? <span>/{word.ipa.replace(/^\/|\/$/g, '')}/</span> : null}
					{extras
						.filter((item) => item.ipa)
						.map((item) => (
							<span key={item.lang} style={{ color: item.color }}>
								/{String(item.ipa).replace(/^\/|\/$/g, '')}/
							</span>
						))}
					{word.audio_url ? (
						<button
							type="button"
							className={classes.speaker}
							onClick={play}
							aria-label="Listen"
						>
							<IconVolume size={14} />
						</button>
					) : null}
				</div>
			) : null}
			{!open && summary ? (
				<div className={classes.meaning}>{summary}</div>
			) : null}
			{open ? (
				<div className={classes.detail}>
					{word.part_of_speech ? (
						<span className={classes.pos}>{word.part_of_speech}</span>
					) : null}
					{(word.senses || []).map((sense, index) => {
						const translated = sense.translations?.find((item) =>
							sameLang(item.language, nativeLang),
						)
						return (
							<div key={sense.sense_rank ?? index} className={classes.sense}>
								{translated?.vocab ? <b>{translated.vocab}</b> : null}
								<span>{translated?.meaning || sense.meaning}</span>
							</div>
						)
					})}
					{firstExample?.example ? (
						<div className={classes.example}>
							<div className={classes.exampleLabel}>Example</div>
							<div>{firstExample.example}</div>
							{firstExample.translations?.find((item) =>
								sameLang(item.language, nativeLang),
							)?.example ? (
								<div className={classes.exampleTranslated}>
									{
										firstExample.translations?.find((item) =>
											sameLang(item.language, nativeLang),
										)?.example
									}
								</div>
							) : null}
						</div>
					) : null}
				</div>
			) : null}
		</div>
	)
}

export default memo(VocabWordRow)
