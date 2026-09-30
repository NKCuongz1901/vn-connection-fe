'use client'

import { memo, useEffect, useState } from 'react'
import { IconX } from '@tabler/icons-react'
import { Select } from 'antd'

import { MAX_SET_WORDS, VOCAB_LANGUAGES } from '@/apis/book/vocabApis'
import CModal from '@/Components/Custom/CModal/CModal'

import { languageName } from './SetLanguagesModal'
import classes from './Vocabulary.module.scss'

/**
 * Create Vocabulary List: the set's words as tags (type and separate with commas),
 * up to 50, and the language they are translated to
 */
function VocabListModal({
	open,
	sourceLanguage,
	words,
	nativeLanguage,
	onClose,
	onSave,
}: {
	open: boolean
	sourceLanguage: string
	/** the set's current words */
	words: string[]
	nativeLanguage: string
	onClose: () => void
	onSave: (words: string[], native: string) => Promise<void>
}) {
	const [tags, setTags] = useState<string[]>(words)
	const [draft, setDraft] = useState('')
	const [native, setNative] = useState(nativeLanguage)
	const [saving, setSaving] = useState(false)

	useEffect(() => {
		if (!open) return
		setTags(words)
		setDraft('')
		setNative(nativeLanguage)
	}, [nativeLanguage, open, words])

	const full = tags.length >= MAX_SET_WORDS

	const addFrom = (value: string) => {
		const parts = value
			.split(',')
			.map((item) => item.trim())
			.filter(Boolean)
		if (!parts.length) return
		setTags((prev) => {
			const next = [...prev]
			parts.forEach((part) => {
				if (next.length < MAX_SET_WORDS && !next.some((item) => item.toLowerCase() === part.toLowerCase())) {
					next.push(part)
				}
			})
			return next
		})
	}

	const onChange = (value: string) => {
		if (value.includes(',')) {
			const lastComma = value.lastIndexOf(',')
			addFrom(value.slice(0, lastComma))
			setDraft(value.slice(lastComma + 1))
		} else {
			setDraft(value)
		}
	}

	const save = async () => {
		if (saving) return
		const finalTags = [...tags]
		const pending = draft.trim()
		if (pending && finalTags.length < MAX_SET_WORDS) finalTags.push(pending)
		setSaving(true)
		try {
			await onSave(finalTags, native)
			onClose()
		} catch {
			// the caller shows the error
		} finally {
			setSaving(false)
		}
	}

	return (
		<CModal
			open={open}
			centered
			title="Create Vocabulary List"
			footer={null}
			onCancel={onClose}
			styles={{
				content: { width: 560, maxWidth: 'calc(100vw - 32px)' },
				body: { maxHeight: 'calc(100vh - 220px)', overflowY: 'auto' },
			}}
		>
			<div className={classes.formCol}>
				<div className={classes.fieldLabel}>
					Add learning words <span className={classes.greenText}>({languageName(sourceLanguage)})</span>
				</div>
				<div className={classes.pageHint}>Separate the words with commas.</div>
				<input
					className={classes.textInput}
					value={draft}
					placeholder={full ? 'Word limit reached, remove to add more' : 'Enter your word'}
					disabled={full}
					onChange={(event) => onChange(event.target.value)}
					onKeyDown={(event) => {
						if (event.key === 'Enter') {
							addFrom(draft)
							setDraft('')
						} else if (event.key === 'Backspace' && !draft && tags.length) {
							setTags((prev) => prev.slice(0, -1))
						}
					}}
					onBlur={() => {
						addFrom(draft)
						setDraft('')
					}}
				/>
				<div className={classes.fieldCount}>
					{tags.length}/{MAX_SET_WORDS} words
				</div>
				{tags.length ? (
					<div className={classes.tags}>
						{tags.map((tag) => (
							<span key={tag} className={classes.tag}>
								{tag}
								<button
									type="button"
									onClick={() => setTags((prev) => prev.filter((item) => item !== tag))}
									aria-label={`Remove ${tag}`}
								>
									<IconX size={12} />
								</button>
							</span>
						))}
					</div>
				) : null}

				<div className={classes.fieldLabel}>Your native language</div>
				<div className={classes.pageHint}>or the language you want your words translated to</div>
				<Select
					value={native || undefined}
					placeholder="Select your language"
					options={VOCAB_LANGUAGES.filter((code) => code !== sourceLanguage).map((code) => ({
						value: code,
						label: languageName(code),
					}))}
					onChange={setNative}
					className={classes.fullSelect}
				/>

				<div className={classes.modalActions}>
					<button type="button" className={classes.secondaryBtn} onClick={onClose}>
						Cancel
					</button>
					<button
						type="button"
						className={classes.primaryBtn}
						onClick={save}
						disabled={saving || !native || (!tags.length && !draft.trim())}
					>
						{saving ? 'Saving…' : 'Save'}
					</button>
				</div>
			</div>
		</CModal>
	)
}

export default memo(VocabListModal)
