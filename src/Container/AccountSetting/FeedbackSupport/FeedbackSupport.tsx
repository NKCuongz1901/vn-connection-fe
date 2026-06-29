'use client'

import { IconCircleXFilled } from '@tabler/icons-react'
import { Flex, Radio, Skeleton } from 'antd'
import { debounce } from 'lodash'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { getReportIssueTypes, reportUser } from '@/apis/userApis'
import CButton from '@/Components/Custom/CButton'
import CImage from '@/Components/Custom/CImage'
import CInput from '@/Components/Custom/CInput'
import CTextArea from '@/Components/Custom/CTextArea'
import CUploadMuti from '@/Components/Custom/CUploadMuti'
import { useLoading } from '@/context/LoadingContext'
import { useModal } from '@/context/ModalContext'
import DocumentUpload from '@/svg/DocumentUpload'
import FeedbackIcon from '@/svg/FeedbackIcon'
import { isArray } from '@/ultis/array'
import { isEmail } from '@/ultis/common'
import {
	handleParseFileImg,
	handleParseFileVideo,
	handleUploadMedia,
} from '@/ultis/file'
import { getUserInfo } from '@/ultis/storage'
import { REPORT_ISSUE_TYPE } from '@/Variable/common.variable'

import classes from './FeedbackSupport.module.scss'

type ReportTypeOption = {
	id: string
	label: string
	description?: string
}

type MediaFile = {
	type: 'IMAGE' | 'VIDEO'
	url: string
	file: File
}

