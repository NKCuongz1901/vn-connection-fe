import { IconCircleXFilled } from '@tabler/icons-react'
import { Flex, Radio } from 'antd'
import { debounce } from 'lodash'
import { useCallback, useMemo, useState } from 'react'

import { useLoading } from '@/context/LoadingContext'
import { useModal } from '@/context/ModalContext'

import { reportUser } from '@/apis/userApis'

import CButton from '@/Components/Custom/CButton'
import CInput from '@/Components/Custom/CInput'
import CModal from '@/Components/Custom/CModal/CModal'
import CSelect from '@/Components/Custom/CSelect'
import FeedbackIcon from '@/svg/FeedbackIcon'
import ImageIcon from '@/svg/ImageIcon'
import { isArray } from '@/ultis/array'
import { isEmail } from '@/ultis/common'
import {
	handleParseFileImg,
	handleParseFileVideo,
	handleUploadMedia,
} from '@/ultis/file'

import CImage from '../CImage'
import CUploadMuti from '../CUploadMuti'
import DocumentUpload from '@/svg/DocumentUpload'

import { topicReportOpt } from '@/Variable/select.variable'

import classes from './ModalReport.module.scss'
import { getUserInfo } from '@/ultis/storage'
import CTextArea from '../CTextArea'

interface ModalReportProps {
	open: boolean
	onClose: any
	data?: any
	message?: string
	title?: string
	[key: string]: any
}

