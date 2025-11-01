import { ItemType } from 'antd/es/menu/interface'
import { useEffect, useImperativeHandle, useRef, useState } from 'react'

import { useLoading } from '@/context/LoadingContext'
import { useModal } from '@/context/ModalContext'

import {
	deleteMember,
	getConvMembersById,
	updateRoleUser,
} from '@/apis/conversationApis'

import { isArray, uniqueArray } from '@/ultis/array.ults'
import { cloneDeep, delay, handleScrollCallback } from '@/ultis/common.ults'
import { handleGoToPage, useLocalePath } from '@/ultis/route.ults'
import { getUserInfo } from '@/ultis/storage.ults'

import { PaginationType } from '@/interface/common/common.interface'
import { ClubMemberProps } from '@/interface/Community/Community.interface'
import { mainRoutes } from '@/routes/MainRoutes'
import { paginationCommon } from '@/Variable/common.variable'

export default function useDetailCommunityMember(props, ref) {
	const { id } = props
	const { toggleLoadingContext } = useLoading()
	const { openError, openConfirm, openSuccess } = useModal()
	const { onGetPath } = useLocalePath()

	const _paginationRefs = useRef<PaginationType>(cloneDeep(paginationCommon))
	const _loadmore = useRef<boolean>(true)

	const [loading, setLoading] = useState({ admin: true, member: true })

	const [admins, setAdmins] = useState<ClubMemberProps[]>([])
	const [members, setMembers] = useState<ClubMemberProps[]>([])

	const [modal, setModal] = useState({ type: '', data: null }) as any
	const [total, setTotal] = useState({ member: 0 })
	const [name, setName] = useState('')

	const [isAdmin, setIsAdmin] = useState<boolean>(false)
	const handleGetAdmin = async (isNotLoading = false) => {
		if (!isNotLoading) {
			setLoading((prev) => ({ ...prev, admin: true }))
		}
		try {
			const payload = {
				id: id,
				admins: true,
				page: 1,
				limit: 20,
			}
			const res: any = await getConvMembersById(payload)
			const { rows } = res?.results?.objects || {}
			setAdmins(rows || [])
		} catch (error) {
			openError(error)
		} finally {
			setLoading((prev) => ({ ...prev, admin: false }))
		}
	}

	const handleGetMember = async (isNotLoading = false) => {
		setLoading((prev) => ({ ...prev, member: true }))

		try {
			const { page, limit } = _paginationRefs.current

			let isNew = page === 1
			if (isNotLoading) {
				isNew = false
			} else {
				if (isNew) {
					setMembers([])
				}
			}
			const payload = {
				id: id,
				page,
				limit,
				...(name && { name }),
			}
			const res: any = await getConvMembersById(payload)
			if (!isNotLoading) {
				await delay(500)
			}
			const { rows, count } = res?.results?.objects || {}

			_loadmore.current = isArray(rows, limit)
			setMembers((prev: ClubMemberProps[]) => {
				const contents = isNew ? [] : prev
				const dataShow = (
					!isNotLoading
						? uniqueArray([...contents, ...rows], 'id')
						: uniqueArray([...rows, ...contents], 'id')
				) as ClubMemberProps[]
				return dataShow
			})
			setTotal((prev) => ({ ...prev, member: count || 0 }))
		} catch (error) {
			openError(error)
		} finally {
			setLoading((prev) => ({ ...prev, member: false }))
		}
	}

	const handleUpdateRoleUser = async ({ member_id, type }) => {
		toggleLoadingContext(true)
		try {
			const isAdd = type === 'upAdm'
			await updateRoleUser({
				id,
				payload: {
					member_id,
					role: isAdd ? 'ADMIN' : 'MEMBER',
				},
			})
			handleGetAdmin(true)
			openSuccess({
				message: `${isAdd ? 'Add' : 'Remove'} administration successfull`,
			})
			setMembers((prev) =>
				prev.map((item) =>
					item.user_id === member_id
						? { ...item, type: isAdd ? 'ADMIN' : 'MEMBER' }
						: item,
				),
			)
		} catch (error) {
			openError(error)
		} finally {
			toggleLoadingContext()
		}
	}

	const handleDeleteMember = async ({ member_id }) => {
		toggleLoadingContext(true)
		try {
			await deleteMember({
				id,
				payload: {
					member_id,
				},
			})
			openSuccess({
				message: `Delete member successfull`,
			})

			setMembers((prev) => prev.filter((item) => item.user_id !== member_id))
			handleGetAdmin(true)
			setTotal((prev) => ({ ...prev, member: prev.member - 1 }))
		} catch (error) {
			openError(error)
		} finally {
			toggleLoadingContext()
		}
	}
	const handleMenusClick = ({
		key,
		value,
	}: {
		key: string
		value: ClubMemberProps
	}) => {
		const { user_id } = value
		switch (key) {
			case 'view':
				const url = onGetPath(`${mainRoutes.profile}/${user_id}`)
				handleGoToPage(url, '_blank')
				break
			case 'removeAdm':
			case 'upAdm':
				const isAdd = key === 'upAdm'
				openConfirm({
					message: `Are you sure want to ${
						isAdd ? 'add' : 'remove'
					} administration ?`,
					onAccept: () =>
						handleUpdateRoleUser({ member_id: user_id, type: key }),
				})
				break
			case 'delete':
				openConfirm({
					message: `Are you sure want to delete this member ?`,
					onAccept: () => handleDeleteMember({ member_id: user_id }),
				})
				break
			default:
				break
		}
	}

	const handleGetMenus = ({ item }: { item: ClubMemberProps }) => {
		const { type } = item
		const isAdmin = type === 'ADMIN'
		const menus: ItemType[] = [
			{
				key: 'view',
				label: 'View profile',
				onClick: () => handleMenusClick({ key: 'view', value: item }),
			},
		]
		if (isAdmin) {
			menus.push({
				key: 'removeAdm',
				label: 'Remove administration',
				onClick: () => handleMenusClick({ key: 'removeAdm', value: item }),
			})
		} else {
			menus.push({
				key: 'upAdm',
				label: 'Add user as admin',
				onClick: () => handleMenusClick({ key: 'upAdm', value: item }),
			})
		}
		menus.push({
			key: 'delete',
			label: 'Remove member',
			style: { color: '#F80024' },
			onClick: () => handleMenusClick({ key: 'delete', value: item }),
		})
		return menus
	}
	const handleSuccess = ({ key, value }) => {
		const { member_id } = value || {}
		switch (key) {
			case 'addAdmin':
				handleGetAdmin(true)
				setMembers((prev) =>
					prev.map((item) =>
						item.user_id === member_id ? { ...item, type: 'ADMIN' } : item,
					),
				)
				break

			default:
				break
		}
	}
	const handleLoadMore = async () => {
		if (!_loadmore.current || loading.member) return
		const { limit } = _paginationRefs.current
		const currentPage = Math.trunc((members || []).length / limit)
		_paginationRefs.current.page = currentPage + 1
		handleGetMember()
	}

	const handleScroll = (e) => {
		handleScrollCallback(e, handleLoadMore)
	}

	useImperativeHandle(
		ref,
		() => ({
			...(ref.current || {}),
			onGetMember: handleGetMember,
		}),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[id],
	)
	useEffect(() => {
		handleGetAdmin()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	useEffect(() => {
		const timer = setTimeout(() => {
			_loadmore.current = true
			_paginationRefs.current.page = 1
			handleGetMember()
		}, 500)

		return () => clearTimeout(timer)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [name])

	useEffect(() => {
		const item = admins.find((i) => i.user_id === getUserInfo('id'))
		setIsAdmin(!!item)
	}, [admins])

	return {
		isAdmin,
		loading,
		admins,
		members,
		modal,
		name,
		total,

		setName,
		setModal,
		onGetMenus: handleGetMenus,
		onSuccess: handleSuccess,
		onScroll: handleScroll,
	}
}
