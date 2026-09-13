'use client'

import { memo, useCallback, useEffect, useState } from 'react'
import { Flex } from 'antd'

import { ContributeIdeaPayload } from '@/apis/courseApis'
import CButton from '@/Components/Custom/CButton'
import CInput from '@/Components/Custom/CInput'
import CModal from '@/Components/Custom/CModal/CModal'
import CTextArea from '@/Components/Custom/CTextArea'
import { useLoading } from '@/context/LoadingContext'
import { useModal } from '@/context/ModalContext'
import { useLocalePath } from '@/ultis/route'

import classes from './ContributeIdeaModal.module.scss'

type ContributeIdeaModalProps = {
	open: boolean
	onClose: () => void
	onSubmit: (payload: ContributeIdeaPayload) => Promise<any>
}

const COPY = {
	en: {
		title: 'Contribute ideas',
		heading: 'What feature do you want next?',
		subtitle: 'Tell us your idea and why it helps.',
		featureLabel: 'Feature title',
		featurePlaceholder: 'Enter a feature',
		featureError: 'Please enter a feature title',
		whyLabel: 'Why do you need this?',
		whyPlaceholder: 'Please write here',
		submit: 'Submit request',
		success: 'You have submitted your idea successfully.',
	},
	vi: {
		title: 'Đóng góp ý tưởng',
		heading: 'Bạn muốn tính năng nào tiếp theo?',
		subtitle: 'Hãy cho chúng tôi biết ý tưởng và lý do nó hữu ích.',
		featureLabel: 'Tiêu đề tính năng',
		featurePlaceholder: 'Nhập tên tính năng',
		featureError: 'Vui lòng nhập tiêu đề tính năng',
		whyLabel: 'Bạn cần điều này vì sao?',
		whyPlaceholder: 'Viết tại đây',
		submit: 'Gửi yêu cầu',
		success: 'Bạn đã gửi ý tưởng thành công.',
	},
}

function ContributeIdeaModal({
	open,
	onClose,
	onSubmit,
}: ContributeIdeaModalProps) {
	const { locale } = useLocalePath()
	const copy = locale === 'vi' ? COPY.vi : COPY.en
	const { loadingContext, toggleLoadingContext } = useLoading()
	const { openError, openSuccess } = useModal()
	const [featureTitle, setFeatureTitle] = useState('')
	const [whyNeedThis, setWhyNeedThis] = useState('')
	const [error, setError] = useState('')

	useEffect(() => {
		if (open) return
		setFeatureTitle('')
		setWhyNeedThis('')
		setError('')
	}, [open])

	const canSubmit =
		Boolean(featureTitle.trim() && whyNeedThis.trim()) && !loadingContext

	const handleSubmit = useCallback(async () => {
		if (!featureTitle.trim()) {
			setError(copy.featureError)
			return
		}
		try {
			toggleLoadingContext(true)
			const res = await onSubmit({
				feature_title: featureTitle.trim(),
				why_need_this: whyNeedThis.trim(),
			})
			if (res) {
				openSuccess({
					message: copy.success,
					onAccept: onClose,
				})
			}
		} catch (err) {
			openError(err)
		} finally {
			toggleLoadingContext()
		}
	}, [
		copy.featureError,
		copy.success,
		featureTitle,
		onClose,
		onSubmit,
		openError,
		openSuccess,
		toggleLoadingContext,
		whyNeedThis,
	])

	if (!open) return null

	return (
		<CModal
			onClose={onClose}
			onCancel={onClose}
			title={copy.title}
			styles={{
				content: {
					width: 660,
				},
			}}
			footer={[
				<Flex key="submit" className={classes.footer}>
					<CButton
						disabled={!canSubmit}
						onClick={handleSubmit}
						ctype="oranger"
						style={{ width: '100%' }}
					>
						{copy.submit}
					</CButton>
				</Flex>,
			]}
		>
			<Flex className={classes.wrapper} vertical>
				<Flex className={classes.header} vertical>
					<p className={classes.heading}>{copy.heading}</p>
					<p className={classes.subtitle}>{copy.subtitle}</p>
				</Flex>
				<CInput
					isRequired
					label={copy.featureLabel}
					value={featureTitle}
					error={error}
					placeholder={copy.featurePlaceholder}
					onChange={(e) => {
						setError('')
						setFeatureTitle(e.target.value)
					}}
					style={{
						border: 'none',
						background: '#f0f3f9',
						color: '#0f1729',
						fontSize: 14,
						fontWeight: 400,
						lineHeight: '20px',
					}}
				/>
				<CTextArea
					isRequired
					label={copy.whyLabel}
					placeholder={copy.whyPlaceholder}
					value={whyNeedThis}
					rows={4}
					maxLength={1000}
					showCount={false}
					onChange={(e) => setWhyNeedThis(e.target.value)}
					style={{
						border: 'none',
						background: '#f0f3f9',
						minHeight: 120,
					}}
				/>
			</Flex>
		</CModal>
	)
}

export default memo(ContributeIdeaModal)
