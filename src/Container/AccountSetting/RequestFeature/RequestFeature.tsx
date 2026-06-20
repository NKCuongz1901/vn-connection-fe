'use client'

import { Flex } from 'antd'
import { useCallback, useMemo, useState } from 'react'

import { requestFeature } from '@/apis/userApis'
import CButton from '@/Components/Custom/CButton'
import CInput from '@/Components/Custom/CInput'
import CTextArea from '@/Components/Custom/CTextArea'
import { useLoading } from '@/context/LoadingContext'
import { useModal } from '@/context/ModalContext'
import FeedbackIcon from '@/svg/FeedbackIcon'

import classes from './RequestFeature.module.scss'

function RequestFeature() {
	const { toggleLoadingContext } = useLoading()
	const { openError, openSuccess } = useModal()

	const [title, setTitle] = useState('')
	const [content, setContent] = useState('')

	const isValid = useMemo(
		() => Boolean(title.trim()) && Boolean(content.trim()),
		[title, content],
	)

	const handleSubmit = useCallback(async () => {
		if (!isValid) return

		toggleLoadingContext(true)
		try {
			const res: any = await requestFeature({
				title: title.trim(),
				content: content.trim(),
			})
			if (res?.code === 200) {
				openSuccess({
					message: 'Your feature request has been submitted successfully.',
				})
				setTitle('')
				setContent('')
				return
			}
			openError(res)
		} catch (error) {
			openError(error)
		} finally {
			toggleLoadingContext(false)
		}
	}, [content, isValid, openError, openSuccess, title, toggleLoadingContext])

	return (
		<div className={classes.wrapper}>
			<Flex className={classes.hero} vertical align="center">
				<FeedbackIcon />
				<Flex className={classes.heroText} vertical align="center">
					<h2 className={classes.title}>What feature do you want next?</h2>
					<p className={classes.subtitle}>
						Tell us your idea and why it helps.
					</p>
				</Flex>
			</Flex>

			<Flex className={classes.form} vertical gap={12}>
				<CInput
					isRequired
					label="Feature Request"
					value={title}
					placeholder="Enter feature name"
					maxLength={120}
					onChange={(e) => setTitle(e.target.value)}
					style={{ border: 'none', background: '#f0f3f9' }}
				/>
				<CTextArea
					isRequired
					label="Why would this feature be helpful?"
					value={content}
					placeholder="Please share your thoughts"
					rows={5}
					maxLength={1000}
					showCount={false}
					onChange={(e) => setContent(e.target.value)}
					style={{ border: 'none', background: '#f0f3f9', minHeight: 120 }}
				/>
			</Flex>

			<div className={classes.footer}>
				<CButton
					ctype={isValid ? 'oranger' : undefined}
					disabled={!isValid}
					style={{ width: '100%' }}
					onClick={handleSubmit}
				>
					Submit Request
				</CButton>
			</div>
		</div>
	)
}

export default RequestFeature
