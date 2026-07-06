'use client'
import React, { useCallback, useState } from 'react'

import { deleteMySelfAccount } from '@/apis/userApis'
import { useLoading } from '@/context/LoadingContext'
import { useModal } from '@/context/ModalContext'
import useProfile from '@/hooks/Profile/useProfile'
import { mainRoutes } from '@/routes/MainRoutes'
import { useLocalePath } from '@/ultis/route'
import { handleRemoveAllCookie, handleRemoveAllSession } from '@/ultis/storage'

import PencilIcon from '@/svg/Hangout/PencilIcon'
import TrashIcon from '@/svg/TrashIcon'
import {
	IconChevronRight,
	IconLockPassword,
	IconUserFilled,
} from '@tabler/icons-react'

import { Divider, Flex, Skeleton } from 'antd'
import CInput from '@/Components/Custom/CInput'
import ModalEditProfile from '@/Components/Profile/ModalEditProfile'
import ModalNotFoundAccount from '@/Components/Notification/ModalNotFoundAccount/ModalNotFoundAccount'

import classes from './ManageAccount.module.scss'

const ACCOUNT_FIELDS = [
	{ key: 'phone', label: 'Phone Number' },
	{ key: 'name', label: 'User Name' },
	{ key: 'email', label: 'Email Address' },
] as const

const ACCOUNT_ACTIONS = [
	{
		key: 'change-password',
		label: 'Change password',
		variant: 'card',
		showArrow: true,
	},
	{
		key: 'deactivate',
		label: 'Deactivate (Temporarily Disabling)',
		variant: 'card',
	},
	{
		key: 'delete',
		label: 'Delete account',
		variant: 'plain',
	},
] as const

const skeletonItems = [
	{ id: '2', value: 220 },
	{ id: '1', value: 120 },
	{ id: '3', value: 320 },
	{ id: '4', value: 240 },
]

function ManageAccount() {
	const { onChangeRoute } = useLocalePath()
	const { toggleLoadingContext } = useLoading()
	const { openError } = useModal()
	const {
		userData,
		loading,
		openEditProfile,
		categoryNetworkOpts,
		onOpenEditP,
		onCloseEditP,
		onGetUserProfile,
	} = useProfile({})
	const { name, email, phone } = userData || {}
	const [openDeleteModal, setOpenDeleteModal] = useState(false)

	const fieldValues: Record<(typeof ACCOUNT_FIELDS)[number]['key'], string> = {
		phone: phone || '',
		name: name || '',
		email: email || '',
	}

	const handleActionClick = (key: (typeof ACCOUNT_ACTIONS)[number]['key']) => {
		if (key === 'change-password') {
			onChangeRoute(`${mainRoutes.accountSetting}/manage-account/change`)
			return
		}
		if (key === 'delete') {
			setOpenDeleteModal(true)
		}
	}

	const handleGoChangePhone = () => {
		onChangeRoute(`${mainRoutes.accountSetting}/manage-account/change-phone`)
	}

	const handleCloseDeleteModal = useCallback(() => {
		setOpenDeleteModal(false)
	}, [])

	const handleDeleteAccount = useCallback(async () => {
		toggleLoadingContext(true)
		try {
			const res: any = await deleteMySelfAccount()
			if (res?.code === 200) {
				setOpenDeleteModal(false)
				handleRemoveAllCookie()
				handleRemoveAllSession()
				onChangeRoute(mainRoutes.login)
			}
		} catch (error) {
			openError(error)
		} finally {
			toggleLoadingContext(false)
		}
	}, [onChangeRoute, openError, toggleLoadingContext])

	const renderActionIcon = (key: (typeof ACCOUNT_ACTIONS)[number]['key']) => {
		switch (key) {
			case 'change-password':
				return <IconLockPassword size={20} color="#7987A4" stroke={1.5} />
			case 'deactivate':
				return <IconUserFilled size={20} color="#7987A4" stroke={1.5} />
			case 'delete':
				return <TrashIcon fill="#7987A4" width={20} height={20} />
			default:
				return null
		}
	}

	if (loading) {
		return (
			<Flex className={classes.wrapper} vertical>
				<Flex className={classes.totalInfo} vertical>
					<Skeleton.Input active style={{ width: '100%', height: 320 }} />
				</Flex>
				{skeletonItems.map((i) => (
					<Skeleton.Input
						key={i.id}
						active
						className={classes.contentBody}
						style={{ width: '100%', height: i.value }}
					/>
				))}
			</Flex>
		)
	}

	return (
		<div className={classes.wrapper}>
			<Flex className={classes.section}>
				<div className={classes.sectionTitle}>Account Infomations</div>
				<Flex vertical className={classes.fields} gap={16}>
					{ACCOUNT_FIELDS.map(({ key, label }) => (
						<div key={key} className={classes.field}>
							<CInput
								value={fieldValues[key]}
								label={label}
								isNotBold
								readOnly
								allowClear={false}
								bordered={false}
								suffix={
									key === 'phone' ? (
										<button
											type="button"
											className={classes.editIcon}
											onClick={handleGoChangePhone}
											aria-label="Change phone number"
										>
											<PencilIcon fill="#7987A4" />
										</button>
									) : key === 'name' ? (
										<button
											type="button"
											className={classes.editIcon}
											onClick={onOpenEditP}
											aria-label="Edit profile"
										>
											<PencilIcon fill="#7987A4" />
										</button>
									) : (
										<span className={classes.editIcon}>
											<PencilIcon fill="#7987A4" />
										</span>
									)
								}
							/>
						</div>
					))}
				</Flex>
			</Flex>

			<Divider />
			<Flex className={classes.section}>
				<div className={classes.sectionTitle}>Manage Account</div>
				<Flex vertical className={classes.actions} gap={12}>
					{ACCOUNT_ACTIONS.map((action) => (
						<button
							key={action.key}
							type="button"
							className={
								action.variant === 'card'
									? classes.actionCard
									: classes.actionPlain
							}
							onClick={() => handleActionClick(action.key)}
						>
							<span className={classes.actionIcon}>
								{renderActionIcon(action.key)}
							</span>
							<span className={classes.actionLabel}>{action.label}</span>
							{'showArrow' in action && action.showArrow && (
								<span className={classes.actionArrow}>
									<IconChevronRight size={20} color="#0F1729" stroke={1.5} />
								</span>
							)}
						</button>
					))}
				</Flex>
			</Flex>

			<ModalNotFoundAccount
				open={openDeleteModal}
				onClose={handleCloseDeleteModal}
				icon={<TrashIcon fill="#F80024" width={48} height={48} />}
				title="Delete your account?"
				description="Are you sure you want to permanently delete your account? This action cannot be undone."
				plainDescription
				leftText="Delete Account"
				rightText="Continue Using"
				onGetHelp={handleDeleteAccount}
				onRegister={handleCloseDeleteModal}
			/>

			{openEditProfile && (
				<ModalEditProfile
					categoryNetworkOpts={categoryNetworkOpts}
					open={openEditProfile}
					onClose={onCloseEditP}
					data={userData}
					onGetUserProfile={onGetUserProfile}
				/>
			)}
		</div>
	)
}

export default ManageAccount
