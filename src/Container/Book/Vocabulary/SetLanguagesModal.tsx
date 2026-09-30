'use client'

import { memo, useEffect, useState } from 'react'
import { Checkbox } from 'antd'

import { VOCAB_LANGUAGES } from '@/apis/book/vocabApis'
import CModal from '@/Components/Custom/CModal/CModal'

import classes from './Vocabulary.module.scss'

const MAX_EXTRA = 3

export const languageName = (code: string) => {
	try {
		return new Intl.DisplayNames(['en'], { type: 'language' }).of(code) || code
	} catch {
		return code
	}
}

/** Pick the extra languages shown next to each word of a set (the words' and native languages stay) */
function SetLanguagesModal({
	open,
	value,
	exclude,
	onClose,
	onSave,
}: {
	open: boolean
	value: string[]
	/** the words' language and the native language */
	exclude: string[]
	onClose: () => void
	onSave: (languages: string[]) => Promise<void>
}) {
	const [picked, setPicked] = useState<string[]>(value)
	const [saving, setSaving] = useState(false)

	useEffect(() => {
		if (open) setPicked(value)
	}, [open, value])

	const options = VOCAB_LANGUAGES.filter((code) => !exclude.includes(code))

	const toggle = (code: string) =>
		setPicked((prev) =>
			prev.includes(code) ? prev.filter((item) => item !== code) : prev.length < MAX_EXTRA ? [...prev, code] : prev,
		)

	return (
		<CModal
			open={open}
			centered
			title="Add language"
			footer={null}
			onCancel={onClose}
			styles={{ content: { width: 420, maxWidth: 'calc(100vw - 32px)' } }}
		>
			<div className={classes.langList}>
				<div className={classes.pageHint}>Show up to {MAX_EXTRA} more languages next to each word.</div>
				{options.map((code) => (
					<label key={code} className={classes.langItem}>
						<Checkbox
							checked={picked.includes(code)}
							disabled={!picked.includes(code) && picked.length >= MAX_EXTRA}
							onChange={() => toggle(code)}
						/>
						<span>{languageName(code)}</span>
					</label>
				))}
				<button
					type="button"
					className={classes.primaryBtn}
					disabled={saving}
					onClick={async () => {
						setSaving(true)
						try {
							await onSave(picked)
							onClose()
						} finally {
							setSaving(false)
						}
					}}
				>
					{saving ? 'Saving…' : 'Save'}
				</button>
			</div>
		</CModal>
	)
}

export default memo(SetLanguagesModal)
