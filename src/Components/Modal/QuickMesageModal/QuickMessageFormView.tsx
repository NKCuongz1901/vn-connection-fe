import { IconCircleXFilled } from '@tabler/icons-react'
import { Flex } from 'antd'
import {
	forwardRef,
	memo,
	useCallback,
	useEffect,
	useImperativeHandle,
	useMemo,
	useState,
} from 'react'

import { useModal } from '@/context/ModalContext'
import {
	QuickMessageFormData,
	QuickMessageItem,
	QuickMessageLocalMedia,
} from '@/hooks/QuickMesage/useQuickMessage'

import { handleParseFileImg, handleParseFileVideo } from '@/ultis/file'

import CUploadMuti from '@/Components/Custom/CUploadMuti'
import CImage from '@/Components/Custom/CImage/CImage'
import DocumentUpload from '@/svg/DocumentUpload'
import TrashIcon from '@/svg/TrashIcon'

import {
	isValidShortcut,
	normalizeShortcut,
	sanitizeShortcutInput,
} from './quickMessageUtils'
import classes from './QuickMessageModal.module.scss'

export interface QuickMessageFormRef {
	submit: () => Promise<void>
	canSubmit: boolean
}

interface QuickMessageFormViewProps {
	data?: QuickMessageItem | null
	isEdit?: boolean
	onSubmit: (payload: QuickMessageFormData) => Promise<any>
	onDelete?: (id: string) => Promise<any>
	onValidChange?: (valid: boolean) => void
}

const QuickMessageFormView = forwardRef<
	QuickMessageFormRef,
	QuickMessageFormViewProps
