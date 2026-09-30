'use client'

import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { IconChevronLeft, IconChevronRight, IconDots, IconFolder, IconPencil, IconPlus, IconTrash } from '@tabler/icons-react'
import { Dropdown, Select } from 'antd'
import clsx from 'clsx'
import { toast } from 'react-toastify'

import { parseApiList } from '@/apis/book/bookApis'
import {
	createMyVocabSet,
	deleteMyVocabSet,
	folderWordCount,
	getMyVocabSets,
	renameMyVocabSet,
	VOCAB_LANGUAGES,
	VocabFolder,
} from '@/apis/book/vocabApis'
import { useModal } from '@/context/ModalContext'
import { useLocalePath } from '@/ultis/route'
import { BOOK_VOCAB_PATH } from '@/Variable/book.variable'

import FolderNameModal from './FolderNameModal'
import { languageName } from './SetLanguagesModal'
import { FolderAvatar } from './VocabParts'
import classes from './Vocabulary.module.scss'

const DEFAULT_SOURCE = 'en'

/** The reader's own vocab sets by the words' language: open, add, rename and delete */
function MyVocabSets() {
	const { onChangeRoute } = useLocalePath()
	const { openConfirm, closeModal } = useModal()
	const searchParams = useSearchParams()
	const [all, setAll] = useState<VocabFolder[]>([])
	const [loading, setLoading] = useState(true)
	const [language, setLanguage] = useState(DEFAULT_SOURCE)
	const [extraLangs, setExtraLangs] = useState<string[]>([])
	const [picking, setPicking] = useState(false)
	// undefined: closed, null: new folder, a folder: rename it
	const [naming, setNaming] = useState<VocabFolder | null | undefined>(undefined)

	const load = useCallback(() => {
		setLoading(true)
		return getMyVocabSets(200)
			.then((res) => setAll(parseApiList<VocabFolder>(res)))
			.catch(() => setAll([]))
			.finally(() => setLoading(false))
	}, [])

	useEffect(() => {
		load()
	}, [load])

	// "Start now" on Vocabulary opens the new-folder form
	useEffect(() => {
		if (searchParams?.get('new') === '1') setNaming(null)
	}, [searchParams])

	const languages = useMemo(() => {
		const codes = new Set<string>([DEFAULT_SOURCE])
		all.forEach((folder) => folder.source_language && codes.add(folder.source_language))
		extraLangs.forEach((code) => codes.add(code))
		return Array.from(codes)
	}, [all, extraLangs])

	const sets = all.filter((folder) => (folder.source_language || DEFAULT_SOURCE) === language)

	const saveName = async (name: string) => {
		try {
			if (naming?.id) {
				await renameMyVocabSet(naming.id, name)
				toast.success('Folder renamed')
			} else {
				await createMyVocabSet(name, language)
				toast.success('Folder created')
			}
			await load()
		} catch (error) {
			toast.error((error as { message?: string })?.message || 'Something went wrong. Please try again.')
			throw error
		}
	}

	const remove = (folder: VocabFolder) => {
		if (!folder.id) return
		openConfirm({
			titleLabel: 'Delete this folder',
			message: `Delete "${folder.name}" and its words? This cannot be undone.`,
			confirmLabel: 'Delete',
			cancelLabel: 'Cancel',
			onAccept: async () => {
				closeModal()
				try {
					await deleteMyVocabSet(folder.id as string)
					toast.success('Folder deleted')
					load()
				} catch {
					toast.error('Could not delete the folder')
				}
			},
		})
	}

	return (
		<div className={classes.page}>
			<div className={classes.pageHead}>
				<button type="button" className={classes.back} onClick={() => onChangeRoute(BOOK_VOCAB_PATH)}>
					<IconChevronLeft size={20} />
				</button>
				<span className={classes.pageTitle}>My vocab sets</span>
				{all.length ? <span className={classes.badge}>{all.length}</span> : null}
			</div>

			<div className={classes.langRow}>
				{languages.map((code) => (
					<button
						key={code}
						type="button"
						className={clsx(classes.langChip, { [classes.langNative]: code === language })}
						onClick={() => setLanguage(code)}
					>
						{languageName(code)}
					</button>
				))}
				{picking ? (
					<Select
						autoFocus
						defaultOpen
						size="small"
						placeholder="Language"
						className={classes.langSelect}
						options={VOCAB_LANGUAGES.filter((code) => !languages.includes(code)).map((code) => ({
							value: code,
							label: languageName(code),
						}))}
						onChange={(code: string) => {
							setExtraLangs((prev) => [...prev, code])
							setLanguage(code)
							setPicking(false)
						}}
						onBlur={() => setPicking(false)}
					/>
				) : (
					<button type="button" className={classes.langAdd} onClick={() => setPicking(true)}>
						<IconPlus size={14} /> Add language
					</button>
				)}
			</div>

			{loading ? (
				<div className={classes.empty}>Loading…</div>
			) : sets.length ? (
				<div className={classes.words}>
					{sets.map((folder) => (
						<div key={folder.id} className={classes.folderRow}>
							<button
								type="button"
								className={classes.folderOpen}
								onClick={() => folder.id && onChangeRoute(`${BOOK_VOCAB_PATH}/mine/${folder.id}`)}
							>
								<span className={classes.myAvatar}>
									<FolderAvatar avatar={folder.avatar} fallback={<IconFolder size={18} />} />
								</span>
								<b>{folder.name}</b>
								<span className={classes.badge}>{folderWordCount(folder)}</span>
							</button>
							<Dropdown
								trigger={['click']}
								placement="bottomRight"
								menu={{
									items: [
										{ key: 'rename', label: 'Rename', icon: <IconPencil size={16} /> },
										{ key: 'delete', label: 'Delete this folder', icon: <IconTrash size={16} />, danger: true },
									],
									onClick: ({ key }) => (key === 'rename' ? setNaming(folder) : remove(folder)),
								}}
							>
								<button type="button" className={classes.iconBtn} aria-label="More">
									<IconDots size={18} />
								</button>
							</Dropdown>
							<IconChevronRight size={18} className={classes.chevronMuted} />
						</div>
					))}
				</div>
			) : (
				<div className={classes.buildCard}>
					<IconFolder size={28} className={classes.sectionIcon} />
					<b>Build your own vocabulary set.</b>
					<span>No {languageName(language)} sets yet. Add a folder to start.</span>
				</div>
			)}

			<button type="button" className={classes.learnBtn} onClick={() => setNaming(null)}>
				<IconPlus size={16} /> Add new folder
			</button>

			<FolderNameModal
				open={naming !== undefined}
				title={naming ? 'Rename folder' : 'Add new vocabulary folder'}
				initial={naming?.name || ''}
				onClose={() => setNaming(undefined)}
				onSave={saveName}
			/>
		</div>
	)
}

export default memo(MyVocabSets)
