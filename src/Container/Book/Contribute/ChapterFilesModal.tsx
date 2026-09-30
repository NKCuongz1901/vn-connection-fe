'use client'

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { IconFileTypeDocx, IconFileUpload, IconMusic, IconWand } from '@tabler/icons-react'
import { Tooltip } from 'antd'
import clsx from 'clsx'
import { toast } from 'react-toastify'

import {
	ChapterLanguageFile,
	ChapterProcessStatus,
	ContributedChapter,
	DOCX_MIME,
	editPublishedChapter,
	EditPublishedAction,
	getChapterProcessStatus,
	uploadChapterDocument,
} from '@/apis/book/contributeApis'
import { parseApiObject } from '@/apis/book/bookApis'
import { handleUploadAudio } from '@/apis/uploadApis'
import CModal from '@/Components/Custom/CModal/CModal'
import { useModal } from '@/context/ModalContext'
import { formatPlaybackTime } from '@/Variable/book.variable'

import ChapterTextPreview from './ChapterTextPreview'
import classes from './BookContribute.module.scss'

type ChapterFilesModalProps = {
	open: boolean
	chapter: ContributedChapter | null
	published: boolean
	onClose: () => void
	/** a file was redone or replaced (a published chapter is unpublished by the API) */
	onChanged: () => void
	onPublish: (chapter: ContributedChapter) => Promise<void>
	onUnpublish: (chapter: ContributedChapter) => void
}

const languageName = (code?: string | null) => {
	if (!code) return ''
	try {
		return new Intl.DisplayNames(['en'], { type: 'language' }).of(code.split('-')[0]) || code
	} catch {
		return code
	}
}

// "en-us" → "US", "vi-south" → "South"
const variantName = (file: ChapterLanguageFile) => {
	const variant = file.language_variant?.split('-').slice(1).join(' ')
	if (!variant) return ''
	return variant.length <= 3 ? variant.toUpperCase() : variant[0].toUpperCase() + variant.slice(1)
}

const STATUS_LABEL: Record<string, string> = {
	success: 'Ready',
	pending_text: 'Waiting for translation',
	pending_audio: 'Waiting for audio',
	failed_text: 'Translation failed',
	failed_audio: 'Audio failed',
}

const statusLabel = (status?: string) =>
	(status && STATUS_LABEL[status]) || (status ? 'In progress' : '')

const isFailed = (status?: string) => Boolean(status?.startsWith('failed'))

type PendingUpload = { file: ChapterLanguageFile; kind: 'text' | 'audio' }

/**
 * The files of a multilingual chapter, by language: its text and audio, each with a
 * preview, redo and replace; then publish or unpublish the chapter
 */
