import { useCallback, useState } from 'react'

import { addFriend, deleteFriend, updateFriend } from '@/apis/friendApis'

export default function useFriendItem({}: any) {
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
				console.log(' error:', error)
			} finally {
				setLoading(false)
			}
		},
		[],
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
				console.log(' error:', error)
			} finally {
				setLoading(false)
			}
		},
		[],
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
				console.log(' error:', error)
			} finally {
				setLoading(false)
			}
		},
		[],
	)
	return {
		loading,
		onAccept: handleAccept,
		onCancel: handleCancel,
		onAdd: handleAdd,
	}
}
