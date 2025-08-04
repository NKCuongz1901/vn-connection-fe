import { IconCircleXFilled } from '@tabler/icons-react'
import { Flex } from 'antd'
import { debounce } from 'lodash'
import { useCallback, useState } from 'react'

import { useLoading } from '@/context/LoadingContext'
import { useModal } from '@/context/ModalContext'

import { reportUser } from '@/apis/userApis'

import CButton from '@/Components/Custom/CButton'
import CInput from '@/Components/Custom/CInput'
import CModal from '@/Components/Custom/CModal/CModal'
import CSelect from '@/Components/Custom/CSelect'
import FeedbackIcon from '@/svg/FeedbackIcon'
import ImageIcon from '@/svg/ImageIcon'
import { isArray } from '@/ultis/array.ults'
import { isEmail } from '@/ultis/common.ults'
import { handleParseFileImg, handleUploadMedia } from '@/ultis/file.utls'

import CImage from '../CImage'
import CUploadMuti from '../CUploadMuti'

import { topicReportOpt } from '@/Variable/select.variable'

import classes from './ModalReport.module.scss'

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
	const { openConfirm, openError, openSuccess } = useModal()
	const [errors, setErrors] = useState({
		topic: '',
		email: '',
		content: '',
	})
	const [dataModal, setDataModal] = useState({
		topic: topicReportOpt[0],
		email: '',
		content: '',
	})
	const [fileList, setFileList] = useState([])

	const handleImportImg = debounce((_values) => {
		const values = []

		if (isArray(_values, 1)) {
			_values.forEach((i) => {
				const { imageUrl, file } = handleParseFileImg(i?.originFileObj) || {}
				if (imageUrl) {
					values.push({ imageUrl, file })
				}
			})
		}

		setFileList((prev) => {
			const combined = [...prev, ...values]
			return combined.slice(0, 5)
		})
	}, 200)

	const handleOnChangeData = useCallback((key, value) => {
		setErrors((prev) => ({ ...prev, [key]: '' }))
		setDataModal((prev) => ({ ...prev, [key]: value }))
	}, [])
	const handleValidate = useCallback((dataModal: any) => {
		const { email } = dataModal
		const _errors: any = Object.fromEntries(
			Object.entries({
				email: 'Please enter your email',
				// content: 'Please enter your proble',
			}).filter(([key]) => !dataModal?.[key]),
		)
		if (!_errors.email && !isEmail(email)) {
			_errors.email = 'Please enter correct email'
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
		const payload = {
			email,
			topic: topic?.value || '',
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
				<div className={classes.title}>Tell us your problems</div>
				<span className={classes.text}>
					Your feedbacks help us improve a lot
				</span>
			</Flex>
		)
	}

	const _renderMiddle = () => {
		const { topic, email } = dataModal
		return (
			<Flex className={classes.middle} vertical>
				<Flex className={classes.email}>
					<CInput
						isRequired
						label="Email"
						type="email"
						value={email}
						error={errors.email}
						placeholder="Enter your email"
						onChange={(e) => handleOnChangeData('email', e.target.value)}
					/>
				</Flex>
				<Flex className={classes.topic}>
					<CSelect
						isRequired
						label="Topic"
						value={topic}
						error={errors.topic}
						options={topicReportOpt}
						placeholder="Select your topic"
						onChange={(e) => handleOnChangeData('topic', e)}
					/>
				</Flex>

				<Flex className={classes.chooseImg} vertical>
					<Flex className={classes.upload}>
						<CUploadMuti
							fileList={fileList.map((i) => i.file)}
							onChange={({ file: _file, fileList: newList }) => {
								handleImportImg(newList)
							}}
						>
							<ImageIcon /> <span> &nbsp;Add image</span>
						</CUploadMuti>
					</Flex>
					<Flex className={classes.medias}>
						{fileList.map((i) => (
							<Flex key={i.imageUrl || i?.url} className={classes.media}>
								<CImage preview={true} src={i.imageUrl || i?.url} />
								<Flex
									className={classes.chooseImgCancel}
									onClick={() => {
										setFileList((prev) =>
											prev.filter((prev) => prev.imageUrl !== i.imageUrl),
										)
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
							width: 800,
						},
					}}
					footer={[
						<Flex key="back" justify="flex-end">
							<CButton
								disabled={loadingContext}
								onClick={handleSubmit}
								ctype="oranger"
								style={{ width: 240 }}
							>
								Submit
							</CButton>
						</Flex>,
					]}
				>
					<Flex className={classes.wrapper} vertical>
						{_renderTop()}
						{_renderMiddle()}
					</Flex>
				</CModal>
			)}
		</>
	)
}

export default ModalReport
