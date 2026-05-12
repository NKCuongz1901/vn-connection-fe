import React, { useEffect, useMemo, useState } from 'react'
import classes from './ModalNotificationSetting.module.scss'
import CModal from '@/Components/Custom/CModal/CModal'
import { NOTI_SETTING_ITEMS } from '@/Variable/notificationSetting.variable'
import { Flex, Skeleton } from 'antd'
import BellIcon from '@/svg/BellIcon'
import CSwitch from '@/Components/Custom/CSwitch/CSwitch'

type SettingState = { [key: string]: boolean }

type ModalNotificationSettingProps = {
	title: string
	onClose: () => void
	setting: SettingState | null
	loading?: boolean
	onToggle: (key: string, value: boolean) => Promise<void> | void
	onToggleAll: (key: string, value: boolean) => Promise<void> | void
}

function ModalNotificationSetting(_props: ModalNotificationSettingProps) {
	const { title, onClose, setting, loading, onToggle, onToggleAll } = _props

	const [localSetting, setLocalSetting] = useState<SettingState | null>(setting)
	const [updatingKey, setUpdatingKey] = useState<string>('')
	const [updatingAll, setUpdatingAll] = useState(false)

	useEffect(() => {
		if (setting) {
			setLocalSetting(setting)
		}
	}, [setting])

	const isInitialLoading = loading && !localSetting

	const isAnyOn = useMemo(() => {
		if (!localSetting) return false
		return NOTI_SETTING_ITEMS.some((i) => !!localSetting[i.key])
	}, [localSetting])

	const handleToggleItem = async (key: string, value: boolean) => {
		if (!localSetting || updatingAll || updatingKey) return

		const prevSetting = localSetting

		setUpdatingKey(key)
		setLocalSetting((prev) => ({
			...(prev || {}),
			[key]: value,
		}))

		try {
			await Promise.resolve(onToggle(key, value))
		} catch (error) {
			setLocalSetting(prevSetting)
		} finally {
			setUpdatingKey('')
		}
	}

	const handleToggleAll = async (value: boolean) => {
		if (!localSetting || updatingAll || updatingKey) return

		const prevSetting = localSetting

		const nextSetting = NOTI_SETTING_ITEMS.reduce<SettingState>(
			(obj, item) => {
				obj[item.key] = value
				return obj
			},
			{
				...localSetting,
				is_accept_notification: value,
			},
		)

		setUpdatingAll(true)
		setLocalSetting(nextSetting)

		try {
			await Promise.resolve(onToggleAll('is_accept_notification', value))
		} catch (error) {
			setLocalSetting(prevSetting)
		} finally {
			setUpdatingAll(false)
		}
	}

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
				title={
					<span
						style={{
							fontSize: 18,
							fontWeight: 600,
							color: '#000',
						}}
					>
						{title}
					</span>
				}
				styles={{
					content: {
						width: 660,
						borderRadius: 8,
					},
				}}
			>
				{isInitialLoading ? (
					renderSettingSkeleton()
				) : (
					<Flex vertical className={classes.container}>
						<Flex
							className={classes.rowHeader}
							align="center"
							justify="space-between"
						>
							<Flex className={classes.left} align="center" gap={12}>
								<BellIcon fill="#1B8024" />
								<span className={classes.label}>
									Turn off all notifications
								</span>
							</Flex>

							<CSwitch
								ctype="success"
								disabled={updatingAll || !!updatingKey}
								checked={isAnyOn}
								onChange={(checked) => handleToggleAll(checked)}
							/>
						</Flex>

						{NOTI_SETTING_ITEMS.map((item) => {
							const { key, label, Icon } = item
							const isUpdating = updatingAll || updatingKey === key

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
										disabled={isUpdating}
										checked={!!localSetting?.[key]}
										onChange={(checked) => handleToggleItem(item.key, checked)}
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
