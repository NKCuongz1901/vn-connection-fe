'use client'

import { memo, useEffect, useState } from 'react'
import { Checkbox } from 'antd'
import { toast } from 'react-toastify'

import { parseApiList } from '@/apis/book/bookApis'
import { addWordToMyVocabSet, folderWordCount, getMyVocabSets, VocabFolder, VocabWord } from '@/apis/book/vocabApis'
import CModal from '@/Components/Custom/CModal/CModal'

import classes from './Vocabulary.module.scss'

/** Add a searched word to one or more of the reader's sets in the word's language */
function AddToSetModal({ word, onClose }: { word: VocabWord | null; onClose: () => void }) {
	const [sets, setSets] = useState<VocabFolder[]>([])
	const [picked, setPicked] = useState<string[]>([])
	const [loading, setLoading] = useState(false)
	const [saving, setSaving] = useState(false)
	const language = (word?.source_language || 'en').split('-')[0]

	useEffect(() => {
		if (!word) return
		setPicked([])
		setLoading(true)
		getMyVocabSets(100, language)
			.then((res) => setSets(parseApiList<VocabFolder>(res)))
			.catch(() => setSets([]))
			.finally(() => setLoading(false))
	}, [language, word])

	const save = async () => {
		if (!word || !picked.length || saving) return
		setSaving(true)
		const results = await Promise.allSettled(
			picked.map((folderId) => addWordToMyVocabSet(folderId, word.vocab, language)),
		)
		setSaving(false)
		const failed = results.filter((item) => item.status === 'rejected').length
		if (failed) toast.error(failed === picked.length ? 'Could not add the word' : 'Some sets could not be updated')
		else toast.success(`"${word.vocab}" added`)
		onClose()
	}

	return (
		<CModal
			open={Boolean(word)}
			centered
			title="Add your word"
			footer={null}
			onCancel={onClose}
			styles={{ content: { width: 420, maxWidth: 'calc(100vw - 32px)' } }}
		>
			<div className={classes.formCol}>
				<div className={classes.pageHint}>
					Add <b>{word?.vocab}</b> to your vocab sets.
				</div>
				{loading ? (
					<div className={classes.empty}>Loading…</div>
				) : sets.length ? (
					sets.map((folder) => (
						<label key={folder.id} className={classes.langItem}>
							<Checkbox
								checked={picked.includes(folder.id as string)}
								onChange={() =>
									setPicked((prev) =>
										prev.includes(folder.id as string)
											? prev.filter((item) => item !== folder.id)
											: [...prev, folder.id as string],
									)
								}
							/>
							<span>
								{folder.name} <span className={classes.pageHint}>· {folderWordCount(folder)} words</span>
							</span>
						</label>
					))
				) : (
					<div className={classes.empty}>You have no vocab sets in this language yet.</div>
				)}
				<div className={classes.modalActions}>
					<button type="button" className={classes.secondaryBtn} onClick={onClose}>
						Cancel
					</button>
					<button type="button" className={classes.primaryBtn} onClick={save} disabled={!picked.length || saving}>
						{saving ? 'Adding…' : 'Add'}
					</button>
				</div>
			</div>
		</CModal>
	)
}

export default memo(AddToSetModal)
