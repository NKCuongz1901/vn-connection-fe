'use client'

import { memo, useEffect, useRef, useState } from 'react'
import { IconBook2, IconFileTypeDocx, IconPhotoPlus, IconX } from '@tabler/icons-react'
import clsx from 'clsx'
import { toast } from 'react-toastify'

import {
	ContributedChapter,
	createMultilingualChapter,
	createSingleLanguageChapter,
	DOCX_MIME,
	updateSingleLanguageChapter,
	uploadChapterDocument,
} from '@/apis/book/contributeApis'
import { handleUploadImage } from '@/apis/uploadApis'
import CModal from '@/Components/Custom/CModal/CModal'

import classes from './BookContribute.module.scss'

const LIMITS = { title: 45, summary: 500 }
const MAX_DOC_MB = 20

type CreateChapterModalProps = {
	open: boolean
	bookId: string
	/** the book's language, shown above the docx picker */
	languageLabel: string
	/** multilingual books upload the English docx; the rest is translated */
	multilingual?: boolean
	/** a rejected chapter to edit and resubmit */
	chapter?: ContributedChapter | null
	onClose: () => void
	onCreated: () => void
}

const isDocx = (file: File) =>
	file.type === DOCX_MIME || file.name.toLowerCase().endsWith('.docx')

/**
 * Create a chapter (optional thumbnail, title and summary, and the chapter docx),
 * or edit a rejected one and resubmit it
 */