const ModalReport = (props: ModalReportProps) => {
	const { onClose, open, data, message, title } = props
	const { loadingContext, toggleLoadingContext } = useLoading()
	const { openConfirm, openError, openSuccess, closeModal } = useModal()
	const { email } = getUserInfo()
	const [errors, setErrors] = useState({
		topic: '',
		email: '',
		content: '',
	})
	const [dataModal, setDataModal] = useState({
		topic: topicReportOpt[0].value,
		email: email || '',
		content: '',
	})
	const [fileList, setFileList] = useState([])

	const processUpload = useCallback(
		async (_values: any[]) => {
			if (!isArray(_values, 1)) return

			const next: Array<{
				type: 'IMAGE' | 'VIDEO'
				url: string
				file: File
			}> = []

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
					else openError({ message: 'Video must be 60 seconds or shorter.' }) // hoặc message bạn đang dùng
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

			// chỉ ảnh
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

	const handleOnChangeData = useCallback((key, value) => {
		setErrors((prev) => ({ ...prev, [key]: '' }))
		setDataModal((prev) => ({ ...prev, [key]: value }))
	}, [])
	const handleValidate = useCallback((dataModal: any) => {
		const { email, topic, content } = dataModal
		const _errors: any = Object.fromEntries(
			Object.entries({
				email: 'Please enter your email',
				content: 'Please describe the issue in detail',
			}).filter(([key]) => !dataModal?.[key]),
		)
		if (!_errors.email && !isEmail(email)) {
			_errors.email = 'Please enter correct email'
		}
		if (!_errors.content && !content) {
			_errors.content = 'Please describe the issue in detail'
		}
		if (isArray(Object.entries(_errors), 1)) {
			setErrors(_errors)
			return false
		}
		return true
	}, [])
	const handleReportUser = useCallback(
		async (payload) => {
			try {
				toggleLoadingContext(true)
				let media = []
				if (isArray(fileList, 1)) {
					media = await handleUploadMedia(fileList)
				}
				const images = (media || []).map((item) => item.url)
				const res = await reportUser({ ...payload, images })
				if (res) {
					openSuccess({
						message: 'You have reported successfully.',
						onAccept: onClose,
					})
				}
			} catch (error) {
				openError(error)
			} finally {
				toggleLoadingContext()
			}
		},
		[onClose, fileList, openError, openSuccess, toggleLoadingContext],
	)
	const handleSubmit = useCallback(async () => {
		if (!handleValidate(dataModal)) {
			return
		}
		const { email, topic, content } = dataModal
		const selectedTopic = topicReportOpt.find((opt) => opt.value === topic)
		const payload = {
			email,
			topic: selectedTopic?.label ?? topic ?? '',
			content,
			images: [],
			...data,
		}
		openConfirm({
			message: message || 'You want to report this user ?',
			onAccept: () => handleReportUser(payload),
		})
	}, [data, dataModal, message, handleReportUser, handleValidate, openConfirm])
	const _renderTop = () => {
		return (
			<Flex className={classes.top} vertical>
				<FeedbackIcon />
				<div className={classes.title}>Tell us your issue</div>
				<span className={classes.text}>
					Your feedbacks help us improve a lot
				</span>
			</Flex>
		)
	}

	const _renderTypeIssuse = () => {
		return (
			<Flex vertical className={classes.topicRadioWrapper}>
				<p className={classes.typeIssueTitle}>Type of issue</p>
				<Radio.Group
					//   value={topic}
					value={dataModal.topic}
					onChange={(e) => handleOnChangeData('topic', e.target.value)}
					className={classes.topicRadioGroup}
				>
					{topicReportOpt.map((opt) => (
						<Radio
							key={opt.value}
							value={opt.value}
							className={classes.topicRadio}
						>
							<Flex
								vertical
								justify="start"
								align="start"
								className={classes.topicRadioText}
							>
								<div className={classes.topicRadioTitle}>{opt.label}</div>
								<div className={classes.topicRadioDesc}>{opt.value}</div>
							</Flex>
						</Radio>
					))}
				</Radio.Group>
			</Flex>
		)
	}

	const _renderMiddle = () => {
		const { topic, email, content } = dataModal
		return (
			<Flex className={classes.middle} vertical>
				<p className={classes.typeIssueTitle}>Issue detail</p>

				<Flex className={classes.email}>
					<CInput
						isRequired
						label="Email"
						type="email"
						value={email}
						error={errors.email}
						placeholder="Enter your email"
						onChange={(e) => handleOnChangeData('email', e.target.value)}
						style={{ border: 'none' }}
					/>
				</Flex>

				<Flex className={classes.content}>
					<CTextArea
						isRequired
						showCount={false}
						label="Content"
						placeholder="Describe your problems"
						value={content}
						error={errors.content}
						rows={4}
						maxLength={1000}
						onChange={(e) => handleOnChangeData('content', e.target.value)}
						style={{ border: 'none' }}
					/>
				</Flex>
				<Flex className={classes.chooseImg} vertical>
					<Flex className={classes.upload}>
						<CUploadMuti
							maxCount={5}
							fileList={fileList.map((i) => i.file)}
							onChange={({ file: _file, fileList: newList }) => {
								handleImportImg(newList)
							}}
							accept="image/*,video/*"
						>
							<DocumentUpload /> <span> &nbsp;Upload media</span>
						</CUploadMuti>
					</Flex>
					<p className={classes.uploadText}>
						* Upload 5 images or video (max 60s)
					</p>
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
				</Flex>
			</Flex>
		)
	}

	return (
		<>
			{open && (
				<CModal
					onClose={onClose}
					onCancel={onClose}
					title={title || 'Report'}
					styles={{
						content: {
							width: 660,
							minHeight: 800,
						},
					}}
					footer={[
						<Flex key="back">
							<CButton
								disabled={
									loadingContext ||
									!String(dataModal.email ?? '').trim() ||
									!String(dataModal.content ?? '').trim()
								}
								onClick={handleSubmit}
								ctype="oranger"
								style={{ width: '100%' }}
							>
								Submit
							</CButton>
						</Flex>,
					]}
				>
					<Flex className={classes.wrapper} vertical>
						{_renderTop()}
						{_renderTypeIssuse()}
						{_renderMiddle()}
					</Flex>
				</CModal>
			)}
		</>
	)
}

export default ModalReport
