'use client'

import { memo, useEffect, useState } from 'react'
import { IconChevronLeft, IconChevronRight, IconX } from '@tabler/icons-react'
import { Modal } from 'antd'

import { getChapterContentByPage, parseChapterPage, pickContentPart } from '@/apis/book/chapterApis'
import { ChapterPage } from '@/interface/Book/book.interface'

import classes from './BookContribute.module.scss'

type ChapterTextPreviewProps = {
	open: boolean
	chapterId?: string
	/** the language of the text to show, e.g. "en" or "vi" */
	language: string
	title?: string
	onClose: () => void
}

/** Full-screen preview of a chapter's text in one language, page by page */
function ChapterTextPreview({ open, chapterId, language, title, onClose }: ChapterTextPreviewProps) {
	const [page, setPage] = useState(1)
	const [data, setData] = useState<ChapterPage | null>(null)
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		if (open) setPage(1)
	}, [open, chapterId, language])

	useEffect(() => {
		if (!open || !chapterId) return
		let cancelled = false
		setLoading(true)
		// the pages may be stored under the language or one of its accents, as in the reader
		const main = language.split('-')[0]
		const candidates = Array.from(
			new Set([language, main, ...(main === 'en' ? ['en-gb', 'en-us'] : []), ...(main === 'vi' ? ['vi-south', 'vi-north'] : [])]),
		)
		const loadPage = async () => {
			let next: ChapterPage | null = null
			for (const lang of candidates) {
				try {
					next = parseChapterPage(await getChapterContentByPage(chapterId, page, lang))
				} catch {
					next = null
				}
				if (next?.content?.length) break
			}
			if (!cancelled) {
				setData(next)
				setLoading(false)
			}
		}
		loadPage()
		return () => {
			cancelled = true
		}
	}, [chapterId, language, open, page])

	const totalPages = data?.total_pages || 1
	const paragraphs = (data?.content || [])
		.map((item) => pickContentPart(item.parts, language)?.text?.trim())
		.filter((text): text is string => Boolean(text))

	return (
		<Modal
			open={open}
			onCancel={onClose}
			footer={null}
			closable={false}
			width="100vw"
			centered
			styles={{ content: { padding: 0, background: 'transparent', boxShadow: 'none' } }}
			className={classes.previewModal}
		>
			<div className={classes.preview}>
				<div className={classes.previewHead}>
					<button type="button" className={classes.previewIcon} onClick={onClose} aria-label="Close preview">
						<IconX size={18} />
					</button>
					<div className={classes.previewTitle}>
						<span>{title || 'UniVini'}</span>
						<b>Preview</b>
					</div>
					<span className={classes.previewLang}>{language.toUpperCase()}</span>
				</div>
				<div className={classes.previewBody}>
					{loading ? (
						<p>Loading…</p>
					) : paragraphs.length ? (
						paragraphs.map((text, index) => <p key={index}>{text}</p>)
					) : (
						<p>The text for this language is not ready yet.</p>
					)}
				</div>
				{totalPages > 1 ? (
					<div className={classes.previewPager}>
						<button
							type="button"
							className={classes.previewIcon}
							onClick={() => setPage((prev) => Math.max(1, prev - 1))}
							disabled={page <= 1 || loading}
							aria-label="Previous page"
						>
							<IconChevronLeft size={18} />
						</button>
						<span>
							Page {page}/{totalPages}
						</span>
						<button
							type="button"
							className={classes.previewIcon}
							onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
							disabled={page >= totalPages || loading}
							aria-label="Next page"
						>
							<IconChevronRight size={18} />
						</button>
					</div>
				) : null}
			</div>
		</Modal>
	)
}

export default memo(ChapterTextPreview)
