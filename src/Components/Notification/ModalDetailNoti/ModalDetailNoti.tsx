import { Flex } from 'antd'
import { memo } from 'react'

import { getDiffFromNow } from '@/ultis/date.ults'

import CModal from '@/Components/Custom/CModal/CModal'

import CButton from '@/Components/Custom/CButton'

import { NotiItemProp } from '@/interface/Notification/Notification.interface'

import classes from './ModalDetailNoti.module.scss'

interface ModalDetailNotiProps {
	title: string
	onClose: any
	data: NotiItemProp | null
	[key: string]: any
}

const ModalDetailNoti = (_props: ModalDetailNotiProps) => {
	const { data, title, onClose } = _props
	const { content, title: titleData, created_at } = data || {}
	const { value: timeAgo, unit } = getDiffFromNow({ input: created_at })
	return (
		<div className={classes.wrapper}>
			<CModal
				onClose={onClose}
				onCancel={onClose}
				title={title}
				styles={{
					content: {
						width: 660,
					},
				}}
				footer={[
					<div key="back">
						<CButton onClick={onClose} ctype="oranger" style={{ width: 200 }}>
							Close
						</CButton>
					</div>,
				]}
			>
				<Flex vertical className={classes.container}>
					<div className={classes.time}>
						{timeAgo} {unit ? unit + 's ago' : ''}
					</div>
					<div className={classes.title}>{titleData}</div>
					<div className={classes.content}>{content}</div>
				</Flex>
			</CModal>
		</div>
	)
}

export default memo(ModalDetailNoti)
