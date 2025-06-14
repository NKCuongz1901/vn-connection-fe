'use client'
import { useEffect, useState } from 'react'

import { useLoading } from '@/context/LoadingContext'
import { useModal } from '@/context/ModalContext'

import {
	actionParticipant,
	deleteMutiHangoutParticipantId,
	getMyHangoutWaitting,
} from '@/apis/hangoutApi'

type useModelMorePeopleProps = {
	id: string
	onClose?: any
}

export default function useModelMorePeople({
	id,
	onClose,
}: useModelMorePeopleProps) {
	const { toggleLoadingContext } = useLoading()
	const { openError, openSuccess } = useModal()

	const [myWaitting, setMyWaitting] = useState([]) as any[]

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
			}
		} catch (error) {
			openError(error)
		} finally {
			toggleLoadingContext(false)
		}
	}
	const handleActionMuti = async ({ type }: { type: string }) => {
		toggleLoadingContext(true)
		try {
			const res: any = await deleteMutiHangoutParticipantId({ type })
			if (res?.code === 200) {
				setMyWaitting((prev) => prev.filter((item) => item.id !== id))
				openSuccess({
					message: `You ${type.toLocaleLowerCase()} all request !`,
				})
				if (onClose) {
					onClose()
				}
			}
		} catch (error) {
			openError(error)
		} finally {
			toggleLoadingContext(false)
		}
	}
	useEffect(() => {
		handleGetMyWaitting()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])
	return {
		myWaitting,
		onActionPart: handleActionPart,
		onActionMuti: handleActionMuti,
	}
}
