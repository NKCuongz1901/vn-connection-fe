import { useCallback, useState } from 'react'

import { useModal } from '@/context/ModalContext'

import { addFriend, deleteFriend, updateFriend } from '@/apis/friendApis'

export default function useFriendItem({}: any) {
	const { openError } = useModal()
	const [loading, setLoading] = useState(false)
	const handleAccept = useCallback(
		async ({ id, onCallback }: { id: string; onCallback?: any }) => {
			try {
				setLoading(true)
				const res: any = await updateFriend({
					id,
					payload: { state: 'ACCEPTED' },
				})
				if (res?.code === 200) {
					if (onCallback) {
						onCallback()
					}
				}
			} catch (error) {
				console.error(' error:', error)
				openError(error)
			} finally {
				setLoading(false)
			}
		},
		[openError],
	)
	const handleCancel = useCallback(
		async ({ id, onCallback }: { id: string; onCallback?: any }) => {
			try {
				setLoading(true)
				const res: any = await deleteFriend({
					id,
				})
				if (res?.code === 200) {
					if (onCallback) {
						onCallback()
					}
				}
			} catch (error) {
				console.error(' error:', error)
				openError(error)
			} finally {
				setLoading(false)
			}
		},
		[openError],
	)
	const handleAdd = useCallback(
		async ({ id, onCallback }: { id: string; onCallback?: any }) => {
			try {
				setLoading(true)
				const res: any = await addFriend({
					friend_id: id,
				})

				if (res?.code === 200) {
					if (onCallback) {
						onCallback(res?.results?.object)
					}
				}
			} catch (error) {
				console.error(' error:', error)
				openError(error)
			} finally {
				setLoading(false)
			}
		},
		[openError],
	)
	return {
		loading,
		onAccept: handleAccept,
		onCancel: handleCancel,
		onAdd: handleAdd,
	}
}
