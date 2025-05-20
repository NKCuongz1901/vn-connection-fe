import { ItemType } from 'antd/es/menu/interface'
import { useEffect, useRef, useState } from 'react'

import { useLoading } from '@/context/LoadingContext'
import { useModal } from '@/context/ModalContext'

import { getListParticipant, updateMemberPost } from '@/apis/postApis'

import { uniqueArray } from '@/ultis/array.ults'
import { cloneDeep, delay } from '@/ultis/common.ults'

import { paginationCommon } from '@/Variable/common.variable'
import { PaginationType } from '@/interface/common/common.interface'

export default function useEventCoHost({ id, user }: any) {
	const { openError, openConfirm, openSuccess } = useModal()
	const { toggleLoadingContext } = useLoading()
	const _paginationRefs = useRef<PaginationType>(cloneDeep(paginationCommon))
	const [participantList, setParticipantList] = useState([]) as any[]
	const [total, setTotal] = useState(0)
	const [loading, setLoading] = useState(false)
	const [loadingCoHost, setLoadingCoHost] = useState(false)
	const [openModal, setOpenModal] = useState<{
		type: any
		dataModal: any
	}>({
		type: null,
		dataModal: null,
	})

	const handleGetListParticipant = async () => {
		setLoading(true)
		try {
			const { page, limit } = _paginationRefs.current
			const isNew = page === 1
			if (isNew) {
				setParticipantList([])
			}
			const params = {
				fields: ['$all', { user: ['name', 'phone', 'avatar', 'is_verified'] }],
				where: { post_id: id, type: 'ADMIN' },
				page,
				limit,
			}
			const res: any = await getListParticipant(params)
			const { code, results } = res || {}
			await delay(1000)
			if (code === 200) {
				const { rows, count } = results?.objects || {}
				const totalPage = Math.ceil((count || 0) / (limit || 1))
				_paginationRefs.current.totalPage = totalPage
				setParticipantList((prev: any[]) => {
					const contents = isNew ? [] : prev
					const dataShow = uniqueArray([...contents, ...rows], 'id') as any[]
					return dataShow
				})
				setTotal(count)
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoading(false)
		}
	}

	const handleSetOpenModal = ({
		type = null,
		dataModal = null,
	}: {
		type?: any
		dataModal?: any
	}) => {
		setOpenModal({ type, dataModal })
	}
	const handleAddCoHost = async ({
		key,
		id: user_id,
		isUpgrate,
	}: {
		key: string
		id: string
		isUpgrate: boolean
	}) => {
		const payload = {
			post_id: id,
			user_id: user_id,
			action_for: key,
			action: isUpgrate ? 'UPGRADE_TO_ADMIN' : 'DOWNGRADE_TO_MEMBER',
		}
		setLoadingCoHost(true)
		toggleLoadingContext(true)
		try {
			const res: any = await updateMemberPost(payload)
			const { code } = res || {}
			if (code === 200) {
				_paginationRefs.current.page = 1
				await handleGetListParticipant()
				openSuccess({
					message: isUpgrate
						? 'Add co-host successfully'
						: 'Delete co-host successfully',
				})
			}
		} catch (error) {
			openError(error)
		} finally {
			setLoadingCoHost(false)
			toggleLoadingContext(false)
		}
	}

	const handleGetMenus = ({
		id,
		isUpgrate,
	}: {
		id: string
		isUpgrate: boolean
	}) => {
		const { id: adm_id } = user || {}
		const isAdm = adm_id === id

		const menus: ItemType[] = isAdm
			? []
			: [
					{
						key: 'ONLY_THIS_EVENT',
						label: 'This event only',
						onClick: () =>
							handleMenusClick({ key: 'ONLY_THIS_EVENT', id, isUpgrate }),
					},
					{
						key: 'ALL',
						label: 'All repeated events',
						onClick: () => handleMenusClick({ key: 'ALL', id, isUpgrate }),
					},
			  ]
		return menus
	}
	const handleMenusClick = ({
		key,
		id,
		isUpgrate,
	}: {
		key: string
		id: string
		isUpgrate: boolean
	}) => {
		switch (key) {
			case 'ALL':
			case 'ONLY_THIS_EVENT':
				openConfirm({
					message: isUpgrate
						? 'Do you want to add this user to co-host list?'
						: 'Do you want to delete this user from co-host list?',
					onAccept: () => {
						handleAddCoHost({ key, id, isUpgrate })
					},
					titleLabel: isUpgrate ? 'Add co host' : 'Delete co host',
				})
				break
			default:
				break
		}
	}

	useEffect(() => {
		handleGetListParticipant()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return {
		total,
		openModal,
		loading,
		participantList,
		loadingCoHost,
		onSetOpenModal: handleSetOpenModal,
		onGetMenus: handleGetMenus,
	}
}
