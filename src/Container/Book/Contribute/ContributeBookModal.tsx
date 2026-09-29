'use client'

import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { IconClock, IconPhotoPlus, IconX } from '@tabler/icons-react'
import { Select } from 'antd'
import clsx from 'clsx'
import { toast } from 'react-toastify'

import {
	BookLanguageOption,
	ContributedBook,
	createContributedBook,
	getContributeLanguages,
	updateContributedBook,
} from '@/apis/book/contributeApis'
import { handleUploadImage } from '@/apis/uploadApis'
import { getUserProfile } from '@/apis/userApis'
import CModal from '@/Components/Custom/CModal/CModal'
import { useOptionalBookLibrary } from '@/context/BookLibraryContext'
import { BOOK_LEVELS } from '@/Variable/book.variable'

import classes from './BookContribute.module.scss'

const LIMITS = { title: 45, author: 80, summary: 500 }
const MIN_LENGTH = 4
// the app hides this one from the category picker; it is added for user books
const HIDDEN_CATEGORY = 'contributed by users'

type ContributeBookModalProps = {
	open: boolean
	/** the book to edit; empty to create one */
	book?: ContributedBook | null
	onClose: () => void
	onSaved: (book: ContributedBook | null) => void
}

type LanguageType = 'single' | 'bilingual'

const fieldError = (value: string) =>
	!value.trim()
		? 'Please enter a valid name'
		: value.trim().length < MIN_LENGTH
			? `Please enter at least ${MIN_LENGTH} letters`
			: ''

