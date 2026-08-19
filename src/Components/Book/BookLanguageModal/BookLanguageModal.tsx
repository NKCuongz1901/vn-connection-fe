'use client'

import { memo, useEffect, useMemo, useState } from 'react'

import CModal from '@/Components/Custom/CModal/CModal'
import { findBookLanguage } from '@/apis/book/bookApis'
import { useBookLibrary } from '@/context/BookLibraryContext'
import { BookLanguage } from '@/interface/Book/book.interface'

import classes from './BookLanguageModal.module.scss'

type BookLanguageModalProps = {
	open: boolean
	onClose: () => void
}

function languageLabel(item?: BookLanguage | null, fallback = '') {
	if (!item) return fallback
	return item.name || item.nativeName || item.native_name || item.code || fallback
}

function Flag({ language }: { language?: BookLanguage | null }) {
	if (language?.flag) {
		return <img className={classes.flag} src={language.flag} alt="" />
	}
	const code = (language?.code || '?').slice(0, 2).toUpperCase()
	return <span className={classes.flagFallback}>{code}</span>
}

function LanguageList({
	title,
	hint,
	value,
	options,
	onChange,
}: {
	title: string
	hint?: string
	value: string
	options: BookLanguage[]
	onChange: (code: string) => void
}) {
	const matched = findBookLanguage(options, value)
	return (
		<div className={classes.group}>
			<div className={classes.groupTitle}>{title}</div>
			{hint ? <div className={classes.hint}>{hint}</div> : null}
			<div className={classes.list}>
				{options.map((item) => {
					const code = item.code || ''
					const active =
						matched?.code?.toLowerCase() === code.toLowerCase()
					return (
						<button
							key={code}
							type="button"
							className={`${classes.option} ${active ? classes.active : ''}`}
							onClick={() => onChange(code)}
						>
							<Flag language={item} />
							<span>{languageLabel(item, code)}</span>
						</button>
					)
				})}
			</div>
		</div>
	)
}

function BookLanguageModal({ open, onClose }: BookLanguageModalProps) {
	const { languages, learningLang, nativeLang, setBookLanguages } =
		useBookLibrary()
	const [learning, setLearning] = useState(learningLang)
	const [native, setNative] = useState(nativeLang)
	const [saving, setSaving] = useState(false)

	useEffect(() => {
		if (!open) return
		setLearning(findBookLanguage(languages, learningLang)?.code || learningLang)
		setNative(findBookLanguage(languages, nativeLang)?.code || nativeLang)
	}, [languages, learningLang, nativeLang, open])

	const learningOptions = useMemo(
		() => languages.filter((item) => item.code?.toLowerCase() !== native.toLowerCase()),
		[languages, native],
	)
	const nativeOptions = useMemo(
		() =>
			languages.filter((item) => item.code?.toLowerCase() !== learning.toLowerCase()),
		[languages, learning],
	)

	if (!open) return null

	return (
		<CModal
			open
			centered
			title="Select languages"
			footer={null}
			onCancel={onClose}
			styles={{
				content: {
					width: 480,
					maxWidth: 'calc(100vw - 32px)',
					padding: 24,
					borderRadius: 16,
				},
			}}
		>
			<div className={classes.body}>
				<LanguageList
					title="Learning language"
					hint="Language of the book you are learning"
					value={learning}
					options={learningOptions}
					onChange={setLearning}
				/>
				<LanguageList
					title="Native language"
					hint="Language you want the text translated into"
					value={native}
					options={nativeOptions}
					onChange={setNative}
				/>
				<div className={classes.actions}>
					<button
						type="button"
						className={classes.reset}
						onClick={async () => {
							setSaving(true)
							try {
								await setBookLanguages('en', 'vi')
								onClose()
							} finally {
								setSaving(false)
							}
						}}
					>
						Reset
					</button>
					<button
						type="button"
						className={classes.save}
						disabled={saving || !learning || !native || learning === native}
						onClick={async () => {
							setSaving(true)
							try {
								await setBookLanguages(learning, native)
								onClose()
							} finally {
								setSaving(false)
							}
						}}
					>
						Save
					</button>
				</div>
			</div>
		</CModal>
	)
}

export function BookLanguageButton() {
	const { languages, learningLang, nativeLang } = useBookLibrary()
	const [open, setOpen] = useState(false)
	const learning = findBookLanguage(languages, learningLang)
	const native = findBookLanguage(languages, nativeLang)

	return (
		<>
			<button
				type="button"
				className={classes.trigger}
				onClick={() => setOpen(true)}
			>
				<Flag language={learning} />
				<Flag language={native} />
				<span>
					{languageLabel(learning, learningLang)} ·{' '}
					{languageLabel(native, nativeLang)}
				</span>
			</button>
			<BookLanguageModal open={open} onClose={() => setOpen(false)} />
		</>
	)
}

export default memo(BookLanguageModal)
