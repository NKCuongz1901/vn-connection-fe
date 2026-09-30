'use client'

import { memo, useEffect, useState } from 'react'

import CModal from '@/Components/Custom/CModal/CModal'

import classes from './Vocabulary.module.scss'

const MAX_NAME = 30

/** Name a new vocab folder, or rename one */
function FolderNameModal({
	open,
	title,
	initial = '',
	onClose,
	onSave,
}: {
	open: boolean
	title: string
	initial?: string
	onClose: () => void
	onSave: (name: string) => Promise<void>
}) {
	const [name, setName] = useState(initial)
	const [saving, setSaving] = useState(false)

	useEffect(() => {
		if (open) setName(initial)
	}, [initial, open])

	const save = async () => {
		if (!name.trim() || saving) return
		setSaving(true)
		try {
			await onSave(name.trim())
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
			title={title}
			footer={null}
			onCancel={onClose}
			styles={{ content: { width: 420, maxWidth: 'calc(100vw - 32px)' } }}
		>
			<div className={classes.formCol}>
				<label className={classes.fieldLabel} htmlFor="vocab-folder-name">
					Folder name
				</label>
				<input
					id="vocab-folder-name"
					className={classes.textInput}
					value={name}
					maxLength={MAX_NAME}
					placeholder="Enter folder name"
					onChange={(event) => setName(event.target.value)}
					onKeyDown={(event) => event.key === 'Enter' && save()}
					autoFocus
				/>
				<div className={classes.fieldCount}>
					{name.length}/{MAX_NAME}
				</div>
				<div className={classes.modalActions}>
					<button type="button" className={classes.secondaryBtn} onClick={onClose}>
						Cancel
					</button>
					<button type="button" className={classes.primaryBtn} onClick={save} disabled={!name.trim() || saving}>
						{saving ? 'Saving…' : 'Save'}
					</button>
				</div>
			</div>
		</CModal>
	)
}

export default memo(FolderNameModal)
