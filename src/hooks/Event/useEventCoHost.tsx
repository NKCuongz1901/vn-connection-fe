import { ItemType } from 'antd/es/menu/interface'
import { useEffect, useRef, useState } from 'react'

import { useLoading } from '@/context/LoadingContext'
import { useModal } from '@/context/ModalContext'

import { getListParticipant, getPublicListParticipant, updateMemberPost } from '@/apis/postApis'

import { uniqueArray } from '@/ultis/array'
import { cloneDeep, delay } from '@/ultis/common'

import { paginationCommon } from '@/Variable/common.variable'
import { PaginationType } from '@/interface/common/common.interface'
import { participantType } from '@/Variable/event.variable'

export default function useEventCoHost({
	id,
	user,
	onCallBack = () => null,
	isPublic,
}: {
	id: string
	user: any
	onCallBack?: () => void
	isPublic?: boolean
}) {
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
			}
			const params = {
				fields: ['$all', { user: ['name', 'phone', 'avatar', 'is_verified'] }],
				where: isPublic
					? { post_id: id }
					: { post_id: id, type: participantType.ADMIN },
				page,
				limit: isPublic ? 100 : limit,
			}
			const res: any = await (isPublic
				? getPublicListParticipant(params)
				: getListParticipant(params))
			const { code, results } = res || {}
			await delay(1000)
			if (code === 200) {
				const { rows, count } = results?.objects || {}
				const adminRows = isPublic
					? (rows || []).filter((item) => item?.type === participantType.ADMIN)
					: rows || []
				const totalPage = Math.ceil((count || 0) / (limit || 1))
				_paginationRefs.current.totalPage = totalPage
				setParticipantList((prev: any[]) => {
					const contents = isNew ? [] : prev
					const _rows = adminRows.map((i) => {
						const { type } = i || {}
						return {
							...i,
							isAdmin: type === participantType.ADMIN,
							isOnwer: type === participantType.OWNER,
						}
					})
					const dataShow = uniqueArray([...contents, ..._rows], 'id') as any[]
					return dataShow
				})
				setTotal(isPublic ? adminRows.length : count)
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
				onCallBack()
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
						label: 'This activity only',
						onClick: () =>
							handleMenusClick({ key: 'ONLY_THIS_EVENT', id, isUpgrate }),
					},
					{
						key: 'ALL',
						label: 'All repeated activities',
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
	}, [id])

	return {
		total,
		openModal,
		loading,
		participantList,
		loadingCoHost,
		onSetOpenModal: handleSetOpenModal,
		onGetMenus: handleGetMenus,
		onMenusClick: handleMenusClick,
	}
}
