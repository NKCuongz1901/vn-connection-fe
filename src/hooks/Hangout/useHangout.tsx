'use client'
import { useEffect, useRef, useState } from 'react'

import { useLoading } from '@/context/LoadingContext'
import { useModal } from '@/context/ModalContext'

import {
	actionParticipant,
	getMyHangoutWaitting,
	getUserOpenHangout,
} from '@/apis/hangoutApi'
import { getUserProfile, updateUserProfile } from '@/apis/userApis'

import { delay } from '@/ultis/common.ults'
import { onPushState, useQuery } from '@/ultis/route.ults'
import { getUserInfo } from '@/ultis/storage.ults'
import { randomString } from '@/ultis/string.ults'

type userDataProps = {
	is_open_hangout: boolean
	title_open_hangout: string
	latitude: null | number
	longitude: null | number
}
export default function useHangout() {
	const { toggleLoadingContext } = useLoading()
	const { openError, openSuccess } = useModal()
	const { onGetQuerry } = useQuery()
	const { id } = onGetQuerry()

	const _tabsOpenRef = useRef<any>()
	const [currentPage, setCurrentPage] = useState(0)
	const [modal, setModal] = useState({ type: '', data: null }) as any
	const [userData, setUserData] = useState<userDataProps>({
		is_open_hangout: false,
		title_open_hangout: '',
		latitude: null,
		longitude: null,
	})
	const [myWaitting, setMyWaitting] = useState([]) as any[]
	const [postId, setPostId] = useState('')
	const key = useRef<string>(randomString())
	const [loadingProfile, setLoadingProfile] = useState<boolean>(false)

	const [hangoutPeople, setHangoutPeople] = useState<any[]>([])
	const [totalHangout, setTotalHangout] = useState(0)

	const handleGetOpenHangout = async () => {
		try {
			const res: any = await getUserOpenHangout({
				fields: ['$all'],
				radius: 50,
			})
			if (res) {
				const { pagination, results } = res || {}
				const { rows } = results?.objects || {}
				const { total } = pagination || {}
				setHangoutPeople([getUserInfo(), ...rows])
				setTotalHangout(total || 0)
			}
		} catch (error) {
			openError(error)
		}
	}

	const handleGetUserProfile = async () => {
		const id = getUserInfo('id')
		setLoadingProfile(true)
		try {
			const res: any = await getUserProfile({
				id,
				params: {
					fields: ['$all'],
				},
			})
			const { code, results } = res || {}
			if (code === 200) {
				const { is_open_hangout, title_open_hangout, latitude, longitude } =
					results?.object || {}
				setUserData({
					is_open_hangout,
					title_open_hangout,
					latitude,
					longitude,
				})
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoadingProfile(false)
		}
	}
	const handleUpdateUserInfo = async (otherData) => {
		toggleLoadingContext(true)
		try {
			const payload = {
				...userData,
				...otherData,
			}
			const res = (await updateUserProfile(payload)) as any
			await delay(500)
			const { code, results } = res || {}

			if (code === 200) {
				const { is_open_hangout, title_open_hangout, latitude, longitude } =
					results?.object || {}
				setUserData({
					is_open_hangout,
					title_open_hangout,
					latitude,
					longitude,
				})
			}
		} catch (error) {
			openError(error)
		} finally {
			toggleLoadingContext()
		}
	}
	const handleOnChangeTitleHangout = async (values) => {
		setUserData((pre) => ({ ...pre, title_open_hangout: values }))
		setModal(null)
		try {
			await handleUpdateUserInfo({ title_open_hangout: values })
		} catch (error) {
			openError(error)
		}
	}

	const handleScroll = (e: any) => {
		const clientHeight = e.target.clientHeight
		const scrollHeight = e.target.scrollHeight
		const scrollTop = Math.abs(e.target.scrollTop)
		const isReachedEnd = scrollTop + clientHeight >= scrollHeight - 50
		if (!isReachedEnd) return
		if (_tabsOpenRef.current) {
			_tabsOpenRef.current?.onLoadMoreOpen()
		}
	}

	const handleGetMyWaitting = async () => {
		try {
			const res: any = await getMyHangoutWaitting({
				fields: [
					'$all',
					{
						user: [
							'name',
							'phone',
							'avatar',
							'languages_can_speak',
							'birthday',
							'id',
							'gender',
							'is_verified',
						],
					},
				],
				page: 1,
				limit: 50,
			})
			const { code, results } = res || {}
			if (code === 200) {
				const { rows } = results?.objects || {}

				setMyWaitting(rows || [])
			}
		} catch (error) {
			openError(error)
		}
	}

	const handleActionPart = async ({
		id,
		request_join_status,
	}: {
		id: string
		request_join_status: string
	}) => {
		toggleLoadingContext(true)
		try {
			const res: any = await actionParticipant({ id, request_join_status })
			if (res?.code === 200) {
				setMyWaitting((prev) => prev.filter((item) => item.id !== id))
				openSuccess({
					message: `You ${request_join_status.toLocaleLowerCase()} request !`,
				})
				if (request_join_status === 'ACCEPT') {
					const { post_id } = res?.results?.object || {}
					key.current = randomString()
					onPushState({ id: post_id })
				}
			}
		} catch (error) {
			openError(error)
		} finally {
			toggleLoadingContext(false)
		}
	}
	useEffect(() => {
		setPostId(id)
	}, [id])
	useEffect(() => {
		handleGetUserProfile()
		handleGetMyWaitting()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])
	useEffect(() => {
		if (userData.is_open_hangout) {
			handleGetOpenHangout()
		} else {
			setHangoutPeople([getUserInfo()])
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userData.is_open_hangout])
	return {
		userData,
		loadingProfile,
		_tabsOpenRef,
		currentPage,
		modal,
		myWaitting,
		postId,
		key,
		hangoutPeople,
		totalHangout,
		setPostId,
		setModal,
		setCurrentPage,
		onUpdateUserInfo: handleUpdateUserInfo,
		onScroll: handleScroll,
		onActionPart: handleActionPart,
		OnChangeTitleHangout: handleOnChangeTitleHangout,
		onGetMyWaitting: handleGetMyWaitting,
	}
}