function ChapterFilesModal({
	open,
	chapter,
	published,
	onClose,
	onChanged,
	onPublish,
	onUnpublish,
}: ChapterFilesModalProps) {
	const { openConfirm, closeModal } = useModal()
	const docRef = useRef<HTMLInputElement>(null)
	const audioRef = useRef<HTMLInputElement>(null)
	const [status, setStatus] = useState<ChapterProcessStatus | null>(null)
	const [loading, setLoading] = useState(false)
	const [busyId, setBusyId] = useState<string>('')
	const [pending, setPending] = useState<PendingUpload | null>(null)
	const [uploadError, setUploadError] = useState<PendingUpload | null>(null)
	const [previewLang, setPreviewLang] = useState('')
	const [playing, setPlaying] = useState('')
	const [publishing, setPublishing] = useState(false)

	const load = useCallback(() => {
		if (!chapter?.id) return Promise.resolve()
		setLoading(true)
		return getChapterProcessStatus(chapter.id)
			.then((res) => setStatus(parseApiObject<ChapterProcessStatus>(res)))
			.catch(() => setStatus(null))
			.finally(() => setLoading(false))
	}, [chapter?.id])

	useEffect(() => {
		if (!open) return
		setStatus(null)
		setPlaying('')
		load()
	}, [load, open])

	const groups = useMemo(() => {
		const map = new Map<string, ChapterLanguageFile[]>()
		;(status?.audio_details || []).forEach((file) => {
			const key = file.language || ''
			map.set(key, [...(map.get(key) || []), file])
		})
		return Array.from(map.entries())
	}, [status])

	if (!open || !chapter?.id) return null
	const chapterId = chapter.id

	const run = async (file: ChapterLanguageFile, action: EditPublishedAction, url?: string) => {
		if (!file.id) return
		setBusyId(file.id)
		try {
			await editPublishedChapter(chapterId, {
				action,
				book_audio_id: file.id,
				...(action === 'force_update_text' ? { docx_url: url } : {}),
				...(action === 'force_update_audio' ? { audio_url: url } : {}),
			})
			toast.success(action.startsWith('regenerate') ? 'Started again, this can take a while' : 'File replaced')
			onChanged()
			await load()
		} catch (error) {
			const message = String((error as { message?: string })?.message || '')
			if (action === 'force_update_text' && /validation/i.test(message)) {
				setUploadError({ file, kind: 'text' })
			} else if (/in progress/i.test(message)) {
				toast.error('This language is still being made. Try again when it is done.')
			} else {
				toast.error('Something went wrong. Please try again.')
			}
		} finally {
			setBusyId('')
		}
	}

	const redo = (file: ChapterLanguageFile, kind: 'text' | 'audio') => {
		openConfirm({
			titleLabel: kind === 'text' ? 'Translate again' : 'Make the audio again',
			message: `${languageName(file.language)}${variantName(file) ? ` (${variantName(file)})` : ''}: ${
				kind === 'text' ? 'the text is translated again and a new audio is made.' : 'a new audio is made from the text.'
			}${published ? ' The chapter is unpublished until you publish it again.' : ''}`,
			confirmLabel: 'Start',
			cancelLabel: 'Cancel',
			onAccept: () => {
				closeModal()
				run(file, kind === 'text' ? 'regenerate_text' : 'regenerate_audio')
			},
		})
	}

	const pickFile = (file: ChapterLanguageFile, kind: 'text' | 'audio') => {
		setPending({ file, kind })
		;(kind === 'text' ? docRef : audioRef).current?.click()
	}

	const onPicked = async (files: FileList | null) => {
		const picked = files?.[0]
		const target = pending
		setPending(null)
		if (!picked || !target?.file.id) return
		if (target.kind === 'text' && !(picked.type === DOCX_MIME || picked.name.toLowerCase().endsWith('.docx'))) {
			toast.error('Please choose a .docx file')
			return
		}
		if (target.kind === 'audio' && !picked.type.startsWith('audio/')) {
			toast.error('Please choose an audio file')
			return
		}
		setBusyId(target.file.id)
		try {
			const url =
				target.kind === 'text' ? await uploadChapterDocument(picked) : await handleUploadAudio(picked)
			await run(target.file, target.kind === 'text' ? 'force_update_text' : 'force_update_audio', url)
		} catch {
			toast.error('Could not upload the file')
			setBusyId('')
		}
	}

	const ready = Boolean(status?.ready_to_publish)
	const percent = status?.percentage_complete

	const publishNow = async () => {
		if (publishing) return
		setPublishing(true)
		try {
			await onPublish(chapter)
			onClose()
		} finally {
			setPublishing(false)
		}
	}

	return (
		<>
			<CModal
				open
				centered
				title={published ? 'Published' : 'Unpublished'}
				footer={null}
				onCancel={onClose}
				styles={{
					content: { width: 560, maxWidth: 'calc(100vw - 32px)' },
					body: { maxHeight: 'calc(100vh - 220px)', overflowY: 'auto' },
				}}
			>
				<div className={classes.form}>
					<div className={classes.hint}>
						All files of &ldquo;{chapter.title || 'this chapter'}&rdquo;
						{published ? '. Redoing or replacing a file unpublishes the chapter until you publish it again.' : '.'}
					</div>
					{loading && !status ? <div className={classes.empty}>Loading…</div> : null}
					{!loading && !groups.length ? <div className={classes.empty}>No files yet.</div> : null}
					{groups.map(([language, files]) => {
						const textFile = files[0]
						return (
							<div key={language} className={classes.fileGroup}>
								<div className={classes.fileLang}>{languageName(language)}</div>
								<FileRow
									icon={<IconFileTypeDocx size={20} stroke={1.5} />}
									name="Text"
									status={statusLabel(textFile.status)}
									failed={textFile.status === 'failed_text'}
									busy={busyId === textFile.id}
									onPreview={() => setPreviewLang(language)}
									onRedo={() => redo(textFile, 'text')}
									onReplace={() => pickFile(textFile, 'text')}
									replaceLabel="Replace the text (.docx)"
								/>
								{files.map((file) => (
									<div key={file.id}>
										<FileRow
											icon={<IconMusic size={20} stroke={1.5} />}
											name={`Audio${variantName(file) ? ` - ${variantName(file)}` : ''}`}
											status={
												file.duration && file.status === 'success'
													? formatPlaybackTime(file.duration)
													: statusLabel(file.status)
											}
											failed={isFailed(file.status)}
											busy={busyId === file.id}
											onPreview={
												file.url ? () => setPlaying((prev) => (prev === file.id ? '' : file.id || '')) : undefined
											}
											previewLabel={playing === file.id ? 'Hide' : 'Preview'}
											onRedo={() => redo(file, 'audio')}
											onReplace={() => pickFile(file, 'audio')}
											replaceLabel="Replace the audio"
										/>
										{playing === file.id && file.url ? (
											// eslint-disable-next-line jsx-a11y/media-has-caption
											<audio className={classes.fileAudio} src={file.url} controls autoPlay />
										) : null}
									</div>
								))}
							</div>
						)
					})}
					{published ? (
						<button type="button" className={classes.primary} onClick={() => onUnpublish(chapter)}>
							Unpublish now
						</button>
					) : (
						<button
							type="button"
							className={classes.primary}
							onClick={publishNow}
							disabled={!ready || publishing}
						>
							{publishing
								? 'Publishing…'
								: ready
									? 'Publish now'
									: `Publish when ready${percent !== undefined ? ` (${percent}%)` : ''}`}
						</button>
					)}
				</div>
				<input
					ref={docRef}
					type="file"
					accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
					hidden
					onChange={(event) => {
						onPicked(event.target.files)
						event.target.value = ''
					}}
				/>
				<input
					ref={audioRef}
					type="file"
					accept="audio/*"
					hidden
					onChange={(event) => {
						onPicked(event.target.files)
						event.target.value = ''
					}}
				/>
			</CModal>

			<CModal
				open={Boolean(uploadError)}
				centered
				footer={null}
				onCancel={() => setUploadError(null)}
				styles={{ content: { width: 400, maxWidth: 'calc(100vw - 32px)' } }}
			>
				<div className={classes.thanks}>
					<IconFileUpload size={56} className={classes.statusRejected} />
					<div className={classes.thanksTitle}>Upload error</div>
					<div className={classes.emptyHint}>
						This file doesn&apos;t match the previous one. The number of sentences must remain the same.
					</div>
					<button
						type="button"
						className={classes.primary}
						onClick={() => {
							const target = uploadError
							setUploadError(null)
							if (target) pickFile(target.file, target.kind)
						}}
					>
						Replace file
					</button>
				</div>
			</CModal>

			<ChapterTextPreview
				open={Boolean(previewLang)}
				chapterId={chapterId}
				language={previewLang}
				title={chapter.title}
				onClose={() => setPreviewLang('')}
			/>
		</>
	)
}

