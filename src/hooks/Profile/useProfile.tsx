import { ItemType } from 'antd/es/menu/interface'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { useModal } from '@/context/ModalContext'
import useFriendItem from '../Friend/useFriendItem'

import { createConversation, getCategoryList } from '@/apis/conversationApis'
import { getUserProfile } from '@/apis/userApis'

import { delay } from '@/ultis/common.ults'
import { useLocalePath } from '@/ultis/route.ults'
import { getUserInfo } from '@/ultis/storage.ults'

import { mainRoutes } from '@/routes/MainRoutes'
import { CategoriFavOptProps } from '@/interface/Community/Community.interface'

export default function useProfile({ id }: { id?: string }) {
	const { openError } = useModal()
	const { onChangeRoute } = useLocalePath()
	const {
		onAccept,
		onAdd,
		onCancel,
		loading: loadingButtonFriend,
	} = useFriendItem({})
	const [userData, setUserData] = useState({}) as any
	const [openEditProfile, setOpenEditProfile] = useState(false)
	const [loading, setLoading] = useState(false)
	const [categoryNetworkOpts, setCategoryNetworkOpts] = useState<
		CategoriFavOptProps[]
	>([])
	const handleGetUserProfile = useCallback(
		async ({
			id,
			isNotLoading,
		}: { id?: string; isNotLoading?: boolean } = {}) => {
			try {
				if (!isNotLoading) {
					setLoading(true)
				}
				await delay(500)
				const res: any = await getUserProfile({
					id,
					params: {
						fields: ['$all'],
					},
				})
				const { code, results } = res || {}
				if (code === 200) {
					setUserData(results?.object || {})
				}
			} catch (error) {
				console.error('error:', error)
				openError(error)
			} finally {
				setLoading(false)
			}
			// eslint-disable-next-line react-hooks/exhaustive-deps
		},
		[openError],
	)
	const handleGetCategory = async () => {
		try {
			const category: any = await getCategoryList({})
			setCategoryNetworkOpts(category?.results?.objects?.rows || [])
		} catch (error) {
			openError(error)
		}
	}

	const handleOpenEditP = useCallback(() => {
		setOpenEditProfile(true)
	}, [])

	const handleCloseEditP = useCallback(() => {
		setOpenEditProfile(false)
	}, [])
	const handleMenusClick = useCallback(
		(type: string) => {
			const { is_friend } = userData || {}
			const { id: itemId } = is_friend || {}
			switch (type) {
				case 'accept':
					onAccept({
						id: itemId,
						onCallback: () => {
							handleGetUserProfile({ id, isNotLoading: true })
						},
					})
					break
				case 'delete':
					onCancel({
						id: itemId,
						onCallback: () => {
							handleGetUserProfile({ id, isNotLoading: true })
						},
					})
					break
				case 'add':
					onAdd({
						id: userData.id,
						onCallback: () => {
							handleGetUserProfile({ id, isNotLoading: true })
						},
					})
					break
				default:
					break
			}
		},
		[handleGetUserProfile, id, onAccept, onAdd, onCancel, userData],
	)
	const handleOpenInbox = useCallback(async () => {
		try {
			const { name } = getUserInfo() || {}
			const payload = {
				title: name || '',
				member_ids: [id],
			}
			const res: any = await createConversation(payload)
			if (res) {
				const { id } = res?.results?.object || {}
				onChangeRoute(`${mainRoutes.inbox}?id=${id}`)
			}
		} catch (error) {
			openError(error)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id])
	const menus: {
		responMenus: ItemType[]
		cancelMenus: ItemType[]
		deleteMenus: ItemType[]
	} = useMemo(
		() => ({
			responMenus: [
				{
					key: 'accept',
					label: 'Accept request',
					onClick: () => handleMenusClick('accept'),
				},

				{
					key: 'delete',
					label: 'Decline request',
					onClick: () => handleMenusClick('delete'),
					style: { color: '#F80024' },
				},
			],
			cancelMenus: [
				{
					key: 'delete',
					label: 'Cancel request',
					onClick: () => handleMenusClick('delete'),
					style: { color: '#F80024' },
				},
			],
			deleteMenus: [
				{
					key: 'delete',
					label: 'Delete friend',
					onClick: () => handleMenusClick('delete'),
					style: { color: '#F80024' },
				},
			],
		}),
		[handleMenusClick],
	)
	useEffect(() => {
		handleGetUserProfile({ id })
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id])
	useEffect(() => {
		handleGetCategory()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])
	return {
		loading,
		loadingButtonFriend,
		userData,
		menus: menus,
		openEditProfile,
		categoryNetworkOpts,
		onOpenEditP: handleOpenEditP,
		onCloseEditP: handleCloseEditP,
		onGetUserProfile: handleGetUserProfile,
		onMenusClick: handleMenusClick,
		onOpenInbox: handleOpenInbox,
	}
}
