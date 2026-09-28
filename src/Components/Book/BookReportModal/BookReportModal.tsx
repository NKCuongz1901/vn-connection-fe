'use client'

import { memo, useEffect, useState } from 'react'
import clsx from 'clsx'
import { toast } from 'react-toastify'

import { reportBook } from '@/apis/book/bookApis'
import CModal from '@/Components/Custom/CModal/CModal'
import { getUserInfo } from '@/ultis/storage'

import classes from './BookReportModal.module.scss'

// issue_type values accepted by POST book-reports (report_type "book")
const ISSUE_TYPES = [
	{
		value: 'copied_stolen_content',
		label: 'Copied / Stolen Content',
		hint: 'Not original; copied from another source.',
	},
	{
		value: 'inappropriate_content',
		label: 'Inappropriate Content',
		hint: 'Violence, hate, racist, offensive, or adult material.',
	},
	{
		value: 'wrong_irrelevant_content',
		label: 'Wrong / Irrelevant Content',
		hint: 'Off-topic or misleading content.',
	},
	{
		value: 'language_errors',
		label: 'Language Errors',
		hint: 'Spelling, grammar or translation mistakes.',
	},
	{
		value: 'formatting_issues',
		label: 'Formatting Issues',
		hint: 'Broken layout, missing text or images.',
	},
]

const CONTENT_MAX = 1000
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type BookReportModalProps = {
	open: boolean
	bookId: string
	onClose: () => void
}

/** Report a book: issue type, contact email and a description */
function BookReportModal({ open, bookId, onClose }: BookReportModalProps) {
	const [issue, setIssue] = useState('')
	const [email, setEmail] = useState('')
	const [content, setContent] = useState('')
	const [submitting, setSubmitting] = useState(false)

	useEffect(() => {
		if (!open) return
		setIssue('')
		setContent('')
		setEmail(getUserInfo('email') || '')
	}, [open])

	if (!open) return null

	const emailValid = EMAIL_RE.test(email.trim())
	const canSubmit = Boolean(issue) && emailValid && Boolean(content.trim()) && !submitting

	const submit = async () => {
		if (!canSubmit) return
		setSubmitting(true)
		try {
			await reportBook({
				report_target_id: bookId,
				issue_type: issue,
				email: email.trim(),
				content: content.trim(),
			})
			toast.success('Report submitted successfully.')
			onClose()
		} catch {
			toast.error('Something went wrong. Please try again.')
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<CModal
			open
			centered
			title="Report"
			footer={null}
			onCancel={onClose}
			styles={{ content: { width: 560, maxWidth: 'calc(100vw - 32px)' } }}
		>
			<div className={classes.body}>
				<div className={classes.label}>Type of issue</div>
				<div className={classes.options} role="radiogroup">
					{ISSUE_TYPES.map((item) => (
						<button
							key={item.value}
							type="button"
							role="radio"
							aria-checked={issue === item.value}
							className={clsx(classes.option, {
								[classes.optionActive]: issue === item.value,
							})}
							onClick={() => setIssue(item.value)}
						>
							<span className={classes.radio} />
							<span>
								<span className={classes.optionLabel}>{item.label}</span>
								<span className={classes.optionHint}>{item.hint}</span>
							</span>
						</button>
					))}
				</div>

				<label className={classes.label} htmlFor="book-report-email">
					Email
				</label>
				<input
					id="book-report-email"
					className={clsx(classes.input, {
						[classes.invalid]: Boolean(email) && !emailValid,
					})}
					type="email"
					value={email}
					placeholder="Your email"
					onChange={(event) => setEmail(event.target.value)}
				/>

				<label className={classes.label} htmlFor="book-report-content">
					Tell us your issue
				</label>
				<textarea
					id="book-report-content"
					className={classes.textarea}
					value={content}
					maxLength={CONTENT_MAX}
					placeholder="Please describe the issue in detail"
					onChange={(event) => setContent(event.target.value)}
				/>
				<div className={classes.counter}>
					{content.length}/{CONTENT_MAX}
				</div>

				<button
					type="button"
					className={classes.submit}
					disabled={!canSubmit}
					onClick={submit}
				>
					{submitting ? 'Submitting…' : 'Submit'}
				</button>
			</div>
		</CModal>
	)
}

export default memo(BookReportModal)
