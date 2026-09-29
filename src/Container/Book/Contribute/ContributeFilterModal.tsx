'use client'

import { memo, useEffect, useState } from 'react'
import { Select } from 'antd'
import clsx from 'clsx'

import { ContributedSort } from '@/apis/book/contributeApis'
import CModal from '@/Components/Custom/CModal/CModal'
import { useOptionalBookLibrary } from '@/context/BookLibraryContext'
import { BOOK_LEVELS } from '@/Variable/book.variable'

import classes from './BookContribute.module.scss'

export type ContributeFilters = {
	sortBy: ContributedSort
	level?: string
	category?: string
}

const SORTS: { value: ContributedSort; label: string }[] = [
	{ value: 'newest', label: 'Newest' },
	{ value: 'oldest', label: 'Oldest' },
	{ value: 'a-z', label: 'A → Z' },
	{ value: 'z-a', label: 'Z → A' },
]

type ContributeFilterModalProps = {
	open: boolean
	value: ContributeFilters
	onClose: () => void
	onApply: (value: ContributeFilters) => void
}

/** Sort by, level and category for My contributed books */
function ContributeFilterModal({ open, value, onClose, onApply }: ContributeFilterModalProps) {
	const library = useOptionalBookLibrary()
	const [draft, setDraft] = useState(value)

	useEffect(() => {
		if (open) setDraft(value)
	}, [open, value])

	if (!open) return null

	return (
		<CModal
			open
			centered
			title="Filter"
			footer={null}
			onCancel={onClose}
			styles={{ content: { width: 400, maxWidth: 'calc(100vw - 32px)' } }}
		>
			<div className={classes.form}>
				<div className={classes.label}>Sort by</div>
				<div className={classes.sortGrid} role="radiogroup">
					{SORTS.map((item) => (
						<button
							key={item.value}
							type="button"
							role="radio"
							aria-checked={draft.sortBy === item.value}
							className={clsx(classes.radio, { [classes.radioOn]: draft.sortBy === item.value })}
							onClick={() => setDraft((prev) => ({ ...prev, sortBy: item.value }))}
						>
							<span className={classes.radioDot} />
							{item.label}
						</button>
					))}
				</div>

				<div className={classes.label}>Level</div>
				<Select
					allowClear
					value={draft.level}
					placeholder="Choose level"
					options={BOOK_LEVELS.map((item) => ({ value: item.toLowerCase(), label: item }))}
					onChange={(level) => setDraft((prev) => ({ ...prev, level }))}
					className={classes.select}
				/>

				<div className={classes.label}>Categories</div>
				<Select
					allowClear
					showSearch
					value={draft.category}
					placeholder="Choose categories"
					options={(library?.categories || [])
						.map((item) => item.title || '')
						.filter(Boolean)
						.map((title) => ({ value: title, label: title }))}
					onChange={(category) => setDraft((prev) => ({ ...prev, category }))}
					className={classes.select}
				/>

				<button
					type="button"
					className={classes.primary}
					onClick={() => {
						onApply(draft)
						onClose()
					}}
				>
					Done
				</button>
			</div>
		</CModal>
	)
}

export default memo(ContributeFilterModal)
