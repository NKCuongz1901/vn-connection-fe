import React, { useMemo } from 'react'
import classes from './ModalNotificationSetting.module.scss'
import CModal from '@/Components/Custom/CModal/CModal'
import CButton from '@/Components/Custom/CButton'
import { NOTI_SETTING_ITEMS } from '@/Variable/notificationSetting.variable'
import { Flex, Skeleton } from 'antd'
import BellIcon from '@/svg/BellIcon'
import CSwitch from '@/Components/Custom/CSwitch/CSwitch'

type ModalNotificationSettingProps = {
	title: string
	onClose: () => void
	setting: { [key: string]: boolean } | null
	loading?: boolean
	onToggle: (key: string, value: boolean) => void
	onToggleAll: (key: string, value: boolean) => void
}

function ModalNotificationSetting(_props: ModalNotificationSettingProps) {
	const { title, onClose, setting, loading, onToggle, onToggleAll } = _props

	const allOff = useMemo(() => {
		if (!setting) return false
		const keys = NOTI_SETTING_ITEMS.map((i) => i.key)
		return keys.every((k) => setting[k] === false)
	}, [setting])

	const isAnyOn = useMemo(() => {
		if (!setting) return false
		return NOTI_SETTING_ITEMS.some((i) => !!setting[i.key])
	}, [setting])

	const renderSettingSkeleton = () => (
		<Flex vertical className={classes.skeletonWrapper}>
			{Array.from({ length: 10 }).map((_, idx) => (
				<Flex
					key={idx}
					className={classes.skeletonRow}
					align="center"
					justify="space-between"
				>
					<Flex align="center" gap={12}>
						<Skeleton.Avatar active size={24} shape="circle" />
						<Skeleton.Input active size="small" style={{ width: 180 }} />
					</Flex>
					<Skeleton.Button
						active
						size="small"
						shape="round"
						style={{ width: 44 }}
					/>
				</Flex>
			))}
		</Flex>
	)
	return (
		<div className={classes.wrapper}>
			<CModal
				footer={null}
				onClose={onClose}
				onCancel={onClose}
				title={title}
				styles={{
					content: {
						width: 660,
						borderRadius: 8,
					},
				}}
			>
				{loading ? (
					renderSettingSkeleton()
				) : (
					<Flex vertical className={classes.container}>
						<Flex className={classes.rowHeader}>
							<Flex className={classes.rowHeader}>
								<BellIcon fill="#1B8024" />
								<span className={classes.label}>
									Turn off all notifications
								</span>
							</Flex>
							<CSwitch
								ctype="success"
								disabled={loading}
								checked={isAnyOn}
								onChange={(checked) =>
									onToggleAll('is_accept_notification', checked)
								}
							/>
						</Flex>
						{NOTI_SETTING_ITEMS.map((item) => {
							const { key, label, Icon } = item
							return (
								<Flex
									key={key}
									className={classes.row}
									align="center"
									justify="space-between"
								>
									<Flex className={classes.left} align="center" gap={12}>
										<Icon fill="#1B8024" />
										<span className={classes.label}>{label}</span>
									</Flex>
									<CSwitch
										ctype="success"
										disabled={loading}
										checked={!!setting?.[key]}
										onChange={(checked) => onToggle(item.key, checked)}
									/>
								</Flex>
							)
						})}
					</Flex>
				)}
			</CModal>
		</div>
	)
}

export default ModalNotificationSetting