type FileRowProps = {
	icon: React.ReactNode
	name: string
	status: string
	failed?: boolean
	busy?: boolean
	onPreview?: () => void
	previewLabel?: string
	onRedo: () => void
	onReplace: () => void
	replaceLabel: string
}

function FileRow({
	icon,
	name,
	status,
	failed,
	busy,
	onPreview,
	previewLabel = 'Preview',
	onRedo,
	onReplace,
	replaceLabel,
}: FileRowProps) {
	return (
		<div className={classes.fileRow}>
			<span className={classes.fileIcon}>{icon}</span>
			<span className={classes.fileCopy}>
				<span className={classes.rowTitle}>{name}</span>
				<span className={clsx(classes.fileStatus, { [classes.statusRejected]: failed })}>
					{busy ? 'Working…' : status}
				</span>
				{onPreview ? (
					<button type="button" className={classes.filePreview} onClick={onPreview}>
						{previewLabel}
					</button>
				) : null}
			</span>
			<Tooltip title="Redo">
				<button type="button" className={classes.fileAction} onClick={onRedo} disabled={busy} aria-label="Redo">
					<IconWand size={18} />
				</button>
			</Tooltip>
			<Tooltip title={replaceLabel}>
				<button
					type="button"
					className={classes.fileAction}
					onClick={onReplace}
					disabled={busy}
					aria-label={replaceLabel}
				>
					<IconFileUpload size={18} />
				</button>
			</Tooltip>
		</div>
	)
}

export default memo(ChapterFilesModal)
