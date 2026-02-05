import { ItemType } from 'antd/es/menu/interface'
import { useCallback, useMemo, useState } from 'react'

import { useLoading } from '@/context/LoadingContext'
import { useModal } from '@/context/ModalContext'

import { deleteFriend, updateFriend } from '@/apis/friendApis'
import { blockUser } from '@/apis/userApis'
import { isFunction } from '@/ultis/common.ults'
import { UserProps } from '@/interface/User/User.interface'
import { sendMessageById } from '@/apis/conversationApis'

export default function useUserMoreAction(props: {
	id: string
	isFriend?: any
	isNotBlock?: boolean
	isProfile?: boolean
	onCallback?: any
	userData?: UserProps
}) {
	const { id, isFriend, isProfile, userData, onCallback } = props
	const { toggleLoadingContext } = useLoading()
	const { openError, openConfirm, openSuccess } = useModal()
	const [loading, setLoading] = useState(false)
	const [loadingShare, setLoadingShare] = useState({}) as any
	const [shareList, setShareList] = useState({}) as any

	const [open, setOpen] = useState({ type: null, data: '' })
	const handleBlockUser = useCallback(async () => {
		setLoading(true)
		try {
			toggleLoadingContext(true)
			const res = await blockUser(id)
			if (res) {
				openSuccess({
					message: 'You have successfully locked this user',
				})
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoading(false)
			toggleLoadingContext()
		}
	}, [id, openError, openSuccess, toggleLoadingContext])
	const handleUnfriend = useCallback(async () => {
		setLoading(true)
		try {
			toggleLoadingContext(true)
			const res = await (isProfile
				? deleteFriend({ id: isFriend?.id })
				: updateFriend({
						id: isFriend?.id,
						payload: { state: 'REJECTED' },
					}))

			if (res) {
				openSuccess({
					message: 'You have successfully unfriended this user.',
					onAccept: () => {
						if (isFunction(onCallback)) {
							onCallback({
								id: isFriend?.friend_id,
								data: isFriend,
								type: 'unfriend',
							})
						}
					},
				})
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoading(false)
			toggleLoadingContext()
		}
	}, [
		isFriend,
		isProfile,
		onCallback,
		openError,
		openSuccess,
		toggleLoadingContext,
	])
	const handleClose = useCallback(() => {
		setOpen({ type: null, data: '' })
	}, [])
	const handleMenusClick = useCallback(
		(type: string) => {
			switch (type) {
				case 'unfriend':
					openConfirm({
						message: 'You want to unfriend this user ?',
						onAccept: handleUnfriend,
					})
					break
				case 'block':
					openConfirm({
						message: 'Do you want to block this user?',
						onAccept: handleBlockUser,
					})
					break
				case 'report':
					setOpen({ type: type, data: id })
					break
				case 'share':
					setOpen({ type: type, data: id })
					break
				default:
					break
			}
		},
		[handleBlockUser, handleUnfriend, id, openConfirm],
	)
	const menus: ItemType[] = useMemo(
		() => [
			...(isFriend
				? [
						{
							key: 'unfriend',
							label: 'Unfriend',
							onClick: () => handleMenusClick('unfriend'),
						},
					]
				: []),

			{
				key: 'share',
				label: 'Share',
				onClick: () => handleMenusClick('share'),
			},
			// ...(!isNotBlock
			// 	? [
			// 			{
			// 				key: 'block',
			// 				label: 'Block',
			// 				onClick: () => handleMenusClick('block'),
			// 			},
			// 		]
			// 	: []),

			{
				key: 'report',
				label: 'Report',
				onClick: () => handleMenusClick('report'),
				style: { color: '#F80024' },
			},
		],
		[handleMenusClick, isFriend],
	)
	const handleShareFriend = async (id) => {
		setLoadingShare((prev: any) => ({ ...prev, [id]: true }))

		try {
			const { share_link } = userData || {} || {}
			const payload = {
				receiver_id: id,
				message: {
					content: share_link,
					type: 'TEXT',
				},
			}
			const res: any = await sendMessageById(payload)
			const { code } = res || {}

			if (code === 200) {
				setShareList((prev: any) => ({ ...prev, [id]: true }))
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoadingShare((prev: any) => ({ ...prev, [id]: false }))
		}
	}

	return {
		loading,
		menus,
		open,
		loadingShare,
		shareList,

		onClose: handleClose,
		onShareFriend: handleShareFriend,
	}
}
