import { Flex } from 'antd'
import { useCallback, useState } from 'react'

import { useLoading } from '@/context/LoadingContext'
import { useModal } from '@/context/ModalContext'

import { reportUser } from '@/apis/userApis'

import { isArray } from '@/ultis/array.ults'
import { isEmail } from '@/ultis/common.ults'

import CButton from '@/Components/Custom/CButton'
import CInput from '@/Components/Custom/CInput'
import CModal from '@/Components/Custom/CModal/CModal'
import CSelect from '@/Components/Custom/CSelect'
import CTextArea from '@/Components/Custom/CTextArea'
import FeedbackIcon from '@/svg/FeedbackIcon'

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
	const handleOnChangeData = useCallback((key, value) => {
		setErrors((prev) => ({ ...prev, [key]: '' }))
		setDataModal((prev) => ({ ...prev, [key]: value }))
	}, [])
	const handleValidate = useCallback((dataModal: any) => {
		const { email } = dataModal
		const _errors: any = Object.fromEntries(
			Object.entries({
				email: 'Please enter your email',
				content: 'Please enter your proble',
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
				const res = await reportUser(payload)
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
		[onClose, openError, openSuccess, toggleLoadingContext],
	)
	const handleSubmit = useCallback(() => {
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
		const { topic, email, content } = dataModal
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
				<Flex className={classes.content}>
					<CTextArea
						showCount
						isRequired
						label="Content"
						placeholder="Describe your problems"
						error={errors.content}
						value={content}
						maxLength={500}
						onChange={(e) => handleOnChangeData('content', e.target.value)}
					/>
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
					title={title || 'Create discussion'}
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