>(function QuickMessageFormView(
	{ data, isEdit = false, onSubmit, onDelete, onValidChange },
	ref,
) {
	const { openConfirm, closeModal } = useModal()
	const [shortcut, setShortcut] = useState('')
	const [content, setContent] = useState('')
	const [fileList, setFileList] = useState<QuickMessageLocalMedia[]>([])
	const [errors, setErrors] = useState<{ shortcut?: string; content?: string }>(
		{},
	)

	useEffect(() => {
		setShortcut(normalizeShortcut(data?.shortcut))
		setContent(data?.content || '')
		const existingUrl = data?.media || data?.medias?.[0]?.url
		if (existingUrl) {
			setFileList([
				{
					type: data?.medias?.[0]?.type || 'IMAGE',
					url: existingUrl,
					width: data?.medias?.[0]?.width,
					height: data?.medias?.[0]?.height,
					ratio: data?.medias?.[0]?.ratio,
					duration: data?.medias?.[0]?.duration,
				},
			])
		} else {
			setFileList([])
		}
		setErrors({})
	}, [data?.id, data?.content, data?.shortcut, data?.media, data?.medias])

	const existingMedias = useMemo(() => {
		return fileList
			.filter((item) => !item.file && item.url)
			.map(({ file: _file, ...rest }) => ({
				url: rest.url!,
				type: rest.type,
				width: rest.width,
				height: rest.height,
				ratio: rest.ratio,
				duration: rest.duration,
			}))
	}, [fileList])

	const localFiles = useMemo(
		() => fileList.filter((item) => item.file),
		[fileList],
	)

	const canSubmit = useMemo(
		() => isValidShortcut(shortcut) && !!content.trim(),
		[shortcut, content],
	)

	useEffect(() => {
		onValidChange?.(canSubmit)
	}, [canSubmit, onValidChange])

	const handleImportMedia = useCallback(async (_values: any[]) => {
		const values: QuickMessageLocalMedia[] = []

		for (const item of _values || []) {
			const file = item?.originFileObj
			if (!file) continue

			if (file.type?.startsWith('image')) {
				const { imageUrl } = handleParseFileImg(file)
				if (imageUrl) values.push({ type: 'IMAGE', url: imageUrl, file })
				continue
			}

			if (file.type?.startsWith('video')) {
				const { videoUrl } = await handleParseFileVideo(file)
				if (videoUrl) values.push({ type: 'VIDEO', url: videoUrl, file })
			}
		}

		if (values.length > 0) {
			setFileList(values.slice(0, 1))
		}
	}, [])

	const validate = useCallback(() => {
		const nextErrors: { shortcut?: string; content?: string } = {}
		if (!normalizeShortcut(shortcut)) {
			nextErrors.shortcut = 'Shortcut is required'
		} else if (!isValidShortcut(shortcut)) {
			nextErrors.shortcut =
				'Shortcut must contain letters only (no numbers, spaces or special characters)'
		}
		if (!content.trim()) {
			nextErrors.content = 'Content is required'
		}
		setErrors(nextErrors)
		return Object.keys(nextErrors).length === 0
	}, [shortcut, content])

	const handleSubmit = useCallback(async () => {
		if (!validate()) return
		await onSubmit({
			shortcut: normalizeShortcut(shortcut),
			content: content.trim(),
			fileList: localFiles,
			existingMedias: isEdit ? existingMedias : [],
		})
	}, [
		content,
		existingMedias,
		isEdit,
		localFiles,
		onSubmit,
		shortcut,
		validate,
	])

	useImperativeHandle(
		ref,
		() => ({
			submit: handleSubmit,
			canSubmit,
		}),
		[canSubmit, handleSubmit],
	)

	const handleDelete = () => {
		if (!data?.id || !onDelete) return
		openConfirm({
			message: 'Delete this quick message?',
			onAccept: async () => {
				await onDelete(data.id)
				closeModal()
			},
		})
	}

	const preview = fileList[0]

	return (
		<div className={classes.form}>
			<div>
				<div className={classes.fieldLabel}>
					Shortcut <span className={classes.required}>*</span>
				</div>
				<div className={classes.shortcutField}>
					<span className={classes.shortcutPrefix}>/</span>
					<input
						className={classes.shortcutInput}
						value={shortcut}
						placeholder="Enter short cut"
						onChange={(e) => {
							setShortcut(sanitizeShortcutInput(e.target.value))
							setErrors((prev) => ({ ...prev, shortcut: '' }))
						}}
					/>
				</div>
				{errors.shortcut && (
					<p className={classes.errorText}>{errors.shortcut}</p>
				)}
			</div>

			<div>
				<div className={classes.fieldLabel}>
					Content <span className={classes.required}>*</span>
				</div>
				<textarea
					className={classes.contentTextarea}
					value={content}
					placeholder="Enter content"
					onChange={(e) => {
						setContent(e.target.value)
						setErrors((prev) => ({ ...prev, content: '' }))
					}}
				/>
				{errors.content && (
					<p className={classes.errorText}>{errors.content}</p>
				)}
			</div>

			<div className={classes.uploadSection}>
				{!preview ? (
					<>
						<CUploadMuti
							fileList={[]}
							maxCount={1}
							accept="image/*,video/*"
							onChange={({ fileList: newList }) => {
								handleImportMedia(newList)
							}}
						>
							<button type="button" className={classes.uploadBtn}>
								<DocumentUpload fill="#0F1729" />
								Upload media
							</button>
						</CUploadMuti>
						<p className={classes.uploadHint}>
							* Upload one image or video (max 1 min).
						</p>
					</>
				) : (
					<Flex vertical gap={12} align="flex-start">
						<p className={classes.uploadHint}>
							* Upload one image or video (max 1 min).
						</p>
						<div className={classes.mediaPreview}>
							{preview.type === 'VIDEO' ? (
								<video src={preview.url} />
							) : (
								<CImage src={preview.url} alt="" preview={false} />
							)}
							<button
								type="button"
								className={classes.removeMedia}
								onClick={() => setFileList([])}
							>
								<IconCircleXFilled size={16} />
							</button>
						</div>
					</Flex>
				)}
			</div>

			{isEdit && onDelete && (
				<div className={classes.editFooterActions}>
					<div className={classes.divider} style={{ margin: 0 }} />
					<button
						type="button"
						className={classes.deleteBtn}
						onClick={handleDelete}
					>
						<TrashIcon fill="#CD3031" width={16} height={16} />
						Delete quick message
					</button>
				</div>
			)}
		</div>
	)
})

export default memo(QuickMessageFormView)
