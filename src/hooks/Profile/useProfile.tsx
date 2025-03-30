import { useCallback, useEffect, useState } from 'react'

import { getUserProfile } from '@/apis/userApis'

export default function useProfile({ id }: { id?: string }) {
	const [userData, setUserData] = useState({}) as any
	const [openEditProfile, setOpenEditProfile] = useState(true)
	console.log(
		'🌸🌸🌸 TrieuNinhHan ~ useProfile ~ openEditProfile:',
		openEditProfile,
	)
	const handleGetUserProfile = useCallback(async () => {
		try {
			const res: any = await getUserProfile({ id })
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
		console.log('object')
		setOpenEditProfile(false)
	}, [])
	useEffect(() => {
		handleGetUserProfile()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])
	return {
		userData,
		openEditProfile,
		onOpenEditP: handleOpenEditP,
		onCloseEditP: handleCloseEditP,
	}
}