function FeedbackSupport() {
	const { loadingContext, toggleLoadingContext } = useLoading()
	const { openConfirm, openError, openSuccess, closeModal } = useModal()
	const { email: userEmail } = getUserInfo()

	const [reportTypeList, setReportTypeList] = useState<ReportTypeOption[]>([])
	const [loadingReportType, setLoadingReportType] = useState(false)
	const [errors, setErrors] = useState({
		topic: '',
		email: '',
		content: '',
	})
	const [dataForm, setDataForm] = useState({
		topic: '',
		email: userEmail || '',
		content: '',
	})
	const [fileList, setFileList] = useState<MediaFile[]>([])

	useEffect(() => {
		const load = async () => {
			setLoadingReportType(true)
			try {
				const res: any = await getReportIssueTypes({
					type: REPORT_ISSUE_TYPE.TALKROOM,
				})
				const rows = res?.results?.objects ?? []
				setReportTypeList(rows)
				if (rows[0]) {
					setDataForm((prev) => ({ ...prev, topic: rows[0].id }))
				}
			} catch (error) {
				openError(error)
			} finally {
				setLoadingReportType(false)
			}
		}
		load()
	}, [openError])

	const processUpload = useCallback(
		async (_values: any[]) => {
			if (!isArray(_values, 1)) return

			const next: MediaFile[] = []

			for (const i of _values) {
				const file = i?.originFileObj as File | undefined
				if (!file) continue

				if (file.type.startsWith('image')) {
					const { imageUrl } = handleParseFileImg(file) || {}
					if (imageUrl) next.push({ type: 'IMAGE', url: imageUrl, file })
					continue
				}

				if (file.type.startsWith('video')) {
					const { videoUrl } = await handleParseFileVideo(file)
					if (videoUrl) next.push({ type: 'VIDEO', url: videoUrl, file })
					else openError({ message: 'Video must be 60 seconds or shorter.' })
					continue
				}
			}

			const videos = next.filter((x) => x.type === 'VIDEO')
			const images = next.filter((x) => x.type === 'IMAGE')

			if (videos.length && images.length) {
				openError({
					message: 'Please upload either images or one video, not both.',
				})
				return
			}

			if (videos.length > 1) {
				openError({ message: 'You can only upload one video.' })
				setFileList([videos[0]])
				return
			}

			if (videos.length === 1) {
				setFileList(videos)
				return
			}

			if (images.length > 5) {
				openConfirm({
					message: 'You can only upload up to 5 images.',
					onAccept: () => closeModal(),
				})
			}
			setFileList(images.slice(0, 5))
		},
		[closeModal, openConfirm, openError],
	)

	const handleImportImg = useMemo(
		() => debounce((list: any[]) => void processUpload(list), 200),
		[processUpload],
	)

	const handleOnChangeData = useCallback((key: string, value: string) => {
		setErrors((prev) => ({ ...prev, [key]: '' }))
		setDataForm((prev) => ({ ...prev, [key]: value }))
	}, [])

	const resetForm = useCallback(
		(firstTopicId?: string) => {
			setDataForm({
				topic: firstTopicId || '',
				email: userEmail || '',
				content: '',
			})
			setFileList([])
			setErrors({ topic: '', email: '', content: '' })
		},
		[userEmail],
	)

	const handleValidate = useCallback((formData: typeof dataForm) => {
		const { email, content } = formData
		const _errors: Record<string, string> = Object.fromEntries(
			Object.entries({
				email: 'Please enter your email',
				content: 'Please describe the issue in detail',
			}).filter(([key]) => !formData?.[key as keyof typeof formData]),
		)

		if (!_errors.email && !isEmail(email)) {
			_errors.email = 'Please enter correct email'
		}
		if (!_errors.content && !content) {
			_errors.content = 'Please describe the issue in detail'
		}

		if (isArray(Object.entries(_errors), 1)) {
			setErrors((prev) => ({
				...prev,
				email: _errors.email || '',
				content: _errors.content || '',
			}))
			return false
		}
		return true
	}, [])

	const handleReportUser = useCallback(
		async (payload: Record<string, unknown>) => {
			try {
				toggleLoadingContext(true)
				let media: Array<{ url: string }> = []
				if (isArray(fileList, 1)) {
					media = await handleUploadMedia(fileList)
				}
				const images = (media || []).map((item) => item.url)
				const res = await reportUser({ ...payload, images })
				if (res) {
					openSuccess({
						message: 'You have reported successfully.',
						onAccept: () => resetForm(reportTypeList[0]?.id),
					})
				}
			} catch (error) {
				openError(error)
			} finally {
				toggleLoadingContext(false)
			}
		},
		[
			fileList,
			openError,
			openSuccess,
			reportTypeList,
			resetForm,
			toggleLoadingContext,
		],
	)

	const handleSubmit = useCallback(() => {
		if (!handleValidate(dataForm)) return

		const { email, topic, content } = dataForm
		const selected = reportTypeList.find((opt) => opt.id === topic)
		const payload = {
			email,
			topic: selected?.label ?? '',
			content,
			images: [],
		}

		openConfirm({
			message: 'You want to need help this problem ?',
			onAccept: () => handleReportUser(payload),
		})
	}, [dataForm, handleReportUser, handleValidate, openConfirm, reportTypeList])

	const isValid = useMemo(
		() =>
			Boolean(String(dataForm.email ?? '').trim()) &&
			Boolean(String(dataForm.content ?? '').trim()) &&
			Boolean(dataForm.topic),
		[dataForm],
	)

	return (
		<div className={classes.wrapper}>
			<Flex className={classes.hero} vertical align="center">
				<FeedbackIcon />
				<Flex className={classes.heroText} vertical align="center">
					<h2 className={classes.title}>Tell us your issue</h2>
					<p className={classes.subtitle}>
						Your feedbacks help us improve a lot.
					</p>
				</Flex>
			</Flex>

			<div className={classes.section}>
				<p className={classes.sectionHeading}>Type of issue</p>
				{loadingReportType ? (
					<Skeleton active paragraph={{ rows: 4 }} />
				) : (
					reportTypeList.length > 0 && (
						<Radio.Group
							value={dataForm.topic}
							onChange={(e) => handleOnChangeData('topic', e.target.value)}
							className={classes.topicRadioGroup}
						>
							{reportTypeList.map((opt) => (
								<Radio key={opt.id} value={opt.id}>
									<div className={classes.topicRadioTitle}>{opt.label}</div>
									{opt.description && (
										<div className={classes.topicRadioDesc}>
											{opt.description}
										</div>
									)}
								</Radio>
							))}
						</Radio.Group>
					)
				)}
			</div>

			<div className={classes.section}>
				<p className={classes.sectionHeading}>Issue detail</p>
				<Flex className={classes.issueDetail} vertical>
					<CInput
						isRequired
						label="Email"
						type="email"
						value={dataForm.email}
						error={errors.email}
						placeholder="Enter your email"
						onChange={(e) => handleOnChangeData('email', e.target.value)}
						style={{ border: 'none', background: '#f0f3f9' }}
					/>

					<CTextArea
						isRequired
						showCount={false}
						label="Content"
						placeholder="Describe your problems"
						value={dataForm.content}
						error={errors.content}
						rows={5}
						maxLength={1000}
						onChange={(e) => handleOnChangeData('content', e.target.value)}
						style={{ border: 'none', background: '#f0f3f9', minHeight: 120 }}
					/>

					<Flex className={classes.chooseImg} vertical>
						<Flex className={classes.upload}>
							<CUploadMuti
								maxCount={5}
								onChange={({ fileList: newList }) => {
									handleImportImg(newList)
								}}
								accept="image/*,video/*"
							>
								<DocumentUpload /> <span>&nbsp;Upload media</span>
							</CUploadMuti>
						</Flex>
						<p className={classes.uploadText}>
							* Upload maximum 5 image or video (max 1 min).
						</p>
						{fileList.length > 0 && (
							<Flex className={classes.medias}>
								{fileList.map((item, idx) => (
									<Flex key={`${item.url}-${idx}`} className={classes.media}>
										{item.type === 'VIDEO' ? (
											<video
												src={item.url}
												controls
												muted
												playsInline
												className={classes.videoPreview}
											/>
										) : (
											<CImage preview src={item.url} />
										)}
										<Flex
											className={classes.chooseImgCancel}
											onClick={() => {
												URL.revokeObjectURL(item.url)
												setFileList((prev) => prev.filter((_, i) => i !== idx))
											}}
										>
											<IconCircleXFilled />
										</Flex>
									</Flex>
								))}
							</Flex>
						)}
					</Flex>
				</Flex>
			</div>

			<div className={classes.footer}>
				<CButton
					ctype={isValid ? 'oranger' : undefined}
					disabled={!isValid || loadingContext}
					style={{ width: '100%' }}
					onClick={handleSubmit}
				>
					Submit
				</CButton>
			</div>
		</div>
	)
}

export default FeedbackSupport