/** Contribute (create) or edit a book: cover, details, category, language and level */
function ContributeBookModal({ open, book, onClose, onSaved }: ContributeBookModalProps) {
	const library = useOptionalBookLibrary()
	const fileRef = useRef<HTMLInputElement>(null)
	const isEdit = Boolean(book?.id)

	const [coverFile, setCoverFile] = useState<File | null>(null)
	const [coverPreview, setCoverPreview] = useState('')
	const [title, setTitle] = useState('')
	const [author, setAuthor] = useState('')
	const [summary, setSummary] = useState('')
	const [categories, setCategories] = useState<string[]>([])
	const [languageType, setLanguageType] = useState<LanguageType>('single')
	const [singleLanguage, setSingleLanguage] = useState<string | undefined>()
	const [level, setLevel] = useState<string | undefined>()
	const [languages, setLanguages] = useState<BookLanguageOption[]>([])
	const [isDev, setIsDev] = useState(false)
	const [touched, setTouched] = useState(false)
	const [saving, setSaving] = useState(false)

	useEffect(() => {
		if (!open) return
		setCoverFile(null)
		setCoverPreview(book?.cover_image || '')
		setTitle(book?.title || '')
		setAuthor(book?.author || '')
		setSummary(book?.summary || '')
		setCategories(
			(book?.category || []).filter((item) => item.toLowerCase() !== HIDDEN_CATEGORY),
		)
		const bookLanguages = book?.language || []
		setLanguageType(
			book?.language_type === 'bilingual' || bookLanguages.length > 1 ? 'bilingual' : 'single',
		)
		setSingleLanguage(bookLanguages.length === 1 ? bookLanguages[0] : undefined)
		setLevel(book?.level ? book.level.toUpperCase() : undefined)
		setTouched(false)
	}, [book, open])

	useEffect(() => {
		if (!open) return
		getContributeLanguages()
			.then(setLanguages)
			.catch(() => setLanguages([]))
		// only dev accounts pick a level; others contribute "native" books (as in the app)
		getUserProfile({ params: {} })
			.then((res) => {
				const profile = (res as { results?: { object?: { is_dev?: boolean } } })?.results?.object
				setIsDev(Boolean(profile?.is_dev))
			})
			.catch(() => setIsDev(false))
	}, [open])

	useEffect(() => {
		if (!coverFile) return
		const url = URL.createObjectURL(coverFile)
		setCoverPreview(url)
		return () => URL.revokeObjectURL(url)
	}, [coverFile])

	const singleOptions = useMemo(
		() => languages.filter((item) => item.type === 'single'),
		[languages],
	)
	const bilingualCodes = useMemo(
		() => languages.filter((item) => item.type === 'bilingual').map((item) => item.code as string),
		[languages],
	)
	const categoryOptions = useMemo(
		() =>
			(library?.categories || [])
				.map((item) => item.title || '')
				.filter((title) => title && title.toLowerCase() !== HIDDEN_CATEGORY)
				.map((title) => ({ value: title, label: title })),
		[library?.categories],
	)

	if (!open) return null

	const errors = {
		cover: coverPreview ? '' : 'Please add a cover',
		title: fieldError(title),
		author: fieldError(author),
		summary: fieldError(summary),
		category: categories.length ? '' : 'Please choose a category',
		language:
			languageType === 'bilingual'
				? bilingualCodes.length || book?.language?.length
					? ''
					: 'No languages available'
				: singleLanguage
					? ''
					: 'Please choose a language',
		level: !isDev || level ? '' : 'Please choose a level',
	}
	const valid = Object.values(errors).every((item) => !item)
	const show = (key: keyof typeof errors) => (touched ? errors[key] : '')

	const onPickCover = (files: FileList | null) => {
		const file = files?.[0]
		if (!file) return
		if (!file.type.startsWith('image/')) {
			toast.error('Please choose an image')
			return
		}
		setCoverFile(file)
	}

	const submit = async () => {
		setTouched(true)
		if (!valid || saving) return
		setSaving(true)
		try {
			const coverUrl = coverFile ? await handleUploadImage(coverFile) : book?.cover_image
			if (!coverUrl) throw new Error('cover upload failed')
			const payload = {
				cover_image: coverUrl,
				title: title.trim(),
				author: author.trim(),
				summary: summary.trim(),
				level: isDev && level ? level.toLowerCase() : book?.level || 'native',
				category: categories,
				language:
					languageType === 'bilingual'
						? isEdit && book?.language?.length
							? book.language
							: bilingualCodes
						: [singleLanguage as string],
				language_type: languageType,
			}
			const res = isEdit
				? await updateContributedBook(book?.id as string, payload)
				: await createContributedBook(payload)
			const saved =
				(res as { results?: { object?: ContributedBook } })?.results?.object || null
			toast.success(isEdit ? 'Book updated' : 'Book created')
			onSaved(saved)
			onClose()
		} catch {
			toast.error('Something went wrong. Please try again.')
		} finally {
			setSaving(false)
		}
	}

	return (
		<CModal
			open
			centered
			title={isEdit ? 'Edit book' : 'Contribute a book'}
			footer={null}
			onCancel={onClose}
			styles={{
				content: { width: 640, maxWidth: 'calc(100vw - 32px)' },
				body: { maxHeight: 'calc(100vh - 220px)', overflowY: 'auto' },
			}}
		>
			<div className={classes.form}>
				<div className={classes.sectionLabel}>
					COVER BOOK <span className={classes.required}>*</span>
				</div>
				<div className={classes.coverRow}>
					{coverPreview ? (
						<div className={classes.coverPreview}>
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img src={coverPreview} alt="" />
							<button
								type="button"
								className={classes.coverRemove}
								onClick={() => {
									setCoverFile(null)
									setCoverPreview('')
								}}
								aria-label="Remove cover"
							>
								<IconX size={12} />
							</button>
						</div>
					) : (
						<button
							type="button"
							className={clsx(classes.coverPick, { [classes.invalid]: show('cover') })}
							onClick={() => fileRef.current?.click()}
						>
							<IconPhotoPlus size={26} stroke={1.5} />
							<span>Add cover</span>
						</button>
					)}
					<input
						ref={fileRef}
						type="file"
						accept="image/*"
						hidden
						onChange={(event) => {
							onPickCover(event.target.files)
							event.target.value = ''
						}}
					/>
				</div>
				{show('cover') ? <div className={classes.error}>{show('cover')}</div> : null}

				<div className={classes.sectionLabel}>BOOK DETAILS</div>

				<TextField
					label="Title"
					value={title}
					max={LIMITS.title}
					error={show('title')}
					onChange={setTitle}
					placeholder="Item name"
				/>
				<TextField
					label="Author"
					value={author}
					max={LIMITS.author}
					error={show('author')}
					onChange={setAuthor}
					placeholder="Item name"
					disabled={isEdit && !isDev}
					hint={isEdit && !isDev ? 'The author cannot be changed after creating the book.' : undefined}
				/>

				<div className={classes.field}>
					<div className={classes.label}>Audio duration</div>
					<div className={clsx(classes.input, classes.readOnly)}>
						<IconClock size={16} /> Auto-detected
					</div>
				</div>

				<TextField
					label="Summary"
					value={summary}
					max={LIMITS.summary}
					error={show('summary')}
					onChange={setSummary}
					placeholder="Describe"
					multiline
				/>

				<div className={classes.field}>
					<div className={classes.label}>
						Category <span className={classes.required}>*</span>
					</div>
					{isDev ? (
						<Select
							mode="multiple"
							value={categories}
							options={categoryOptions}
							onChange={setCategories}
							placeholder="Choose category"
							status={show('category') ? 'error' : undefined}
							className={classes.select}
						/>
					) : (
						<>
							<Select
								value={categories[0]}
								options={categoryOptions}
								onChange={(value: string) => setCategories(value ? [value] : [])}
								placeholder="Choose category"
								status={show('category') ? 'error' : undefined}
								className={classes.select}
							/>
							<div className={classes.hint}>
								Your book is also listed in Contributed by Users.
							</div>
						</>
					)}
					{show('category') ? <div className={classes.error}>{show('category')}</div> : null}
				</div>

				<div className={classes.field}>
					<div className={classes.label}>
						Book&apos;s language <span className={classes.required}>*</span>
					</div>
					<div className={classes.segment}>
						{(['single', 'bilingual'] as const).map((type) => (
							<button
								key={type}
								type="button"
								className={clsx(classes.segmentItem, {
									[classes.segmentActive]: languageType === type,
								})}
								onClick={() => setLanguageType(type)}
								disabled={isEdit || (type === 'bilingual' && !isDev)}
							>
								{type === 'single' ? 'One language' : 'Multilingual'}
							</button>
						))}
					</div>
					{languageType === 'single' ? (
						<Select
							value={singleLanguage}
							options={singleOptions.map((item) => ({ value: item.code, label: item.name }))}
							onChange={setSingleLanguage}
							placeholder="Choose language"
							status={show('language') ? 'error' : undefined}
							className={classes.select}
							showSearch
							optionFilterProp="label"
						/>
					) : (
						<div className={classes.hint}>
							{(isEdit && book?.language?.length ? book.language.length : bilingualCodes.length) ||
								0}{' '}
							languages selected: English with each supported language
						</div>
					)}
					{isEdit ? (
						<div className={classes.hint}>The language type cannot be changed after creating the book.</div>
					) : !isDev ? (
						<div className={classes.hint}>Multilingual books are published by UniVini.</div>
					) : null}
					{show('language') ? <div className={classes.error}>{show('language')}</div> : null}
				</div>

				{isDev ? (
					<div className={classes.field}>
						<div className={classes.label}>
							Level <span className={classes.required}>*</span>
						</div>
						<Select
							value={level}
							options={BOOK_LEVELS.map((item) => ({ value: item, label: item }))}
							onChange={setLevel}
							placeholder="Choose level"
							status={show('level') ? 'error' : undefined}
							className={classes.select}
						/>
						{show('level') ? <div className={classes.error}>{show('level')}</div> : null}
					</div>
				) : null}

				<button
					type="button"
					className={classes.primary}
					onClick={submit}
					disabled={saving}
				>
					{saving ? 'Saving…' : isEdit ? 'Save' : 'Next'}
				</button>
			</div>
		</CModal>
	)
}

type TextFieldProps = {
	label: string
	value: string
	max: number
	error?: string
	placeholder?: string
	multiline?: boolean
	disabled?: boolean
	hint?: string
	onChange: (value: string) => void
}

function TextField({
	label,
	value,
	max,
	error,
	placeholder,
	multiline,
	disabled,
	hint,
	onChange,
}: TextFieldProps) {
	const Tag = multiline ? 'textarea' : 'input'
	return (
		<div className={classes.field}>
			<div className={classes.label}>
				{label} <span className={classes.required}>*</span>
			</div>
			<Tag
				className={clsx(classes.input, {
					[classes.textarea]: multiline,
					[classes.invalid]: error,
					[classes.readOnly]: disabled,
				})}
				value={value}
				disabled={disabled}
				maxLength={max}
				placeholder={placeholder}
				onChange={(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
					onChange(event.target.value)
				}
			/>
			{hint ? <div className={classes.hint}>{hint}</div> : null}
			<div className={classes.fieldFoot}>
				<span className={classes.error}>{error}</span>
				<span className={classes.counter}>
					{value.length}/{max}
				</span>
			</div>
		</div>
	)
}

export default memo(ContributeBookModal)
