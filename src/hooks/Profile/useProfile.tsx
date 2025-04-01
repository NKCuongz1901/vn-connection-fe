import { useCallback, useEffect, useState } from 'react'

import { getUserProfile } from '@/apis/userApis'

export default function useProfile({ id }: { id?: string }) {
	const [userData, setUserData] = useState({}) as any
	const [openEditProfile, setOpenEditProfile] = useState(false)

	const handleGetUserProfile = useCallback(async (id) => {
		try {
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
			console.log('error:', error)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const handleOpenEditP = useCallback(() => {
		setOpenEditProfile(true)
	}, [])

	const handleCloseEditP = useCallback(() => {
		setOpenEditProfile(false)
	}, [])

	useEffect(() => {
		handleGetUserProfile(id)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id])

	return {
		userData,
		openEditProfile,
		onOpenEditP: handleOpenEditP,
		onCloseEditP: handleCloseEditP,
		onGetUserProfile: handleGetUserProfile,
	}
}
