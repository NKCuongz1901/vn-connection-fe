import { ItemType } from 'antd/es/menu/interface'
import { useCallback, useMemo, useState } from 'react'

import { useLoading } from '@/context/LoadingContext'
import { useModal } from '@/context/ModalContext'

import { deleteFriend } from '@/apis/friendApis'
import { blockUser } from '@/apis/userApis'
import { isFunction } from '@/ultis/common.ults'

export default function useUserMoreAction({
	id,
	isFriend,
	onCallback,
}: {
	id: string
	isFriend?: any
	onCallback?: any
}) {
	const { toggleLoadingContext } = useLoading()
	const { openError, openConfirm, openSuccess } = useModal()
	const [loading, setLoading] = useState(false)
	const [open, setOpen] = useState({ open: false, data: '' })
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
			const res = await deleteFriend({ id: isFriend?.id })
			if (res) {
				openSuccess({
					message: 'You have successfully unfriended this user.',
					onAccept: () => {
						if (isFunction(onCallback)) {
							onCallback({ id: isFriend?.friend_id })
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
	}, [isFriend, onCallback, openError, openSuccess, toggleLoadingContext])
	const handleClose = useCallback(() => {
		setOpen({ open: false, data: '' })
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
					setOpen({ open: true, data: id })
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
				key: 'block',
				label: 'Block',
				onClick: () => handleMenusClick('block'),
			},

			{
				key: 'report',
				label: 'Report',
				onClick: () => handleMenusClick('report'),
				style: { color: '#F80024' },
			},
		],
		[handleMenusClick, isFriend],
	)

	return { loading, menus, open, onClose: handleClose }
}