function CreateChapterModal({
	open,
	bookId,
	languageLabel,
	multilingual,
	chapter,
	onClose,
	onCreated,
}: CreateChapterModalProps) {
	const isEdit = Boolean(chapter?.id)
	const imageRef = useRef<HTMLInputElement>(null)
	const docRef = useRef<HTMLInputElement>(null)
	const [thumbFile, setThumbFile] = useState<File | null>(null)
	const [thumbPreview, setThumbPreview] = useState('')
	const [title, setTitle] = useState('')
	const [summary, setSummary] = useState('')
	const [docFile, setDocFile] = useState<File | null>(null)
	const [tutorialOpen, setTutorialOpen] = useState(false)
	const [saving, setSaving] = useState(false)

	useEffect(() => {
		if (!open) return
		setThumbFile(null)
		setTitle(chapter?.title || '')
		setSummary(chapter?.description || '')
		setDocFile(null)
	}, [chapter, open])

	useEffect(() => {
		if (!thumbFile) {
			setThumbPreview(open ? chapter?.cover_image || '' : '')
			return
		}
		const url = URL.createObjectURL(thumbFile)
		setThumbPreview(url)
		return () => URL.revokeObjectURL(url)
	}, [chapter?.cover_image, open, thumbFile])

	if (!open) return null

	const onPickThumb = (files: FileList | null) => {
		const file = files?.[0]
		if (!file) return
		if (!file.type.startsWith('image/')) {
			toast.error('Please choose an image')
			return
		}
		setThumbFile(file)
	}

	const onPickDoc = (files: FileList | null) => {
		const file = files?.[0]
		if (!file) return
		if (!isDocx(file)) {
			toast.error('Please choose a .docx file')
			return
		}
		if (file.size > MAX_DOC_MB * 1024 * 1024) {
			toast.error(`The file must be ${MAX_DOC_MB} MB or smaller`)
			return
		}
		setDocFile(file)
	}

	// a new chapter needs its docx; a resubmitted one keeps the old file unless replaced
	const canSubmit = isEdit || Boolean(docFile)

	const submit = async () => {
		if (!canSubmit || saving) return
		setSaving(true)
		try {
			const [docUrl, thumbnail] = await Promise.all([
				docFile ? uploadChapterDocument(docFile) : Promise.resolve(''),
				thumbFile ? handleUploadImage(thumbFile) : Promise.resolve(''),
			])
			const details: { title?: string; summary?: string; thumbnail?: string } = {
				...(title.trim() ? { title: title.trim() } : {}),
				...(summary.trim() ? { summary: summary.trim() } : {}),
				...(thumbnail ? { thumbnail } : {}),
			}
			// the API falls back to the book cover when no thumbnail is sent, so keep the chapter's own
			if (isEdit && !thumbnail && thumbPreview && chapter?.cover_image) {
				details.thumbnail = chapter.cover_image
			}
			if (isEdit) {
				await updateSingleLanguageChapter(chapter?.id as string, {
					...details,
					...(docUrl ? { doc_url: docUrl } : {}),
				})
			} else if (multilingual) {
				await createMultilingualChapter({ book_id: bookId, english_doc_url: docUrl, ...details })
			} else {
				await createSingleLanguageChapter({ book_id: bookId, doc_url: docUrl, ...details })
			}
			onCreated()
			onClose()
		} catch (error) {
			const message = (error as { message?: string })?.message
			// the API answers this when the docx has no readable text
			toast.error(
				message && /extract|text/i.test(message)
					? 'We could not read any text in this file. Please check the docx and try again.'
					: 'Something went wrong. Please try again.',
			)
		} finally {
			setSaving(false)
		}
	}

	return (
		<>
			<CModal
				open
				centered
				title={isEdit ? 'Edit chapter' : 'Create chapter'}
				footer={null}
				onCancel={saving ? undefined : onClose}
				styles={{
					content: { width: 640, maxWidth: 'calc(100vw - 32px)' },
					body: { maxHeight: 'calc(100vh - 220px)', overflowY: 'auto' },
				}}
			>
				<div className={classes.form}>
					<div className={classes.hint}>
						{isEdit
							? 'Fix the chapter and send it again. Upload a new DOCX file only if the text changes.'
							: 'If your book has no chapters, just upload a DOCX file.'}
					</div>
					<div className={classes.sectionLabel}>
						CHAPTER THUMBNAIL <span className={classes.optional}>(optional)</span>
					</div>
					<div className={classes.coverRow}>
						{thumbPreview ? (
							<div className={classes.coverPreview}>
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img src={thumbPreview} alt="" />
								<button
									type="button"
									className={classes.coverRemove}
									onClick={() => {
										setThumbFile(null)
										setThumbPreview('')
									}}
									aria-label="Remove thumbnail"
								>
									<IconX size={12} />
								</button>
							</div>
						) : (
							<button type="button" className={classes.coverPick} onClick={() => imageRef.current?.click()}>
								<IconPhotoPlus size={26} stroke={1.5} />
								<span>Upload image</span>
							</button>
						)}
						<input
							ref={imageRef}
							type="file"
							accept="image/*"
							hidden
							onChange={(event) => {
								onPickThumb(event.target.files)
								event.target.value = ''
							}}
						/>
					</div>

					<OptionalField
						label="Chapter title"
						value={title}
						max={LIMITS.title}
						placeholder="Item name"
						onChange={setTitle}
					/>
					<OptionalField
						label="Chapter summary"
						value={summary}
						max={LIMITS.summary}
						placeholder="Describe"
						multiline
						onChange={setSummary}
					/>

					<div className={classes.field}>
						<div className={classes.docHead}>
							<div className={classes.label}>
								{multilingual ? 'Upload Files' : 'Docx file'}{' '}
								{isEdit ? null : <span className={classes.required}>*</span>}
							</div>
							<button type="button" className={classes.tutorial} onClick={() => setTutorialOpen(true)}>
								<IconBook2 size={14} /> Tutorial
							</button>
						</div>
						<div className={classes.sectionLabel}>
							{multilingual ? 'ENGLISH' : languageLabel.toUpperCase()}
						</div>
						{multilingual ? (
							<div className={classes.hint}>
								Upload the chapter in English; it is translated and voiced for every language of the book.
							</div>
						) : null}
						{docFile ? (
							<div className={classes.docFile}>
								<IconFileTypeDocx size={20} stroke={1.5} />
								<span className={classes.docName}>{docFile.name}</span>
								<button
									type="button"
									className={classes.docRemove}
									onClick={() => setDocFile(null)}
									aria-label="Remove file"
									disabled={saving}
								>
									<IconX size={14} />
								</button>
							</div>
						) : (
							<button type="button" className={classes.docPick} onClick={() => docRef.current?.click()}>
								<IconFileTypeDocx size={20} stroke={1.5} />
								<span>{isEdit ? 'Replace the .docx file (optional)' : 'Choose a .docx file'}</span>
							</button>
						)}
						<input
							ref={docRef}
							type="file"
							accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
							hidden
							onChange={(event) => {
								onPickDoc(event.target.files)
								event.target.value = ''
							}}
						/>
					</div>

					<button
						type="button"
						className={classes.primary}
						onClick={submit}
						disabled={!canSubmit || saving}
					>
						{saving ? 'Uploading…' : isEdit ? 'Resubmit' : multilingual ? 'Upload' : 'Next'}
					</button>
				</div>
			</CModal>

			<CModal
				open={tutorialOpen}
				centered
				title="Tutorials"
				footer={null}
				onCancel={() => setTutorialOpen(false)}
				styles={{ content: { width: 560, maxWidth: 'calc(100vw - 32px)' } }}
			>
				<div className={classes.form}>
					<div className={classes.tutorialText}>
						<p>To make sure the chapter is read correctly and approved quickly:</p>
						<ul>
							<li>
								Upload a .docx file (Word) with the whole chapter in{' '}
								{multilingual ? 'English' : languageLabel}.
							</li>
							<li>Write the text as normal paragraphs, one after another.</li>
							<li>Leave out images, tables and headers or footers; only the text is used.</li>
						</ul>
						<p>
							{multilingual
								? 'The chapter is translated into every language of the book and the audio is made for each; this can take a while.'
								: 'The audio is made from the text, and the UniVini team reviews every chapter.'}
						</p>
					</div>
					<button type="button" className={classes.primary} onClick={() => setTutorialOpen(false)}>
						Got it
					</button>
				</div>
			</CModal>
		</>
	)
}

type OptionalFieldProps = {
	label: string
	value: string
	max: number
	placeholder?: string
	multiline?: boolean
	onChange: (value: string) => void
}

function OptionalField({ label, value, max, placeholder, multiline, onChange }: OptionalFieldProps) {
	const Tag = multiline ? 'textarea' : 'input'
	return (
		<div className={classes.field}>
			<div className={classes.label}>
				{label} <span className={classes.optional}>(optional)</span>
			</div>
			<Tag
				className={clsx(classes.input, { [classes.textarea]: multiline })}
				value={value}
				maxLength={max}
				placeholder={placeholder}
				onChange={(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
					onChange(event.target.value)
				}
			/>
			<div className={classes.fieldFoot}>
				<span />
				<span className={classes.counter}>
					{value.length}/{max}
				</span>
			</div>
		</div>
	)
}

export default memo(CreateChapterModal)
