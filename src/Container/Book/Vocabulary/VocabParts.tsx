'use client'

import { IconCheck, IconChevronDown } from '@tabler/icons-react'
import { Dropdown } from 'antd'
import clsx from 'clsx'

import { VocabSort, VocabStrength, VocabStrengthCounts, VocabWord } from '@/apis/book/vocabApis'

import VocabWordRow from './VocabWordRow'
import classes from './Vocabulary.module.scss'

// an avatar can be an image URL or an emoji
export const FolderAvatar = ({ avatar, fallback }: { avatar?: string | null; fallback: React.ReactNode }) =>
	avatar && /^https?:\/\//.test(avatar) ? (
		// eslint-disable-next-line @next/next/no-img-element
		<img src={avatar} alt="" />
	) : avatar ? (
		<span className={classes.emoji}>{avatar}</span>
	) : (
		<>{fallback}</>
	)

export const SORT_OPTIONS: { key: VocabSort; label: string }[] = [
	{ key: 'latest_add', label: 'Newest' },
	{ key: 'oldest_add', label: 'Oldest' },
	{ key: 'a_to_z', label: 'A → Z' },
	{ key: 'z_to_a', label: 'Z → A' },
]

export const STRENGTHS: { key: VocabStrength; label: string; countKey: keyof VocabStrengthCounts; className: string }[] = [
	{ key: 'weak', label: 'Weak words', countKey: 'weak_words_count', className: classes.weak },
	{ key: 'medium', label: 'Medium words', countKey: 'medium_words_count', className: classes.medium },
	{ key: 'strong', label: 'Strong words', countKey: 'strong_words_count', className: classes.strong },
]

export function SortMenu({ value, onChange, label }: { value: VocabSort; onChange: (value: VocabSort) => void; label?: string }) {
	return (
		<Dropdown
			trigger={['click']}
			placement="bottomRight"
			menu={{
				items: SORT_OPTIONS.map((item) => ({
					key: item.key,
					label: (
						<span className={classes.sortItem}>
							{item.label}
							{item.key === value ? <IconCheck size={14} /> : null}
						</span>
					),
				})),
				onClick: ({ key }) => onChange(key as VocabSort),
			}}
		>
			<button type="button" className={classes.sort}>
				{label || SORT_OPTIONS.find((item) => item.key === value)?.label || 'Sort'}
				<IconChevronDown size={14} />
			</button>
		</Dropdown>
	)
}

/** A box filled to the share of words at that strength, with the count */
export function StrengthBox({
	label,
	count,
	total,
	className,
	onClick,
}: {
	label: string
	count: number
	total: number
	className: string
	onClick?: () => void
}) {
	const fill = total ? Math.max(8, Math.round((count / total) * 100)) : 0
	const Tag = onClick ? 'button' : 'div'
	return (
		<Tag type={onClick ? 'button' : undefined} className={clsx(classes.box, className)} onClick={onClick}>
			<span className={classes.boxJar}>
				<span className={classes.boxFill} style={{ height: `${count ? fill : 0}%` }} />
			</span>
			<span className={classes.boxCopy}>
				<b>{count}</b>
				<span>{label}</span>
			</span>
		</Tag>
	)
}

export function WordList({
	words,
	nativeLang,
	loading,
	total,
	loadingMore,
	onLoadMore,
	onRemove,
	onAdd,
	emptyText,
}: {
	words: VocabWord[]
	nativeLang: string
	loading: boolean
	total: number
	loadingMore: boolean
	onLoadMore: () => void
	onRemove?: (word: VocabWord) => void
	onAdd?: (word: VocabWord) => void
	emptyText: string
}) {
	if (loading && !words.length) return <div className={classes.empty}>Loading…</div>
	if (!words.length) return <div className={classes.empty}>{emptyText}</div>
	return (
		<div className={classes.words}>
			{words.map((word) => (
				<VocabWordRow
					key={word.source_vocab_id}
					word={word}
					nativeLang={nativeLang}
					onRemove={onRemove}
					onAdd={onAdd}
				/>
			))}
			{words.length < total ? (
				<button type="button" className={classes.loadMore} onClick={onLoadMore} disabled={loadingMore}>
					{loadingMore ? 'Loading…' : 'Load more'}
				</button>
			) : null}
		</div>
	)
}
